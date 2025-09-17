import os

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database settings
DB_PATH = os.path.join(BASE_DIR, 'data', 'database', 'nanonets_extraction.db')

# Email settings
SMTP_CONFIG = {
    'host': 'smtp.gmail.com',
    'port': 587,
    'username': 'your-email@gmail.com',
    'password': 'hbbountalkwhhcuv',
    'encryption': 'tls'
}

# Report settings
REPORT_DIR = os.path.join(BASE_DIR, 'data', 'reports')

# AI settings
AI_MODEL = 'llama3.1:8b'
AI_TIMEOUT = 300  # 5 minutes