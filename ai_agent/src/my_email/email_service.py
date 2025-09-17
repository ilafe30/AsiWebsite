#!/usr/bin/env python3
"""
Main Email Service
Orchestrates the complete email sending process
"""

import logging
import time
import sys
import os
from typing import Dict, Any, List

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from my_email.email_sender import ProfessionalEmailSender
from my_email.email_manager import EmailDatabaseManager
from database.database_manager import DatabaseManager

logger = logging.getLogger(__name__)

class EmailService:
    """
    Main email service that coordinates sending operations
    """
    
    def __init__(self, smtp_config: Dict[str, Any], template_dir: str, db_path: str):
        self.email_sender = ProfessionalEmailSender(smtp_config, template_dir)
        self.email_db = EmailDatabaseManager(db_path)
        
        # IMPORTANT: Use the SAME database path for both database managers
        self.main_db = DatabaseManager(db_path)  # Make sure this uses the same path
        
        logger.info("Email service initialized successfully")
    
    def process_email_queue(self, batch_size: int = 20) -> Dict[str, Any]:
        """
        Process pending emails in the queue
        
        Args:
            batch_size: Number of emails to process in one batch
            
        Returns:
            Processing results
        """
        results = {
            "processed": 0,
            "successful": 0,
            "failed": 0,
            "details": []
        }
        
        # Get pending emails
        pending_emails = self.email_db.get_pending_emails(batch_size)
        
        for email in pending_emails:
            try:
                # Get analysis data from main database
                analysis_result = self.main_db.get_analysis_result(email['analysis_result_id'])
                if not analysis_result:
                    logger.error(f"No analysis data found for candidature {email['candidature_id']}")
                    self.email_db.update_email_status(
                        email['id'], 'failed', 'No analysis data available'
                    )
                    results['failed'] += 1
                    continue
                
                # Convert analysis result to dictionary format
                analysis_data = {
                    'total_score': analysis_result.total_score,
                    'is_eligible': analysis_result.is_eligible,
                    'analysis_method': analysis_result.model_used,
                    'confidence_score': analysis_result.confidence_score or 85,
                    'summary': analysis_result.ai_response_text,
                    'criteria_results': analysis_result.structured_result.get('criteria_results', []),
                    'recommendations': analysis_result.structured_result.get('recommendations', [])
                }
                
                # Generate report URL
                report_url = self._generate_report_url(email['candidature_id'])
                
                # Send email
                success = self.email_sender.send_business_plan_email(
                    recipient_email=email['recipient_email'],
                    recipient_name=email['recipient_name'],
                    business_name=email['business_name'],
                    candidature_id=str(email['candidature_id']),
                    analysis_data=analysis_data,
                    report_url=report_url
                )
                
                # Update status
                if success:
                    self.email_db.update_email_status(email['id'], 'sent')
                    results['successful'] += 1
                    results['details'].append({
                        'email_id': email['id'],
                        'status': 'success',
                        'recipient': email['recipient_email']
                    })
                else:
                    self.email_db.update_email_status(
                        email['id'], 'failed', 'Email sending failed'
                    )
                    results['failed'] += 1
                    results['details'].append({
                        'email_id': email['id'],
                        'status': 'failed',
                        'recipient': email['recipient_email']
                    })
                
                results['processed'] += 1
                
                # Small delay to avoid rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                logger.error(f"Failed to process email {email['id']}: {e}")
                self.email_db.update_email_status(
                    email['id'], 'failed', str(e)
                )
                results['failed'] += 1
                results['details'].append({
                    'email_id': email['id'],
                    'status': 'error',
                    'recipient': email['recipient_email'],
                    'error': str(e)
                })
        
        return results
    
    def _generate_report_url(self, candidature_id: int) -> str:
        """
        Generate report URL (to be implemented based on your web server setup)
        """
        # This would be replaced with your actual report URL generation logic
        return f"http://localhost:8000/reports/{candidature_id}"
    
    def add_candidature_to_queue(self, candidature_id: int) -> bool:
        """
        Add a candidature to the email queue
        
        Args:
            candidature_id: ID of the candidature to process
            
        Returns:
            Success status
        """
        try:
            # Get candidature details
            candidature = self.main_db.get_candidature(candidature_id)
            if not candidature:
                logger.error(f"Candidature {candidature_id} not found")
                return False
            
            # Add to email queue
            success = self.email_db.add_email_to_queue(
                candidature_id=candidature_id,
                recipient_email=candidature.contact_email,
                recipient_name=candidature.business_name,
                business_name=candidature.business_name
            )
            
            if success:
                logger.info(f"Added candidature {candidature_id} to email queue")
            else:
                logger.error(f"Failed to add candidature {candidature_id} to email queue")
            
            return success
            
        except Exception as e:
            logger.error(f"Error adding candidature to queue: {e}")
            return False
    
    def get_service_stats(self) -> Dict[str, Any]:
        """Get comprehensive service statistics"""
        email_stats = self.email_db.get_email_stats()
        sending_stats = self.email_sender.get_sending_stats()
        
        return {
            "database_stats": email_stats,
            "sending_stats": sending_stats,
            "total_processed": email_stats.get("total_emails", 0),
            "success_rate": sending_stats.get("success_rate", 0)
        }
    
    def cleanup(self):
        """Clean up resources"""
        self.email_db.close()
        self.main_db.close()