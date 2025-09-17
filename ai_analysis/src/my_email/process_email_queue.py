#!/usr/bin/env python3
"""
Email Queue Processor
Processes pending emails in the database queue
Can be run manually or as a scheduled task
"""

import os
import sys
import time
import logging
import argparse
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config.email_config import get_config
from my_email.email_service import EmailService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('email_queue_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EmailQueueProcessor:
    """
    Processes email queue with error handling and monitoring
    """
    
    def __init__(self):
        self.config = get_config()
        self.email_service = EmailService(
            smtp_config=self.config['smtp'],
            template_dir=self.config['template_path'],
            db_path=self.config['db_path']
        )
    
    def process_queue(self, batch_size: int = 10, max_attempts: int = 3) -> dict:
        """
        Process email queue with retry logic
        
        Args:
            batch_size: Number of emails to process at once
            max_attempts: Maximum retry attempts for failed emails
            
        Returns:
            Processing summary
        """
        logger.info(f"Starting email queue processing (batch_size={batch_size})")
        start_time = time.time()
        
        try:
            results = self.email_service.process_email_queue(batch_size)
            
            processing_time = time.time() - start_time
            results['processing_time'] = processing_time
            
            logger.info(f"Queue processing completed in {processing_time:.2f}s")
            logger.info(f"Processed: {results['processed']}, Successful: {results['successful']}, Failed: {results['failed']}")
            
            # Log failures for monitoring
            if results['failed'] > 0:
                logger.warning(f"Failed emails: {results['failed']}")
                for detail in results['details']:
                    if detail['status'] in ['failed', 'error']:
                        logger.error(f"Email {detail['email_id']} to {detail['recipient']}: {detail.get('error', 'Unknown error')}")
            
            return results
            
        except Exception as e:
            logger.error(f"Email queue processing failed: {e}")
            return {
                'error': str(e),
                'processed': 0,
                'successful': 0,
                'failed': 0,
                'processing_time': time.time() - start_time
            }
    
    def monitor_queue(self, interval: int = 300, continuous: bool = False):
        """
        Monitor and process queue continuously
        
        Args:
            interval: Processing interval in seconds (default: 5 minutes)
            continuous: Whether to run continuously
        """
        logger.info(f"Starting email queue monitor (interval={interval}s, continuous={continuous})")
        
        try:
            while True:
                results = self.process_queue()
                
                if results.get('processed', 0) > 0:
                    logger.info(f"Monitor cycle: processed {results['processed']} emails")
                else:
                    logger.debug("Monitor cycle: no emails to process")
                
                if not continuous:
                    break
                
                logger.debug(f"Sleeping for {interval} seconds...")
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("Monitor stopped by user")
        except Exception as e:
            logger.error(f"Monitor error: {e}")
    
    def get_queue_status(self):
        """Get current queue status"""
        try:
            stats = self.email_service.get_service_stats()
            
            print(f"\nEMAIL QUEUE STATUS")
            print("=" * 30)
            print(f"Database Stats:")
            db_stats = stats.get('database_stats', {})
            for status, count in db_stats.get('status_counts', {}).items():
                print(f"  {status}: {count}")
            
            print(f"\nSending Stats:")
            sending_stats = stats.get('sending_stats', {})
            print(f"  Total sent: {sending_stats.get('total_sent', 0)}")
            print(f"  Total failed: {sending_stats.get('total_failed', 0)}")
            print(f"  Success rate: {sending_stats.get('success_rate', 0):.1f}%")
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get queue status: {e}")
            return {}
    
    def add_test_emails(self, count: int = 3):
        """Add test emails to queue for testing"""
        from database.database_manager import DatabaseManager
        
        db = DatabaseManager(self.config['db_path'])
        
        test_candidatures = []
        for i in range(count):
            candidature_id = db.create_candidature(
                business_name=f"Test Company {i+1}",
                contact_email=f"test{i+1}@example.com",
                pdf_filename=f"test_plan_{i+1}.pdf",
                pdf_path=f"/tmp/test_plan_{i+1}.pdf"
            )
            
            # Add analysis result
            test_analysis = {
                "total_score": 75.0 + (i * 5),
                "is_eligible": i % 2 == 0,
                "criteria_results": [
                    {"criterion_name": "Équipe", "earned_points": 8.0 + i, "max_points": 10},
                    {"criterion_name": "Problématique", "earned_points": 7.0 + i, "max_points": 10}
                ],
                "recommendations": [
                    f"Test recommendation {i+1}.1",
                    f"Test recommendation {i+1}.2"
                ]
            }
            
            db.store_analysis_result(
                candidature_id=candidature_id,
                ai_response_text=f"Test analysis for company {i+1}",
                structured_result=test_analysis,
                total_score=test_analysis["total_score"],
                is_eligible=test_analysis["is_eligible"],
                model_used="test_model",
                processing_time=30.0
            )
            
            # Add to email queue
            success = self.email_service.add_candidature_to_queue(candidature_id)
            if success:
                test_candidatures.append(candidature_id)
                logger.info(f"Added test candidature {candidature_id} to email queue")
        
        db.close()
        return test_candidatures
    
    def cleanup_test_emails(self, candidature_ids: list):
        """Remove test emails from database"""
        from database.database_manager import DatabaseManager
        
        db = DatabaseManager(self.config['db_path'])
        
        for candidature_id in candidature_ids:
            success = db.delete_candidature(candidature_id)
            if success:
                logger.info(f"Deleted test candidature {candidature_id}")
        
        db.close()
    
    def cleanup(self):
        """Cleanup resources"""
        self.email_service.cleanup()

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description="Email Queue Processor")
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Process command
    process_cmd = subparsers.add_parser('process', help='Process email queue once')
    process_cmd.add_argument('--batch-size', type=int, default=10, help='Batch size')
    
    # Monitor command
    monitor_cmd = subparsers.add_parser('monitor', help='Monitor queue continuously')
    monitor_cmd.add_argument('--interval', type=int, default=300, help='Check interval (seconds)')
    monitor_cmd.add_argument('--once', action='store_true', help='Run once instead of continuously')
    
    # Status command
    subparsers.add_parser('status', help='Show queue status')
    
    # Test commands
    test_cmd = subparsers.add_parser('test', help='Add test emails to queue')
    test_cmd.add_argument('--count', type=int, default=3, help='Number of test emails')
    test_cmd.add_argument('--cleanup', action='store_true', help='Cleanup test data after processing')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    try:
        processor = EmailQueueProcessor()
        
        if args.command == 'process':
            results = processor.process_queue(args.batch_size)
            print(f"Processing complete: {results}")
            
        elif args.command == 'monitor':
            processor.monitor_queue(args.interval, not args.once)
            
        elif args.command == 'status':
            processor.get_queue_status()
            
        elif args.command == 'test':
            print(f"Adding {args.count} test emails to queue...")
            test_ids = processor.add_test_emails(args.count)
            
            print("Processing test emails...")
            results = processor.process_queue()
            print(f"Test results: {results}")
            
            if args.cleanup:
                print("Cleaning up test data...")
                processor.cleanup_test_emails(test_ids)
        
        processor.cleanup()
        
    except Exception as e:
        logger.error(f"Command execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()