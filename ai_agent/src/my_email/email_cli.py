#!/usr/bin/env python3
"""
Email Management CLI
Command-line interface for managing email operations
"""

import argparse
import logging
import sys
import os

# Add parent directories to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.dirname(current_dir)
project_dir = os.path.dirname(src_dir)

sys.path.insert(0, src_dir)
sys.path.insert(0, project_dir)

from my_email.email_service import EmailService
from config.settings import DB_PATH

def get_email_config():
    """Get email configuration - fallback if config module isn't available"""
    try:
        from config.email_config import get_config
        return get_config()
    except ImportError:
        # Fallback configuration
        return {
            'template_path': os.path.join(project_dir, 'email_templates'),
            'db_path': DB_PATH,
            'smtp': {
                'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
                'port': int(os.getenv('SMTP_PORT', '587')),
                'username': os.getenv('SMTP_USERNAME', ''),
                'password': os.getenv('SMTP_PASSWORD', ''),
                'encryption': os.getenv('SMTP_ENCRYPTION', 'tls')
            }
        }

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('email_service.log'),
            logging.StreamHandler()
        ]
    )

def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(description="Email Management CLI")
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Process queue command
    process_parser = subparsers.add_parser('process', help='Process email queue')
    process_parser.add_argument('--batch-size', type=int, default=20, 
                               help='Number of emails to process')
    
    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show email statistics')
    
    # Test command
    test_parser = subparsers.add_parser('test', help='Send test email')
    test_parser.add_argument('email', help='Email address to send test to')
    test_parser.add_argument('--name', default='Test User', help='Recipient name')
    
    # Send one command
    send_one_parser = subparsers.add_parser('send-one', help='Send email for specific candidature')
    send_one_parser.add_argument('candidature_id', type=int, help='Candidature ID to send email for')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
    setup_logging()
    logger = logging.getLogger(__name__)
    
    try:
        # Load configuration
        config = get_email_config()
        
        # Initialize email service
        email_service = EmailService(
            smtp_config=config['smtp'],
            template_dir=config['template_path'],
            db_path=config['db_path']
        )
        
        if args.command == 'process':
            print("Processing email queue...")
            results = email_service.process_email_queue(args.batch_size)
            print(f"Processed: {results['processed']}")
            print(f"Successful: {results['successful']}")
            print(f"Failed: {results['failed']}")
            
        elif args.command == 'stats':
            stats = email_service.get_service_stats()
            print("Email Service Statistics:")
            print(f"Total emails processed: {stats['total_processed']}")
            print(f"Success rate: {stats['success_rate']:.2f}%")
            print("\nDatabase Status:")
            for status, count in stats['database_stats']['status_counts'].items():
                print(f"  {status}: {count}")
                
        elif args.command == 'test':
            # Send test email
            from my_email.email_sender import ProfessionalEmailSender
            
            sender = ProfessionalEmailSender(config['smtp'], config['template_path'])
            
            test_data = {
                'total_score': 85.5,
                'is_eligible': True,
                'analysis_method': 'Test Analysis',
                'confidence_score': 92.0,
                'summary': 'This is a test email to verify the email system is working correctly.',
                'criteria_results': [
                    {'criterion_name': 'Équipe', 'earned_points': 8.5, 'max_points': 10},
                    {'criterion_name': 'Problématique', 'earned_points': 7.0, 'max_points': 10}
                ],
                'recommendations': [
                    'Test recommendation 1',
                    'Test recommendation 2',
                    'Test recommendation 3'
                ]
            }
            
            success = sender.send_business_plan_email(
                recipient_email=args.email,
                recipient_name=args.name,
                business_name='Test Business',
                candidature_id='TEST-001',
                analysis_data=test_data
            )
            
            if success:
                print(f"Test email sent successfully to {args.email}")
            else:
                print(f"Failed to send test email to {args.email}")
                sys.exit(1)
                
        elif args.command == 'send-one':
            # Send email for specific candidature
            print(f"Sending email for candidature ID: {args.candidature_id}")
            success = email_service.send_candidature_email(args.candidature_id)
            
            if success:
                print(f"Email sent successfully for candidature {args.candidature_id}")
            else:
                print(f"Failed to send email for candidature {args.candidature_id}")
                sys.exit(1)
        
        email_service.cleanup()
        
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()