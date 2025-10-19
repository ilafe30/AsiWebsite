CREATE TABLE IF NOT EXISTS user_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  startup_id INTEGER NOT NULL,
  objective TEXT NOT NULL,
  description TEXT,
  period TEXT CHECK(period IN ('monthly', 'quarterly')) NOT NULL,
  deadline TEXT NOT NULL,
  status TEXT CHECK(status IN ('To Do', 'Ongoing', 'Done')) NOT NULL DEFAULT 'To Do',
  progress INTEGER CHECK(progress >= 0 AND progress <= 100) DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (startup_id) REFERENCES users(id) ON DELETE CASCADE
);