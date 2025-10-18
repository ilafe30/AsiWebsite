import Database from 'better-sqlite3';
import path from 'path';

// Existing readonly DB used by analytics/admin
const aiDbPath = path.join(process.cwd(), 'ai_agent', 'data', 'database', 'nanonets_extraction.db');

// New auth database for users and sessions (read/write)
const authDbPath = path.join(process.cwd(), 'unified_extraction.db');

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(aiDbPath, { readonly: true });
  }

  getCandidatures(status?: string) {
    const query = status 
      ? 'SELECT * FROM candidatures WHERE status = ? ORDER BY submission_date DESC'
      : 'SELECT * FROM candidatures ORDER BY submission_date DESC';
    
    return status ? this.db.prepare(query).all(status) : this.db.prepare(query).all();
  }

  getCandidatureWithAnalysis(candidatureId: number) {
    const query = `
      SELECT c.*, ar.total_score, ar.is_eligible, ar.ai_response_text, ar.structured_result 
      FROM candidatures c 
      LEFT JOIN analysis_results ar ON c.analysis_result_id = ar.id 
      WHERE c.id = ?
    `;
    return this.db.prepare(query).get(candidatureId);
  }

  /**
   * Paginated applications listing with optional filters used by Admin Dashboard
   */
  getApplications(params: {
    status?: string;
    dateFrom?: string; // ISO date string
    dateTo?: string;   // ISO date string
    limit: number;
    offset: number;
  }) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.status) {
      conditions.push('c.status = ?');
      values.push(params.status);
    }
    if (params.dateFrom) {
      conditions.push('date(c.submission_date) >= date(?)');
      values.push(params.dateFrom);
    }
    if (params.dateTo) {
      conditions.push('date(c.submission_date) <= date(?)');
      values.push(params.dateTo);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const listQuery = `
      SELECT 
        c.id,
        c.business_name AS name,
        c.contact_email AS email,
        c.submission_date,
        c.status,
        c.analysis_result_id,
        ar.total_score,
        ar.is_eligible,
        c.email_sent,
        c.email_sent_date
      FROM candidatures c
      LEFT JOIN analysis_results ar ON c.analysis_result_id = ar.id
      ${where}
      ORDER BY datetime(c.submission_date) DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM candidatures c
      ${where}
    `;

    const items = this.db.prepare(listQuery).all(...values, params.limit, params.offset);
    const { total } = this.db.prepare(countQuery).get(...values) as { total: number };
    return { items, total };
  }

  getReport(candidatureId: number) {
    return this.getCandidatureWithAnalysis(candidatureId);
  }

  getStats() {
    const totalQuery = 'SELECT COUNT(*) as total FROM candidatures';
    const eligibleQuery = 'SELECT COUNT(*) as eligible FROM candidatures c JOIN analysis_results ar ON c.analysis_result_id = ar.id WHERE ar.is_eligible = 1';
    const avgScoreQuery = 'SELECT AVG(ar.total_score) as avg_score FROM analysis_results ar';

    return {
      total: this.db.prepare(totalQuery).get(),
      eligible: this.db.prepare(eligibleQuery).get(),
      avgScore: this.db.prepare(avgScoreQuery).get()
    };
  }

  close() {
    this.db.close();
  }
}

export class AuthDatabaseService {
  private db: Database.Database;

  constructor() {
    // Ensure the database opens in read/write and creates if missing
    this.db = new Database(authDbPath);
    this.initializeSchema();
  }

  private initializeSchema() {
    // Users table and email verification tokens
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        email_verified INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_tokens_user ON email_verification_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_tokens_token ON email_verification_tokens(token);
    `);
  }

  createUser(params: { startup_name: string; email: string; password_hash: string }) {
    const stmt = this.db.prepare(
      'INSERT INTO users (startup_name, email, password_hash) VALUES (?, ?, ?)'
    );
    const info = stmt.run(params.startup_name, params.email, params.password_hash);
    return info.lastInsertRowid as number;
  }

  getUserByEmail(email: string) {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | {
          id: number;
          startup_name: string;
          email: string;
          password_hash: string;
          role: string;
          email_verified: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;
  }

  getUserById(id: number) {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  }

  markEmailVerified(userId: number) {
    this.db.prepare('UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
  }

  createVerificationToken(userId: number, token: string, expiresAtIso: string) {
    const stmt = this.db.prepare(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)' 
    );
    stmt.run(userId, token, expiresAtIso);
  }

  getVerificationToken(token: string) {
    return this.db
      .prepare('SELECT * FROM email_verification_tokens WHERE token = ?')
      .get(token) as
      | { id: number; user_id: number; token: string; expires_at: string; created_at: string }
      | undefined;
  }

  deleteVerificationToken(id: number) {
    this.db.prepare('DELETE FROM email_verification_tokens WHERE id = ?').run(id);
  }

  // User management methods for admin
  listUsers(params?: { limit?: number; offset?: number; role?: string }) {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const roleFilter = params?.role;

    let query = 'SELECT id, startup_name, email, role, email_verified, created_at FROM users';
    const values: any[] = [];

    if (roleFilter) {
      query += ' WHERE role = ?';
      values.push(roleFilter);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const items = this.db.prepare(query).all(...values);
    
    const countQuery = roleFilter 
      ? 'SELECT COUNT(*) as total FROM users WHERE role = ?' 
      : 'SELECT COUNT(*) as total FROM users';
    const countValues = roleFilter ? [roleFilter] : [];
    const { total } = this.db.prepare(countQuery).get(...countValues) as { total: number };

    return { items, total };
  }

  updateUser(id: number, params: { startup_name?: string; email?: string; role?: string }) {
    const updates: string[] = [];
    const values: any[] = [];

    if (params.startup_name !== undefined) {
      updates.push('startup_name = ?');
      values.push(params.startup_name);
    }
    if (params.email !== undefined) {
      updates.push('email = ?');
      values.push(params.email);
    }
    if (params.role !== undefined) {
      updates.push('role = ?');
      values.push(params.role);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    this.db.prepare(query).run(...values);
  }

  deleteUser(id: number) {
    this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }

  updatePassword(id: number, passwordHash: string) {
    this.db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, id);
  }

  close() {
    this.db.close();
  }
}

/**
 * Standalone function to update email status in the AI database.
 * Opens a temporary read/write connection to avoid altering the main readonly service.
 */
export function updateApplicationEmailStatus(candidatureId: number, sent: boolean) {
  const db = new Database(aiDbPath); // read/write
  try {
    const stmt = db.prepare(
      'UPDATE candidatures SET email_sent = ?, email_sent_date = ? WHERE id = ?'
    );
    const now = sent ? new Date().toISOString() : null;
    stmt.run(sent ? 1 : 0, now, candidatureId);
  } finally {
    db.close();
  }
}