const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const axios = require('axios'); 

const app = express();
const PORT = 3001;

const BOLTIC_WEBHOOK_URL = "https://asia-south1.api.boltic.io/service/webhook/temporal/v1.0/f1538e24-b148-451f-bebc-317b3d530547/workflows/execute/bd426dd3-5b96-46b2-8aa3-c4202ded98f8";

app.use(cors());
app.use(bodyParser.json());

// Helper to wrap db.all in promise
const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Helper to wrap db.run in promise
const dbRun = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// --- API Routes ---

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const query = `
            SELECT tasks.*, users.name as assignee_name, users.email as assignee_email
            FROM tasks
            LEFT JOIN users ON tasks.assignee_id = users.id
            ORDER BY tasks.due_date ASC
        `;
        const tasks = await dbAll(query);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a task
app.post('/tasks', async (req, res) => {
    const { title, description, assignee_id, due_date } = req.body;
    try {
        const result = await dbRun(
            `INSERT INTO tasks (title, description, assignee_id, due_date) VALUES (?, ?, ?, ?)`,
            [title, description, assignee_id, due_date]
        );
        res.status(201).json({ id: result.lastID, title, description, assignee_id, due_date, status: 'PENDING' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Users
app.get('/users', async (req, res) => {
    try {
        const users = await dbAll("SELECT * FROM users");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manual Chase Trigger
app.post('/tasks/:id/chase', async (req, res) => {
    const taskId = req.params.id;
    try {
        // 1. Fetch Task Context
        const task = await new Promise((resolve, reject) => {
            db.get(`SELECT tasks.*, users.name, users.email FROM tasks JOIN users ON tasks.assignee_id = users.id WHERE tasks.id = ?`, [taskId], (err, row) => {
                if(err) reject(err);
                if(!row) reject(new Error('Task not found'));
                resolve(row);
            });
        });

        // 2. Generate Message
        const now = new Date();
        const dueDate = new Date(task.due_date);
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        
        // Sanitize inputs (remove quotes, newlines, backslashes)
        const safeTitle = (task.title || "").replace(/["\n\r\\]/g, " ").trim();
        const safeName = (task.name || "").replace(/["\n\r\\]/g, " ").trim();
        const safeEmail = (task.email || "").trim();

        let message = `Hi ${safeName}, just checking in on '${safeTitle}'.`;
        if (daysOverdue > 0) {
            message = `Hi ${safeName}, the task '${safeTitle}' is ${daysOverdue} days overdue. Can you please provide an update?`;
        } else if (daysOverdue === 0) {
            message = `Hi ${safeName}, friendly reminder that '${safeTitle}' is due today!`;
        }

        // 3. Log the Chase
        await dbRun(`INSERT INTO logs (task_id, chase_type, message_sent) VALUES (?, 'MANUAL', ?)`, [taskId, message]);
        
        // 4. Update Task Chase Count
        await dbRun(`UPDATE tasks SET last_chased_at = ?, chase_count = chase_count + 1 WHERE id = ?`, [new Date().toISOString(), taskId]);
        
        // 5. BOLTIC INTEGRATION (Real Call)
        // //console.log(`[BOLTIC INTEGRATION] Sending webhook to: ${task.email}`);
        
        // Construct the payload matching what you set up in Boltic
        const bolticPayload = {
            email: safeEmail,
            message: message,     // message is constructed from safeTitle/safeName
            user_name: safeName,  // USE SAFE NAME
            task_id: taskId
        };

        // //console.log("[BOLTIC PAYLOAD JSON]", JSON.stringify(bolticPayload));

        // Send to Boltic
        await axios.post(BOLTIC_WEBHOOK_URL, bolticPayload);

        res.json({ success: true, message: "Chase initiated via Boltic", sent_message: message });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update Task Status
app.patch('/tasks/:id/status', async (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'PENDING' or 'COMPLETED'." });
    }

    try {
        await dbRun('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
        res.json({ success: true, taskId, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Task Endpoint
app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        await dbRun('DELETE FROM tasks WHERE id = ?', [taskId]);
        // Optional: Delete associated logs if you want to clean up
        await dbRun('DELETE FROM logs WHERE task_id = ?', [taskId]);
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Updated Automated Check Endpoint
app.get('/tasks/check-overdue', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const query = `
            SELECT tasks.*, users.name, users.email 
            FROM tasks 
            JOIN users ON tasks.assignee_id = users.id 
            WHERE tasks.due_date < ? 
            AND tasks.status != 'COMPLETED'
        `;
        
        const overdueTasks = await dbAll(query, [today]);
        const chases = [];
        
        // 1. Process Database Updates Sequentially (Safe for SQLite)
        for (const task of overdueTasks) {
             const safeAutoTitle = (task.title || "").replace(/["\n\r\\]/g, " ").trim();
             const safeAutoName = (task.name || "").replace(/["\n\r\\]/g, " ").trim();
             const message = `Automated Reminder: Hi ${safeAutoName}, the task '${safeAutoTitle}' is overdue. Please prioritize.`;
             
             // Log locally
             await dbRun(`INSERT INTO logs (task_id, chase_type, message_sent) VALUES (?, 'AUTO', ?)`, [task.id, message]);
             
             // Update Task locally
             await dbRun(`UPDATE tasks SET last_chased_at = ?, chase_count = chase_count + 1 WHERE id = ?`, [new Date().toISOString(), task.id]);
             
             chases.push({ 
                 task, 
                 message, 
                 safeAutoName, 
                 safeAutoEmail: (task.email || "").trim() 
            });
        }

        // 2. Send Boltic Webhooks in Parallel (Faster)
        const webhookPromises = chases.map(async (item) => {
             //console.log(`[BOLTIC AUTO] Sending webhook: To=${item.safeAutoEmail}`);
             try {
                 const autoPayload = {
                    email: item.safeAutoEmail,
                    message: item.message,
                    user_name: item.safeAutoName,
                    task_id: item.task.id
                 };
                 await axios.post(BOLTIC_WEBHOOK_URL, autoPayload);
                 return { task_id: item.task.id, status: 'sent' };
             } catch (bolticError) {
                 console.error(`Failed to send Boltic msg for task ${item.task.id}:`, bolticError.message);
                 return { task_id: item.task.id, status: 'failed', error: bolticError.message };
             }
        });

        const results = await Promise.all(webhookPromises);

        res.json({ success: true, chased_count: results.length, details: results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    //console.log(`Server running on http://localhost:${PORT}`);
});