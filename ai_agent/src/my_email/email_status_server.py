#!/usr/bin/env python3
"""
Email Status Web Server
Provides web endpoints for email status and queue management
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config.email_config import get_config
from my_email.email_service import EmailService

class EmailStatusHandler(BaseHTTPRequestHandler):
    """HTTP handler for email status endpoints"""
    
    def __init__(self, *args, **kwargs):
        self.config = get_config()
        self.email_service = EmailService(
            smtp_config=self.config['smtp'],
            template_dir=self.config['template_path'],
            db_path=self.config['db_path']
        )
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)
        
        if path == '/email/status':
            self.handle_email_status()
        elif path == '/email/queue':
            self.handle_queue_status()
        elif path == '/email/stats':
            self.handle_email_stats()
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        if path == '/email/process':
            self.handle_process_queue()
        elif path == '/email/add':
            self.handle_add_to_queue()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_email_status(self):
        """Get overall email system status"""
        try:
            stats = self.email_service.get_service_stats()
            
            status_data = {
                "status": "operational",
                "timestamp": self.get_current_timestamp(),
                "statistics": stats,
                "smtp_configured": bool(self.config['smtp']['username']),
                "template_path_exists": os.path.exists(self.config['template_path'])
            }
            
            self.send_json_response(status_data)
            
        except Exception as e:
            self.send_error_response(f"Failed to get email status: {str(e)}")
    
    def handle_queue_status(self):
        """Get email queue status"""
        try:
            from my_email.email_manager import EmailDatabaseManager
            
            email_db = EmailDatabaseManager(self.config['db_path'])
            pending_emails = email_db.get_pending_emails(limit=100)
            
            queue_data = {
                "pending_count": len(pending_emails),
                "pending_emails": [
                    {
                        "id": email["id"],
                        "recipient": email["recipient_email"],
                        "business": email["business_name"],
                        "created_at": email["created_at"]
                    }
                    for email in pending_emails[:10]  # Show first 10
                ]
            }
            
            email_db.close()
            self.send_json_response(queue_data)
            
        except Exception as e:
            self.send_error_response(f"Failed to get queue status: {str(e)}")
    
    def handle_email_stats(self):
        """Get detailed email statistics"""
        try:
            stats = self.email_service.get_service_stats()
            self.send_json_response(stats)
            
        except Exception as e:
            self.send_error_response(f"Failed to get email stats: {str(e)}")
    
    def handle_process_queue(self):
        """Process email queue"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            batch_size = 10
            if post_data:
                try:
                    data = json.loads(post_data)
                    batch_size = data.get('batch_size', 10)
                except json.JSONDecodeError:
                    pass
            
            results = self.email_service.process_email_queue(batch_size)
            self.send_json_response(results)
            
        except Exception as e:
            self.send_error_response(f"Failed to process queue: {str(e)}")
    
    def handle_add_to_queue(self):
        """Add candidature to email queue"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(post_data)
            
            candidature_id = data.get('candidature_id')
            if not candidature_id:
                self.send_error_response("candidature_id is required")
                return
            
            success = self.email_service.add_candidature_to_queue(candidature_id)
            
            response_data = {
                "success": success,
                "candidature_id": candidature_id,
                "message": "Added to queue" if success else "Failed to add to queue"
            }
            
            self.send_json_response(response_data)
            
        except Exception as e:
            self.send_error_response(f"Failed to add to queue: {str(e)}")
    
    def send_json_response(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))
    
    def send_error_response(self, message, status_code=500):
        """Send error response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        error_data = {
            "error": message,
            "timestamp": self.get_current_timestamp()
        }
        
        self.wfile.write(json.dumps(error_data, indent=2).encode('utf-8'))
    
    def get_current_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def main():
    """Start email status server"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Email Status Web Server")
    parser.add_argument('--port', type=int, default=8001, help='Server port')
    parser.add_argument('--host', default='localhost', help='Server host')
    
    args = parser.parse_args()
    
    server_address = (args.host, args.port)
    httpd = HTTPServer(server_address, EmailStatusHandler)
    
    print(f"Email Status Server starting on http://{args.host}:{args.port}")
    print(f"Available endpoints:")
    print(f"  GET  /email/status  - System status")
    print(f"  GET  /email/queue   - Queue status")
    print(f"  GET  /email/stats   - Statistics")
    print(f"  POST /email/process - Process queue")
    print(f"  POST /email/add     - Add to queue")
    print(f"Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        httpd.server_close()

if __name__ == "__main__":
    main()