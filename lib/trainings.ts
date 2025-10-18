import Database from "better-sqlite3";
import path from "path";

// Use the existing AI database file
const aiDbPath = path.join(process.cwd(), "ai_agent", "data", "database", "nanonets_extraction.db");

function getDbRW() {
  // open read/write connection
  return new Database(aiDbPath);
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS trainings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,           -- ISO yyyy-mm-dd
      time TEXT NOT NULL,           -- HH:mm
      description TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(title, date)
    );
  `);
}

export type Training = {
  id: number;
  title: string;
  date: string;
  time: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export function listTrainings(params?: { limit?: number; offset?: number }): { items: Training[]; total: number } {
  const db = getDbRW();
  try {
    initSchema(db);
    
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    
    const items = db.prepare(
      "SELECT * FROM trainings ORDER BY date ASC, time ASC LIMIT ? OFFSET ?"
    ).all(limit, offset) as Training[];
    
    const { total } = db.prepare("SELECT COUNT(*) as total FROM trainings").get() as { total: number };
    
    return { items, total };
  } finally {
    db.close();
  }
}

export function createTraining(input: { title: string; date: string; time: string; description?: string }): number {
  const db = getDbRW();
  try {
    initSchema(db);
    const stmt = db.prepare(
      "INSERT INTO trainings (title, date, time, description) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(input.title.trim(), input.date, input.time, input.description ?? null);
    return Number(info.lastInsertRowid);
  } catch (e: any) {
    // SQLITE_CONSTRAINT for UNIQUE(title,date)
    if (String(e?.message).includes("UNIQUE") || String(e?.code) === "SQLITE_CONSTRAINT") {
      throw new Error("Duplicate training for the same title and date");
    }
    throw e;
  } finally {
    db.close();
  }
}

export function updateTraining(id: number, input: { title: string; date: string; time: string; description?: string }) {
  const db = getDbRW();
  try {
    initSchema(db);
    const stmt = db.prepare(
      "UPDATE trainings SET title = ?, date = ?, time = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    );
    stmt.run(input.title.trim(), input.date, input.time, input.description ?? null, id);
  } catch (e: any) {
    if (String(e?.message).includes("UNIQUE") || String(e?.code) === "SQLITE_CONSTRAINT") {
      throw new Error("Duplicate training for the same title and date");
    }
    throw e;
  } finally {
    db.close();
  }
}

export function deleteTraining(id: number) {
  const db = getDbRW();
  try {
    initSchema(db);
    db.prepare("DELETE FROM trainings WHERE id = ?").run(id);
  } finally {
    db.close();
  }
}
