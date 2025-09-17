import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'ASI', 'project2', 'phase1', 'objectif1.2', 'data', 'database', 'nanonets_extraction.db');

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