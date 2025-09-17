#!/usr/bin/env python3
"""
🗄️ Database Manager for Business Plan Analysis Results
======================================================

This module implements the "Stockage des résultats d'analyse" task:
- Creates analysis_results table with proper structure
- Links analysis results to business plan candidatures
- Provides CRUD operations for candidatures and results
- Ensures data integrity and proper relationships
"""

import sqlite3
import json
import logging
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get the absolute path to the database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, 'data', 'database', 'nanonets_extraction.db')

@dataclass
class Candidature:
    """Represents a business plan candidature."""
    id: int
    business_name: str
    contact_email: str
    submission_date: str
    status: str  # 'pending', 'analyzed', 'accepted', 'rejected', 'failed'
    pdf_filename: str
    pdf_path: str
    extracted_text_id: Optional[int] = None
    analysis_result_id: Optional[int] = None

@dataclass
class AnalysisResult:
    """Represents an AI analysis result."""
    id: int
    candidature_id: int
    ai_response_text: str
    structured_result: Dict[str, Any]
    total_score: float
    is_eligible: bool
    analysis_date: str
    model_used: str
    processing_time: float
    confidence_score: Optional[float] = None

class DatabaseManager:
    """
    Manages the database for business plan analysis results.
    Implements the "Stockage des résultats d'analyse" task.
    """
    
    def __init__(self, db_path: str = DB_PATH):
        """Initialize the database manager."""
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        # Ensure database directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """Initialize database connection and create required tables."""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.cursor = self.conn.cursor()
            
            # Create candidatures table
            self._create_candidatures_table()
            
            # Create analysis_results table
            self._create_analysis_results_table()
            
            # Create candidature_management table for tracking operations
            self._create_candidature_management_table()
            
            # Add indexes for better performance
            self._create_indexes()
            
            self.conn.commit()
            logger.info("✅ Database initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    def _create_candidatures_table(self):
        """Create the candidatures table."""
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidatures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_name TEXT NOT NULL,
                contact_email TEXT NOT NULL,
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'accepted', 'rejected', 'failed')),
                pdf_filename TEXT NOT NULL,
                pdf_path TEXT NOT NULL,
                extracted_text_id INTEGER,
                analysis_result_id INTEGER,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                report_filename TEXT,
                report_generated BOOLEAN DEFAULT 0,
                report_access_token TEXT,
                email_sent BOOLEAN DEFAULT 0,
                email_sent_date TIMESTAMP
            )
        ''')
        logger.info("✅ Candidatures table created/verified")
    
    def _create_analysis_results_table(self):
        """Create the analysis_results table for storing AI analysis results."""
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS analysis_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidature_id INTEGER NOT NULL,
                ai_response_text TEXT NOT NULL,
                structured_result TEXT NOT NULL,  -- JSON string
                total_score REAL NOT NULL,
                is_eligible BOOLEAN NOT NULL,
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                model_used TEXT NOT NULL,
                processing_time REAL NOT NULL,
                confidence_score REAL,
                criteria_breakdown TEXT,  -- JSON string for detailed criteria scores
                recommendations TEXT,     -- JSON string for recommendations
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidature_id) REFERENCES candidatures (id) ON DELETE CASCADE
            )
        ''')
        logger.info("✅ Analysis results table created/verified")
    
    def _create_candidature_management_table(self):
        """Create table for tracking candidature management operations."""
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidature_management (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidature_id INTEGER NOT NULL,
                operation TEXT NOT NULL,  -- 'created', 'updated', 'deleted', 'status_changed'
                old_value TEXT,
                new_value TEXT,
                operation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_notes TEXT,
                FOREIGN KEY (candidature_id) REFERENCES candidatures (id)
            )
        ''')
        logger.info("✅ Candidature management table created/verified")
    
    def _create_indexes(self):
        """Create indexes for better query performance."""
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_candidatures_status ON candidatures(status)",
            "CREATE INDEX IF NOT EXISTS idx_candidatures_submission_date ON candidatures(submission_date)",
            "CREATE INDEX IF NOT EXISTS idx_analysis_results_candidature_id ON analysis_results(candidature_id)",
            "CREATE INDEX IF NOT EXISTS idx_analysis_results_score ON analysis_results(total_score)",
            "CREATE INDEX IF NOT EXISTS idx_analysis_results_eligible ON analysis_results(is_eligible)"
        ]
        
        for index_sql in indexes:
            try:
                self.cursor.execute(index_sql)
            except Exception as e:
                logger.warning(f"⚠️ Index creation warning: {e}")
        
        logger.info("✅ Database indexes created/verified")
    
    def create_candidature(self, business_name: str, contact_email: str, 
                          pdf_filename: str, pdf_path: str, 
                          extracted_text_id: Optional[int] = None) -> int:
        """
        Create a new candidature record.
        
        Args:
            business_name: Name of the business
            contact_email: Contact email
            pdf_filename: Original PDF filename
            pdf_path: Path to the PDF file
            extracted_text_id: ID of extracted text (optional)
            
        Returns:
            ID of the created candidature
        """
        try:
            self.cursor.execute('''
                INSERT INTO candidatures 
                (business_name, contact_email, pdf_filename, pdf_path, extracted_text_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (business_name, contact_email, pdf_filename, pdf_path, extracted_text_id))
            
            candidature_id = self.cursor.lastrowid
            
            # Log the operation
            self._log_operation(candidature_id, 'created', None, f"Business: {business_name}")
            
            self.conn.commit()
            logger.info(f"✅ Candidature created with ID: {candidature_id}")
            return candidature_id
            
        except Exception as e:
            logger.error(f"❌ Failed to create candidature: {e}")
            self.conn.rollback()
            raise
    
    def store_analysis_result(self, candidature_id: int, ai_response_text: str,
                            structured_result: Dict[str, Any], total_score: float,
                            is_eligible: bool, model_used: str, processing_time: float,
                            confidence_score: Optional[float] = None) -> int:
        """
        Store AI analysis result in the database.
        
        Args:
            candidature_id: ID of the candidature
            ai_response_text: Raw AI response text
            structured_result: Structured analysis result
            total_score: Total evaluation score
            is_eligible: Whether the candidature is eligible
            model_used: AI model used for analysis
            processing_time: Time taken for analysis
            confidence_score: Confidence score (optional)
            
        Returns:
            ID of the created analysis result
        """
        try:
            # Convert structured result to JSON string
            structured_result_json = json.dumps(structured_result, ensure_ascii=False)
            
            # Extract criteria breakdown and recommendations
            criteria_breakdown = json.dumps(
                structured_result.get('criteria_results', []), 
                ensure_ascii=False
            )
            recommendations = json.dumps(
                structured_result.get('recommendations', []), 
                ensure_ascii=False
            )
            
            self.cursor.execute('''
                INSERT INTO analysis_results 
                (candidature_id, ai_response_text, structured_result, total_score, 
                 is_eligible, model_used, processing_time, confidence_score,
                 criteria_breakdown, recommendations)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (candidature_id, ai_response_text, structured_result_json, total_score,
                  is_eligible, model_used, processing_time, confidence_score,
                  criteria_breakdown, recommendations))
            
            analysis_result_id = self.cursor.lastrowid
            
            # Update candidature with analysis result ID and status
            self.cursor.execute('''
                UPDATE candidatures 
                SET analysis_result_id = ?, status = 'analyzed', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (analysis_result_id, candidature_id))
            
            # Log the operation
            self._log_operation(candidature_id, 'status_changed', 'pending', 'analyzed')
            
            self.conn.commit()
            logger.info(f"✅ Analysis result stored with ID: {analysis_result_id}")
            return analysis_result_id
            
        except Exception as e:
            logger.error(f"❌ Failed to store analysis result: {e}")
            self.conn.rollback()
            raise
    
    def get_candidature(self, candidature_id: int) -> Optional[Candidature]:
        """Get candidature by ID."""
        try:
            self.cursor.execute('''
                SELECT id, business_name, contact_email, submission_date, status,
                       pdf_filename, pdf_path, extracted_text_id, analysis_result_id
                FROM candidatures WHERE id = ?
            ''', (candidature_id,))
            
            row = self.cursor.fetchone()
            if row:
                return Candidature(
                    id=row[0], business_name=row[1], contact_email=row[2],
                    submission_date=row[3], status=row[4], pdf_filename=row[5],
                    pdf_path=row[6], extracted_text_id=row[7], analysis_result_id=row[8]
                )
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get candidature: {e}")
            return None
    
    def get_analysis_result(self, analysis_result_id: int) -> Optional[AnalysisResult]:
        """Get analysis result by ID."""
        try:
            self.cursor.execute('''
                SELECT id, candidature_id, ai_response_text, structured_result,
                       total_score, is_eligible, analysis_date, model_used,
                       processing_time, confidence_score
                FROM analysis_results WHERE id = ?
            ''', (analysis_result_id,))
            
            row = self.cursor.fetchone()
            if row:
                return AnalysisResult(
                    id=row[0], candidature_id=row[1], ai_response_text=row[2],
                    structured_result=json.loads(row[3]), total_score=row[4],
                    is_eligible=row[5], analysis_date=row[6], model_used=row[7],
                    processing_time=row[8], confidence_score=row[9]
                )
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get analysis result: {e}")
            return None
    
    def get_candidature_with_analysis(self, candidature_id: int) -> Optional[Dict[str, Any]]:
        """Get candidature with complete analysis information."""
        try:
            self.cursor.execute('''
                SELECT c.*, ar.*
                FROM candidatures c
                LEFT JOIN analysis_results ar ON c.analysis_result_id = ar.id
                WHERE c.id = ?
            ''', (candidature_id,))
            
            row = self.cursor.fetchone()
            if row:
                return {
                    'candidature': {
                        'id': row[0], 'business_name': row[1], 'contact_email': row[2],
                        'submission_date': row[3], 'status': row[4], 'pdf_filename': row[5],
                        'pdf_path': row[6]
                    },
                    'analysis': {
                        'total_score': row[12], 'is_eligible': row[13],
                        'analysis_date': row[14], 'model_used': row[15]
                    } if row[12] else None
                }
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get candidature with analysis: {e}")
            return None
    
    def list_candidatures(self, status: Optional[str] = None, 
                         limit: int = 100) -> List[Candidature]:
        """List candidatures with optional status filter."""
        try:
            if status:
                self.cursor.execute('''
                    SELECT id, business_name, contact_email, submission_date, status,
                           pdf_filename, pdf_path, extracted_text_id, analysis_result_id
                    FROM candidatures WHERE status = ? ORDER BY submission_date DESC LIMIT ?
                ''', (status, limit))
            else:
                self.cursor.execute('''
                    SELECT id, business_name, contact_email, submission_date, status,
                           pdf_filename, pdf_path, extracted_text_id, analysis_result_id
                    FROM candidatures ORDER BY submission_date DESC LIMIT ?
                ''', (limit,))
            
            rows = self.cursor.fetchall()
            candidatures = []
            
            for row in rows:
                candidatures.append(Candidature(
                    id=row[0], business_name=row[1], contact_email=row[2],
                    submission_date=row[3], status=row[4], pdf_filename=row[5],
                    pdf_path=row[6], extracted_text_id=row[7], analysis_result_id=row[8]
                ))
            
            return candidatures
            
        except Exception as e:
            logger.error(f"❌ Failed to list candidatures: {e}")
            return []
    
    def update_candidature_status(self, candidature_id: int, new_status: str, 
                                notes: Optional[str] = None) -> bool:
        """Update candidature status."""
        try:
            # Get current status
            self.cursor.execute('SELECT status FROM candidatures WHERE id = ?', (candidature_id,))
            row = self.cursor.fetchone()
            if not row:
                return False
            
            old_status = row[0]
            
            # Update status
            self.cursor.execute('''
                UPDATE candidatures 
                SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (new_status, notes, candidature_id))
            
            # Log the operation
            self._log_operation(candidature_id, 'status_changed', old_status, new_status, notes)
            
            self.conn.commit()
            logger.info(f"✅ Candidature {candidature_id} status updated: {old_status} → {new_status}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update candidature status: {e}")
            self.conn.rollback()
            return False
    
    def delete_candidature(self, candidature_id: int) -> bool:
        """
        Delete a candidature and all associated data.
        This implements the "Possibilité de supprimer la candidature" requirement.
        """
        try:
            # Get candidature info for logging
            candidature = self.get_candidature(candidature_id)
            if not candidature:
                return False
            
            # Delete analysis results (CASCADE will handle this automatically)
            self.cursor.execute('DELETE FROM analysis_results WHERE candidature_id = ?', (candidature_id,))
            
            # Delete candidature
            self.cursor.execute('DELETE FROM candidatures WHERE id = ?', (candidature_id,))
            
            # Log the deletion
            self._log_operation(candidature_id, 'deleted', 
                              f"Business: {candidature.business_name}", None, 
                              "Candidature completely removed")
            
            self.conn.commit()
            logger.info(f"✅ Candidature {candidature_id} deleted successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to delete candidature: {e}")
            self.conn.rollback()
            return False
    
    def _log_operation(self, candidature_id: int, operation: str, 
                      old_value: Optional[str], new_value: Optional[str],
                      notes: Optional[str] = None):
        """Log candidature management operations."""
        try:
            self.cursor.execute('''
                INSERT INTO candidature_management 
                (candidature_id, operation, old_value, new_value, user_notes)
                VALUES (?, ?, ?, ?, ?)
            ''', (candidature_id, operation, old_value, new_value, notes))
        except Exception as e:
            logger.warning(f"⚠️ Failed to log operation: {e}")
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        try:
            stats = {}
            
            # Count candidatures by status
            self.cursor.execute('''
                SELECT status, COUNT(*) FROM candidatures GROUP BY status
            ''')
            status_counts = dict(self.cursor.fetchall())
            stats['candidatures_by_status'] = status_counts
            
            # Total counts
            self.cursor.execute('SELECT COUNT(*) FROM candidatures')
            stats['total_candidatures'] = self.cursor.fetchone()[0]
            
            self.cursor.execute('SELECT COUNT(*) FROM analysis_results')
            stats['total_analyses'] = self.cursor.fetchone()[0]
            
            # Score distribution
            self.cursor.execute('''
                SELECT 
                    CASE 
                        WHEN total_score >= 80 THEN 'Excellent (80-100)'
                        WHEN total_score >= 60 THEN 'Good (60-79)'
                        WHEN total_score >= 40 THEN 'Fair (40-59)'
                        ELSE 'Poor (0-39)'
                    END as score_range,
                    COUNT(*) as count
                FROM analysis_results 
                GROUP BY score_range
            ''')
            score_distribution = dict(self.cursor.fetchall())
            stats['score_distribution'] = score_distribution
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Failed to get database stats: {e}")
            return {}
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("✅ Database connection closed")

def main():
    """Test the database manager functionality."""
    print("🗄️ Testing Database Manager for Analysis Results Storage")
    print("=" * 60)
    
    try:
        # Initialize database manager
        db_manager = DatabaseManager()
        
        # Test database stats
        print("\n📊 Current Database Statistics:")
        stats = db_manager.get_database_stats()
        for key, value in stats.items():
            print(f"   {key}: {value}")
        
        # Test candidature creation
        print("\n🧪 Testing Candidature Creation:")
        candidature_id = db_manager.create_candidature(
            business_name="Test Startup Inc.",
            contact_email="test@startup.com",
            pdf_filename="test_business_plan.pdf",
            pdf_path="/path/to/test_business_plan.pdf"
        )
        print(f"✅ Created candidature with ID: {candidature_id}")
        
        # Test analysis result storage
        print("\n🧪 Testing Analysis Result Storage:")
        sample_analysis = {
            "total_score": 75.5,
            "is_eligible": True,
            "criteria_results": [
                {"criterion": "Équipe", "score": 8.0, "max": 10},
                {"criterion": "Problématique", "score": 7.5, "max": 10}
            ],
            "recommendations": [
                "Améliorer la définition de l'équipe",
                "Fournir plus de données de marché"
            ]
        }
        
        analysis_id = db_manager.store_analysis_result(
            candidature_id=candidature_id,
            ai_response_text="Sample AI analysis response...",
            structured_result=sample_analysis,
            total_score=75.5,
            is_eligible=True,
            model_used="llama2:7b",
            processing_time=45.2
        )
        print(f"✅ Stored analysis result with ID: {analysis_id}")
        
        # Test retrieval
        print("\n🧪 Testing Data Retrieval:")
        candidature = db_manager.get_candidature(candidature_id)
        print(f"✅ Retrieved candidature: {candidature.business_name}")
        
        analysis = db_manager.get_analysis_result(analysis_id)
        print(f"✅ Retrieved analysis: Score {analysis.total_score}/100")
        
        # Test complete view
        complete_view = db_manager.get_candidature_with_analysis(candidature_id)
        print(f"✅ Complete view: Status {complete_view['candidature']['status']}")
        
        # Test status update
        print("\n🧪 Testing Status Update:")
        success = db_manager.update_candidature_status(candidature_id, "accepted", "High potential startup")
        print(f"✅ Status update: {'Success' if success else 'Failed'}")
        
        # Test listing
        print("\n🧪 Testing Candidature Listing:")
        candidatures = db_manager.list_candidatures(limit=10)
        print(f"✅ Listed {len(candidatures)} candidatures")
        
        # Final stats
        print("\n📊 Final Database Statistics:")
        final_stats = db_manager.get_database_stats()
        for key, value in final_stats.items():
            print(f"   {key}: {value}")
        
        # Cleanup test data
        print("\n🧹 Cleaning up test data:")
        success = db_manager.delete_candidature(candidature_id)
        print(f"✅ Test candidature deletion: {'Success' if success else 'Failed'}")
        
        print("\n🎉 All database tests completed successfully!")
        print("✅ Analysis results storage system is working perfectly!")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        if 'db_manager' in locals():
            db_manager.close()

if __name__ == "__main__":
    main()