const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
// CHANGE 1: Import axios here
const axios = require('axios'); 

const app = express();
const PORT = 3001;

// Define your Boltic Webhook URL here for easy reuse
const BOLTIC_WEBHOOK_URL = "https://asia-south1.api.boltic.io/service/webhook/temporal/v1.0/f1538e24-b148-451f-bebc-317b3d530547/workflows/execute/83ba9b24-ed5b-4f83-be99-9b4ad3e00196";

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

// CHANGE 2: Updated Manual Chase Trigger
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
        
        let message = `Hi ${task.name}, just checking in on "${task.title}".`;
        if (daysOverdue > 0) {
            message = `Hi ${task.name}, the task "${task.title}" is ${daysOverdue} days overdue. Can you please provide an update?`;
        } else if (daysOverdue === 0) {
            message = `Hi ${task.name}, friendly reminder that "${task.title}" is due today!`;
        }

        // 3. Log the Chase
        await dbRun(`INSERT INTO logs (task_id, chase_type, message_sent) VALUES (?, 'MANUAL', ?)`, [taskId, message]);
        
        // 4. Update Task Chase Count
        await dbRun(`UPDATE tasks SET last_chased_at = ?, chase_count = chase_count + 1 WHERE id = ?`, [new Date().toISOString(), taskId]);
        
        // 5. BOLTIC INTEGRATION (Real Call)
        console.log(`[BOLTIC INTEGRATION] Sending webhook: To=${task.email}, Msg="${message}"`);
        
        // Construct the payload matching what you set up in Boltic
        const bolticPayload = {
            email: task.email,
            message: message,
            user_name: task.name,
            task_id: taskId
        };

        // Send to Boltic
        await axios.post(BOLTIC_WEBHOOK_URL, bolticPayload);

        res.json({ success: true, message: "Chase initiated via Boltic", sent_message: message });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// CHANGE 3: Updated Automated Check Endpoint
app.get('/tasks/check-overdue', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const query = `
            SELECT tasks.*, users.name, users.email 
            FROM tasks 
            JOIN users ON tasks.assignee_id = users.id 
            WHERE tasks.due_date < ? 
            AND tasks.status != 'COMPLETED'
            AND (tasks.last_chased_at IS NULL OR substr(tasks.last_chased_at, 1, 10) != ?)
        `;
        
        const overdueTasks = await dbAll(query, [today, today]);
        const chases = [];

        // Loop through every overdue task found
        for (const task of overdueTasks) {
             const message = `Automated Reminder: Hi ${task.name}, "${task.title}" is overdue. Please prioritize.`;
             
             // Log locally
             await dbRun(`INSERT INTO logs (task_id, chase_type, message_sent) VALUES (?, 'AUTO', ?)`, [task.id, message]);
             
             // Update Task locally
             await dbRun(`UPDATE tasks SET last_chased_at = ?, chase_count = chase_count + 1 WHERE id = ?`, [new Date().toISOString(), task.id]);
             
             // Call Boltic for THIS specific task
             console.log(`[BOLTIC AUTO] Sending webhook: To=${task.email}`);
             
             try {
                 await axios.post(BOLTIC_WEBHOOK_URL, {
                    email: task.email,
                    message: message,
                    user_name: task.name,
                    task_id: task.id
                 });
                 chases.push({ task_id: task.id, sent_to: task.email, status: 'sent' });
             } catch (bolticError) {
                 console.error(`Failed to send Boltic msg for task ${task.id}:`, bolticError.message);
                 chases.push({ task_id: task.id, sent_to: task.email, status: 'failed' });
             }
        }

        res.json({ success: true, chased_count: chases.length, details: chases });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});