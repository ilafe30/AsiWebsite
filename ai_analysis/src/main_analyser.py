#!/usr/bin/env python3
"""
Main Business Plan Analyzer
===========================

Unified entry point that orchestrates all 4 tasks:
1. PDF text extraction
2. AI integration  
3. Structured analysis with prompts
4. Database storage of results

Consolidates functionality from all previous analyzer versions.
Updated with unified email integration approach.
"""

import os
import sys
import argparse
import logging
import time
from typing import Dict, Any, Optional
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from config.unified_config import get_unified_config, get_db_path
from analyzers.analyzer import UnifiedBusinessPlanAnalyzer
from extractors.pdf_extractor import UnifiedPDFExtractor
from ai_integration.ai_client import UnifiedAIClient
from database.database_manager import DatabaseManager
db_path = get_db_path()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('business_plan_analyzer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MainBusinessPlanAnalyzer:
    """
    Main analyzer class that orchestrates the complete workflow:
    Task 1.2.1: PDF text extraction
    Task 1.2.2: AI integration
    Task 1.2.3: Structured analysis prompts
    Task 1.2.4: Database storage
    """
    
    def __init__(self, ollama_model: str = "llama3.2:1b"):
        """Initialize all components with proper integration."""
        logger.info("Initializing Main Business Plan Analyzer...")
        
        # Initialize core components
        self.analyzer = UnifiedBusinessPlanAnalyzer()
        self.pdf_extractor = UnifiedPDFExtractor()
        self.ai_client = UnifiedAIClient()
        self.db_manager = DatabaseManager()
        self.ollama_model = ollama_model
        
        # Initialize database and ensure schema
        self.db_manager.init_database()
        self._ensure_database_schema()
        
        # Initialize email service with consistent configuration
        try:
            from config.email_config import get_config
            from my_email.email_service import EmailService
            
            config = get_unified_config()
            
            # ENSURE SAME DATABASE PATH
            email_db_path = config.get('db_path', self.db_manager.db_path)
            if email_db_path != self.db_manager.db_path:
                logger.warning(f"Database path mismatch: {email_db_path} vs {self.db_manager.db_path}")
                config['db_path'] = self.db_manager.db_path  # Force same path
            
            self.email_service = EmailService(
                smtp_config=config['smtp'],
                template_dir=config['template_path'],
                db_path=self.db_manager.db_path  # Use same path
            )
            logger.info("Email service initialized successfully")
        except Exception as e:
            logger.warning(f"Email service not available: {e}")
            self.email_service = None
        
        logger.info("All components initialized successfully")
    
    def _ensure_database_schema(self):
        """Ensure database has all required fields for email integration"""
        try:
            # Add missing columns if they don't exist
            schema_updates = [
                "ALTER TABLE candidatures ADD COLUMN email_sent BOOLEAN DEFAULT 0",
                "ALTER TABLE candidatures ADD COLUMN email_sent_date TIMESTAMP",
                "ALTER TABLE candidatures ADD COLUMN report_filename TEXT",
                "ALTER TABLE candidatures ADD COLUMN report_generated BOOLEAN DEFAULT 0",
            ]
            
            for update_sql in schema_updates:
                try:
                    self.db_manager.cursor.execute(update_sql)
                except Exception:
                    # Column probably already exists
                    pass
            
            self.db_manager.conn.commit()
            logger.info("Database schema updated for email integration")
            
        except Exception as e:
            logger.error(f"Schema update failed: {e}")
    
    def _generate_and_store_report(self, candidature_id, analysis_result, business_name):
        """Generate a PDF report and store its information in the database."""
        try:
            # Import here to avoid circular imports
            from report_generator import ProfessionalReportGenerator
            
            generator = ProfessionalReportGenerator()
            filename, filepath = generator.generate_professional_report(
                candidature_id, analysis_result, business_name
            )
            
            if filename and filepath:
                # Store report info in database
                self.db_manager.cursor.execute('''
                    UPDATE candidatures 
                    SET report_filename = ?, report_generated = 1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (filename, candidature_id))
                self.db_manager.conn.commit()
                
                logger.info(f"Professional report saved: {filename}")
                return filename
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to generate and store report: {e}")
            return None
    
    def _handle_email_notification(self, candidature_id: int, analysis_result, business_name: str):
        """
        Unified email notification handler - fixes integration issues
        """
        try:
            # Update candidature status to indicate analysis completion
            self.db_manager.update_candidature_status(
                candidature_id, 
                "analyzed",
                f"Analysis completed. Score: {analysis_result.total_score:.1f}/100"
            )
            
            # Check if email already sent to prevent duplicates
            candidature = self.db_manager.get_candidature(candidature_id)
            if hasattr(candidature, 'email_sent') and candidature.email_sent:
                logger.info(f"Email already sent for candidature {candidature_id}")
                return True
            
            # Try Python email service first
            if self.email_service:
                try:
                    email_added = self.email_service.add_candidature_to_queue(candidature_id)
                    if email_added:
                        logger.info(f"Candidature {candidature_id} added to email queue")
                        # Process the queue immediately for this specific email
                        results = self.email_service.process_email_queue(batch_size=1)
                        if results['successful'] > 0:
                            self._mark_email_sent(candidature_id)
                            return True
                        else:
                            logger.warning(f"Failed to send email from queue for {candidature_id}")
                            return self._fallback_to_php_email(candidature_id)
                    else:
                        logger.warning(f"Failed to add {candidature_id} to email queue")
                        return self._fallback_to_php_email(candidature_id)
                except Exception as e:
                    logger.error(f"Python email service failed: {e}")
                    return self._fallback_to_php_email(candidature_id)
            else:
                # No Python email service available
                return self._fallback_to_php_email(candidature_id)
                
        except Exception as e:
            logger.error(f"Email notification failed for {candidature_id}: {e}")
            return False

    def _fallback_to_php_email(self, candidature_id: int) -> bool:
        """Fallback to PHP email system"""
        try:
            logger.info(f"Using PHP email fallback for candidature {candidature_id}")
            email_sent = self.send_analysis_email(candidature_id)
            if email_sent:
                self._mark_email_sent(candidature_id)
                return True
            return False
        except Exception as e:
            logger.error(f"PHP email fallback failed: {e}")
            return False

    def _mark_email_sent(self, candidature_id: int):
        """Mark email as sent in database"""
        try:
            self.db_manager.cursor.execute('''
                UPDATE candidatures 
                SET email_sent = 1, email_sent_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (candidature_id,))
            self.db_manager.conn.commit()
            logger.info(f"Marked email as sent for candidature {candidature_id}")
        except Exception as e:
            logger.error(f"Failed to mark email as sent: {e}")
    
    def process_complete_workflow(self, pdf_path: str, business_name: str,
                                contact_email: str, extraction_method: str = "auto",
                                analysis_method: str = "auto") -> Dict[str, Any]:
        """
        Complete workflow processing all 4 tasks.
        
        Args:
            pdf_path: Path to business plan PDF
            business_name: Name of the business
            contact_email: Contact email
            extraction_method: PDF extraction method ("auto", "fast", "high_quality")
            analysis_method: Analysis method ("auto", "ai", "rule_based")
            
        Returns:
            Complete processing results
        """
        workflow_start = time.time()
        logger.info(f"Starting complete workflow for: {business_name}")
        
        try:
            # TASK 1: Create candidature entry
            candidature_id = self.db_manager.create_candidature(
                business_name=business_name,
                contact_email=contact_email,
                pdf_filename=os.path.basename(pdf_path),
                pdf_path=pdf_path,
            )
            self.db_manager.update_candidature_status(candidature_id, "pending")
            logger.info(f"Task 1.2.4: Candidature created (ID: {candidature_id})")
            
            # TASK 2: Extract text from PDF
            logger.info(f"Task 1.2.1: Starting PDF text extraction...")
            extraction_result = self.pdf_extractor.extract_text(
                pdf_path=pdf_path,
                method=extraction_method,
                max_pages=20  # Limit for performance
            )
            
            if not extraction_result.success:
                raise Exception(f"PDF extraction failed: {extraction_result.error_message}")
            
            logger.info(f"Task 1.2.1: Text extracted successfully ({extraction_result.word_count} words)")
            
            # Store extracted text
            extracted_text_id = self._store_extracted_text(
                candidature_id, extraction_result
            )
            
            # TASK 3: Analyze business plan with AI/structured prompts
            logger.info(f"Task 1.2.2 & 1.2.3: Starting business plan analysis...")
            analysis_result = self._analyze_business_plan(
                text=extraction_result.text,
                method=analysis_method
            )
            
            logger.info(f"Analysis completed: {analysis_result.total_score:.1f}/100")
            
            # TASK 4: Store analysis results
            logger.info(f"Task 1.2.4: Storing analysis results...")
            analysis_id = self.db_manager.store_analysis_result(
                candidature_id=candidature_id,
                ai_response_text=analysis_result.summary,
                structured_result=self._analysis_to_dict(analysis_result),
                total_score=analysis_result.total_score,
                is_eligible=analysis_result.is_eligible,
                model_used=analysis_result.analysis_method,
                processing_time=analysis_result.processing_time,
                confidence_score=analysis_result.confidence_score
            )

            # Generate and store report
            report_filename = self._generate_and_store_report(
                candidature_id, 
                self._analysis_to_dict(analysis_result),
                business_name
            )

            if report_filename:
                logger.info(f"PDF report generated: {report_filename}")
            else:
                logger.warning("Failed to generate PDF report")

            # UNIFIED EMAIL HANDLING - replaces the old dual approach
            email_success = self._handle_email_notification(
                candidature_id, 
                analysis_result, 
                business_name
            )

            workflow_time = time.time() - workflow_start
            
            logger.info(f"Complete workflow finished in {workflow_time:.2f}s")
            logger.info(f"Email notification: {'Sent' if email_success else 'Failed'}")
            
            return {
                "success": True,
                "candidature_id": candidature_id,
                "extracted_text_id": extracted_text_id,
                "analysis_id": analysis_id,
                "business_name": business_name,
                "report_filename": report_filename,
                "email_sent": email_success,
                "extraction": {
                    "method": extraction_result.method,
                    "confidence": extraction_result.confidence,
                    "word_count": extraction_result.word_count,
                    "processing_time": extraction_result.processing_time
                },
                "analysis": {
                    "method": analysis_result.analysis_method,
                    "total_score": analysis_result.total_score,
                    "is_eligible": analysis_result.is_eligible,
                    "confidence": analysis_result.confidence_score,
                    "processing_time": analysis_result.processing_time
                },
                "workflow": {
                    "total_time": workflow_time,
                    "status": "eligible" if analysis_result.is_eligible else "not_eligible"
                }
            }
            
        except Exception as e:
            # Update candidature to failed status
            if 'candidature_id' in locals():
                self.db_manager.update_candidature_status(
                    candidature_id, "failed", f"Processing failed: {str(e)}"
                )
            
            logger.error(f"Workflow failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "candidature_id": locals().get('candidature_id'),
                "workflow_time": time.time() - workflow_start
            }
    
    def _store_extracted_text(self, candidature_id: int, extraction_result) -> int:
        """Store extracted text and link to candidature."""
        try:
            # Store in extracted_text table
            cursor = self.db_manager.cursor
            cursor.execute('''
                INSERT INTO extracted_text 
                (file_id, text_content, text_length, extraction_method, confidence_score, processing_time)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                candidature_id,  # Using candidature_id as file_id
                extraction_result.text,
                len(extraction_result.text),
                extraction_result.method,
                extraction_result.confidence,
                extraction_result.processing_time
            ))
            
            extracted_text_id = cursor.lastrowid
            self.db_manager.conn.commit()
            
            # Link to candidature
            cursor.execute('''
                UPDATE candidatures 
                SET extracted_text_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (extracted_text_id, candidature_id))
            
            self.db_manager.conn.commit()
            
            logger.info(f"Extracted text stored (ID: {extracted_text_id})")
            return extracted_text_id
            
        except Exception as e:
            logger.error(f"Failed to store extracted text: {e}")
            raise
    
    def _analyze_business_plan(self, text: str, method: str):
        """Analyze business plan using unified analyzer."""
        if method == "ai" or (method == "auto" and self.ai_client.is_server_up()):
            # Use AI analysis
            prompt = self.analyzer.build_ai_prompt(text)
            
            # Try to pull recommended model
            self.ai_client.pull_model(self.ollama_model)
            
            ai_response = self.ai_client.analyze_business_plan(text, prompt, method="ollama")
            
            if ai_response.success:
                # Parse AI response into structured analysis
                analysis = self.analyzer.parse_ai_response(ai_response.content)
                analysis.processing_time = ai_response.processing_time
                analysis.confidence_score = ai_response.confidence
                return analysis
            else:
                logger.warning("AI analysis failed, falling back to rule-based")
                return self.analyzer.analyze_business_plan(text, method="rule_based")
        else:
            # Use rule-based analysis
            return self.analyzer.analyze_business_plan(text, method="rule_based")
    
    def _analysis_to_dict(self, analysis) -> Dict[str, Any]:
        """Convert analysis to dictionary for database storage."""
        return {
            "total_score": analysis.total_score,
            "max_possible_score": analysis.max_possible_score,
            "threshold": analysis.threshold,
            "is_eligible": analysis.is_eligible,
            "evaluation_date": analysis.evaluation_date,
            "analysis_method": analysis.analysis_method,
            "confidence_score": analysis.confidence_score,
            "processing_time": analysis.processing_time,
            "criteria_results": [
                {
                    "criterion_id": cr.criterion_id,
                    "criterion_name": cr.criterion_name,
                    "max_points": cr.max_points,
                    "earned_points": cr.earned_points,
                    "reasoning": cr.reasoning,
                    "sub_scores": cr.sub_scores
                }
                for cr in analysis.criteria_results
            ],
            "summary": analysis.summary,
            "recommendations": analysis.recommendations
        }
    
    def send_analysis_email(self, candidature_id):
        """Send email notification after analysis completion."""
        try:
            import subprocess
            import os
            
            # Path to the PHP email script
            php_script = os.path.join(
                os.path.dirname(__file__), 
                '..', 
                'email_templates', 
                'email_template_integration.php'
            )
            
            # Execute PHP script to send email
            result = subprocess.run([
                'php', php_script, 'send', str(candidature_id)
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                logger.info(f"Email sent successfully for candidature {candidature_id}")
                return True
            else:
                logger.warning(f"Email sending failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("Email sending timeout")
            return False
        except Exception as e:
            logger.error(f"Email sending error: {e}")
            return False
    
    # Database management methods
    def list_candidatures(self, status: Optional[str] = None):
        """List all candidatures."""
        return self.db_manager.list_candidatures(status=status)
    
    def get_candidature_details(self, candidature_id: int):
        """Get complete candidature details with analysis."""
        return self.db_manager.get_candidature_with_analysis(candidature_id)
    
    def update_candidature_status(self, candidature_id: int, status: str, notes: str = None):
        """Update candidature status."""
        return self.db_manager.update_candidature_status(candidature_id, status, notes)
    
    def delete_candidature(self, candidature_id: int):
        """Delete candidature and all related data."""
        return self.db_manager.delete_candidature(candidature_id)
    
    def get_statistics(self):
        """Get comprehensive statistics."""
        return self.db_manager.get_database_stats()
    
    def cleanup(self):
        """Clean up all resources."""
        self.db_manager.close()

def main():
    """Main CLI interface."""
    parser = argparse.ArgumentParser(
        description="Complete Business Plan Analyzer - All 4 Tasks Integrated",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Complete Workflow Examples:
  # Process business plan (all 4 tasks)
  python main_analyzer.py --process --pdf plan.pdf --business "My Startup" --email "contact@startup.com"
  
  # Use high-quality extraction and AI analysis
  python main_analyzer.py --process --pdf plan.pdf --business "TechCorp" --email "info@tech.com" --extract-method high_quality --analyze-method ai
  
Management Commands:
  # List all candidatures
  python main_analyzer.py --list
  
  # Get candidature details
  python main_analyzer.py --get-details 1
  
  # Update status
  python main_analyzer.py --update-status 1 --status eligible --notes "Approved for incubation"
  
  # Delete candidature
  python main_analyzer.py --delete 1
  
  # Show statistics
  python main_analyzer.py --stats
        """
    )
    
    # Processing arguments
    parser.add_argument("--process", action="store_true", help="Process complete workflow")
    parser.add_argument("--pdf", help="Path to PDF business plan")
    parser.add_argument("--business", help="Business name")
    parser.add_argument("--email", help="Contact email")
    parser.add_argument("--extract-method", choices=["auto", "fast", "high_quality"], 
                       default="auto", help="PDF extraction method")
    parser.add_argument("--analyze-method", choices=["auto", "ai", "rule_based"],
                       default="auto", help="Analysis method")
    parser.add_argument("--model", default="llama3.2:1b", help="Ollama model to use")
    
    # Management arguments
    parser.add_argument("--list", action="store_true", help="List all candidatures")
    parser.add_argument("--get-details", type=int, help="Get candidature details by ID")
    parser.add_argument("--update-status", type=int, help="Update candidature status by ID")
    parser.add_argument("--status", choices=["pending", "eligible", "not_eligible", "accepted", "rejected"],
                       help="New status for candidature")
    parser.add_argument("--notes", help="Notes for status update")
    parser.add_argument("--delete", type=int, help="Delete candidature by ID")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")
    
    # System arguments
    parser.add_argument("--test-components", action="store_true", help="Test all components")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Initialize main analyzer
        analyzer = MainBusinessPlanAnalyzer(ollama_model=args.model)
        
        if args.process:
            # Complete workflow processing
            if not all([args.pdf, args.business, args.email]):
                print("Error: --process requires --pdf, --business, and --email arguments")
                sys.exit(1)
            
            if not os.path.exists(args.pdf):
                print(f"Error: PDF file not found: {args.pdf}")
                sys.exit(1)
            
            print(f"\nStarting Complete Business Plan Analysis")
            print("=" * 60)
            print(f"PDF: {args.pdf}")
            print(f"Business: {args.business}")
            print(f"Email: {args.email}")
            print(f"Extraction Method: {args.extract_method}")
            print(f"Analysis Method: {args.analyze_method}")
            print(f"Model: {args.model}")
            
            result = analyzer.process_complete_workflow(
                pdf_path=args.pdf,
                business_name=args.business,
                contact_email=args.email,
                extraction_method=args.extract_method,
                analysis_method=args.analyze_method
            )
            
            if result["success"]:
                print(f"\n🎉 WORKFLOW COMPLETED SUCCESSFULLY")
                print("=" * 60)
                print(f"✅ Candidature ID: {result['candidature_id']}")
                print(f"✅ Status: {result['workflow']['status'].upper()}")
                print(f"✅ Total Time: {result['workflow']['total_time']:.2f}s")
                print(f"✅ Email Sent: {result.get('email_sent', 'Unknown')}")
                
                print(f"\n📄 EXTRACTION RESULTS:")
                ext = result['extraction']
                print(f"   Method: {ext['method']}")
                print(f"   Words Extracted: {ext['word_count']}")
                print(f"   Confidence: {ext['confidence']:.2f}")
                print(f"   Time: {ext['processing_time']:.2f}s")
                
                print(f"\n🤖 ANALYSIS RESULTS:")
                ana = result['analysis']
                print(f"   Method: {ana['method']}")
                print(f"   Score: {ana['total_score']:.1f}/100")
                print(f"   Eligible: {ana['is_eligible']}")
                print(f"   Confidence: {ana['confidence']:.2f}")
                print(f"   Time: {ana['processing_time']:.2f}s")
                
                if result.get('report_filename'):
                    print(f"\n📊 Report Generated: {result['report_filename']}")
                
                print(f"\n💾 All results stored in database")
                print(f"🔗 Candidature linked to extracted text and analysis")
                
            else:
                print(f"\n❌ WORKFLOW FAILED")
                print(f"Error: {result['error']}")
                if result.get('candidature_id'):
                    print(f"Candidature ID: {result['candidature_id']} (marked as failed)")
        
        elif args.list:
            # List candidatures
            candidatures = analyzer.list_candidatures()
            print(f"\n📋 ALL CANDIDATURES ({len(candidatures)} total)")
            print("=" * 80)
            
            for c in candidatures:
                print(f"ID: {c.id:3d} | {c.business_name[:30]:30s} | {c.status:12s} | {c.submission_date}")
                print(f"     Email: {c.contact_email}")
                print(f"     PDF: {c.pdf_filename}")
                print("-" * 80)
        
        elif args.get_details:
            # Get candidature details
            details = analyzer.get_candidature_details(args.get_details)
            if details:
                c = details['candidature']
                print(f"\n📊 CANDIDATURE DETAILS (ID: {args.get_details})")
                print("=" * 80)
                print(f"Business: {c.business_name}")
                print(f"Email: {c.contact_email}")
                print(f"Status: {c.status}")
                print(f"PDF: {c.pdf_filename}")
                print(f"Submitted: {c.submission_date}")
                print(f"Updated: {c.updated_at}")
                
                if details.get('analysis'):
                    a = details['analysis']
                    print(f"\n📈 ANALYSIS RESULTS:")
                    print(f"   Score: {a.total_score}/100")
                    print(f"   Eligible: {a.is_eligible}")
                    print(f"   Method: {a.model_used}")
                    print(f"   Date: {a.analysis_date}")
                    print(f"   Confidence: {a.confidence_score}")
                else:
                    print(f"\n⚠️  No analysis results available")
            else:
                print(f"❌ Candidature {args.get_details} not found")
        
        elif args.update_status and args.status:
            # Update candidature status
            success = analyzer.update_candidature_status(args.update_status, args.status, args.notes)
            if success:
                print(f"✅ Candidature {args.update_status} status updated to: {args.status}")
                if args.notes:
                    print(f"   Notes: {args.notes}")
            else:
                print(f"❌ Failed to update candidature {args.update_status}")
        
        elif args.delete:
            # Delete candidature
            success = analyzer.delete_candidature(args.delete)
            if success:
                print(f"✅ Candidature {args.delete} deleted successfully")
            else:
                print(f"❌ Failed to delete candidature {args.delete}")
        
        elif args.stats:
            # Show statistics
            stats = analyzer.get_statistics()
            print(f"\n📊 DATABASE STATISTICS")
            print("=" * 50)
            for key, value in stats.items():
                print(f"{key:25s}: {value}")
        
        elif args.test_components:
            # Test all components
            print(f"\n🧪 TESTING ALL COMPONENTS")
            print("=" * 50)
            
            # Test PDF extractor
            print(f"📄 PDF Extractor:")
            extractor_methods = analyzer.pdf_extractor.available_methods
            for method, available in extractor_methods.items():
                status = "✅" if available else "❌"
                print(f"   {method}: {status}")
            
            # Test AI client
            print(f"\n🤖 AI Client:")
            ai_info = analyzer.ai_client.get_server_info()
            print(f"   Server: {'✅ UP' if ai_info['server_up'] else '❌ DOWN'}")
            print(f"   Models: {len(ai_info['available_models'])}")
            print(f"   Recommended: {ai_info['recommended_model']}")
            
            # Test database
            print(f"\n💾 Database:")
            try:
                stats = analyzer.get_statistics()
                print(f"   Connection: ✅ OK")
                print(f"   Candidatures: {stats.get('total_candidatures', 0)}")
                print(f"   Analyses: {stats.get('total_analyses', 0)}")
            except Exception as e:
                print(f"   Connection: ❌ ERROR - {e}")
            
            print(f"\n✅ Component testing completed")
        
        else:
            # No arguments provided
            print("Business Plan Analyzer - Complete 4-Task Integration")
            print("=" * 55)
            print("No action specified. Use --help for available options.")
            print("\nQuick start:")
            print("  Process PDF:  python main_analyzer.py --process --pdf plan.pdf --business 'My Company' --email 'me@company.com'")
            print("  List all:     python main_analyzer.py --list")
            print("  Show stats:   python main_analyzer.py --stats")
            print("  Test system:  python main_analyzer.py --test-components")
        
        # Cleanup
        analyzer.cleanup()
        
    except KeyboardInterrupt:
        print("\n⚠️  Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        logger.error(f"Application error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()