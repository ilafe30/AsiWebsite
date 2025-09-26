import Database from 'better-sqlite3';
import path from 'path';

// Use the ai_agent database path
const dbPath = path.join(process.cwd(), 'ai_agent', 'data', 'database', 'nanonets_extraction.db');

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(dbPath, { readonly: true });
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