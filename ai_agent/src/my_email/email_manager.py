#!/usr/bin/env python3
"""
Email Database Manager
Handles database operations for email integration
"""

import sqlite3
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailDatabaseManager:
    """
    Manages email-related database operations
    """
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = None
        self._init_database()
    
    def _init_database(self):
        """Initialize database with required tables"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            cursor = self.conn.cursor()
            
            # Create email tracking table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS email_tracking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidature_id INTEGER NOT NULL,
                    recipient_email TEXT NOT NULL,
                    recipient_name TEXT NOT NULL,
                    business_name TEXT NOT NULL,
                    sent_status TEXT NOT NULL CHECK(sent_status IN ('pending', 'sent', 'failed')),
                    sent_date TIMESTAMP,
                    error_message TEXT,
                    retry_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (candidature_id) REFERENCES candidatures (id) ON DELETE CASCADE
                )
            ''')
            
            # Create index for better performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_email_tracking_candidature 
                ON email_tracking (candidature_id)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_email_tracking_status 
                ON email_tracking (sent_status)
            ''')
            
            self.conn.commit()
            logger.info("Email tracking database initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize email database: {e}")
            raise
    
    def add_email_to_queue(self, candidature_id: int, recipient_email: str, 
                          recipient_name: str, business_name: str) -> bool:
        """Add email to sending queue"""
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO email_tracking 
                (candidature_id, recipient_email, recipient_name, business_name, sent_status)
                VALUES (?, ?, ?, ?, 'pending')
            ''', (candidature_id, recipient_email, recipient_name, business_name))
            
            self.conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Failed to add email to queue: {e}")
            return False
    
    def get_pending_emails(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get list of pending emails"""
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT et.*, c.analysis_result_id
                FROM email_tracking et
                JOIN candidatures c ON et.candidature_id = c.id
                WHERE et.sent_status = 'pending'
                ORDER BY et.created_at ASC
                LIMIT ?
            ''', (limit,))
            
            columns = [col[0] for col in cursor.description]
            results = []
            
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to get pending emails: {e}")
            return []
    
    def update_email_status(self, email_id: int, status: str, 
                           error_message: str = None) -> bool:
        """Update email sending status"""
        try:
            cursor = self.conn.cursor()
            
            if status == 'sent':
                cursor.execute('''
                    UPDATE email_tracking 
                    SET sent_status = ?, sent_date = CURRENT_TIMESTAMP, 
                        error_message = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (status, error_message, email_id))
            else:
                cursor.execute('''
                    UPDATE email_tracking 
                    SET sent_status = ?, error_message = ?, 
                        retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (status, error_message, email_id))
            
            self.conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Failed to update email status: {e}")
            return False
    
    def get_email_stats(self) -> Dict[str, Any]:
        """Get email sending statistics"""
        try:
            cursor = self.conn.cursor()
            
            # Get total counts by status
            cursor.execute('''
                SELECT sent_status, COUNT(*) as count
                FROM email_tracking
                GROUP BY sent_status
            ''')
            
            status_counts = {}
            for row in cursor.fetchall():
                status_counts[row[0]] = row[1]
            
            # Get daily sent counts
            cursor.execute('''
                SELECT DATE(sent_date) as date, COUNT(*) as count
                FROM email_tracking
                WHERE sent_status = 'sent'
                GROUP BY DATE(sent_date)
                ORDER BY date DESC
                LIMIT 7
            ''')
            
            daily_stats = {}
            for row in cursor.fetchall():
                daily_stats[row[0]] = row[1]
            
            return {
                "status_counts": status_counts,
                "daily_stats": daily_stats,
                "total_emails": sum(status_counts.values())
            }
            
        except Exception as e:
            logger.error(f"Failed to get email stats: {e}")
            return {}
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()