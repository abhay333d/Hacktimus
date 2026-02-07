const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'chaser.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database at ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database at: ' + dbPath);
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            role TEXT DEFAULT 'user'
        )`);

        // Create Tasks table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            assignee_id INTEGER,
            due_date TEXT,
            status TEXT DEFAULT 'PENDING', 
            last_chased_at TEXT,
            chase_count INTEGER DEFAULT 0,
            FOREIGN KEY (assignee_id) REFERENCES users(id)
        )`);

        // Create Logs table
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER,
            chase_type TEXT, -- 'MANUAL' or 'AUTO'
            message_sent TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id)
        )`);
        
        // Seed some data if users table is empty
        db.get("SELECT count(*) as count FROM users", (err, row) => {
            if (row.count === 0) {
                 console.log("Seeding initial data...");
                 const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
                 stmt.run("Alice Engineer", "alice@example.com");
                 stmt.run("Bob Manager", "bob@example.com");
                 stmt.finalize();
            }
        });
    });
}

module.exports = db;
