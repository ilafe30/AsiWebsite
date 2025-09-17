# simple_report_server.py
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ReportHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Get the absolute path to the reports directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        reports_dir = os.path.join(base_dir, 'data', 'reports')
        os.makedirs(reports_dir, exist_ok=True)
        super().__init__(*args, directory=reports_dir, **kwargs)
    
    def log_message(self, format, *args):
        logger.info(format % args)

def run_server():
    server_address = ('localhost', 8000)
    httpd = HTTPServer(server_address, ReportHTTPRequestHandler)
    logger.info("Serving reports on http://localhost:8000")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()