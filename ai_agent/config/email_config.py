#!/usr/bin/env python3
"""
Email Configuration Module
Loads email settings from environment variables for security
"""

import os
from typing import Dict, Any

def get_config() -> Dict[str, Any]:
    """
    Get email configuration from environment variables.
    Falls back to default values for development.
    """
    
    # Load from environment variables (recommended for production)
    config = {
        'template_path': os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'email_templates'
        ),
        'base_url': os.getenv('BASE_URL', 'http://localhost:8000'),
        
        'smtp': {
            'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
            'port': int(os.getenv('SMTP_PORT', '587')),
            'username': os.getenv('SMTP_USERNAME', ''),
            'password': os.getenv('SMTP_PASSWORD', ''),
            'encryption': os.getenv('SMTP_ENCRYPTION', 'tls')
        },
        
        'support': {
            'email': os.getenv('SUPPORT_EMAIL', 'support@incubateur.com'),
            'phone': os.getenv('SUPPORT_PHONE', '+33 1 23 45 67 89')
        },
        
        'db_path': os.getenv('DB_PATH', os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'data', 
            'database', 
            'nanonets_extraction.db'
        )),
        
        'rate_limiting': {
            'min_interval_seconds': int(os.getenv('EMAIL_RATE_LIMIT', '2')),
            'daily_limit': int(os.getenv('EMAIL_DAILY_LIMIT', '100'))
        },
        
        'security': {
            'token_secret': os.getenv('REPORT_ACCESS_TOKEN_SECRET', 'change_in_production_123!'),
            'encrypt_emails': os.getenv('ENCRYPT_EMAILS', 'false').lower() == 'true'
        }
    }
    
    # Validation
    if not config['smtp']['username'] or not config['smtp']['password']:
        print("⚠️  Warning: SMTP credentials not configured!")
        print("   Set SMTP_USERNAME and SMTP_PASSWORD environment variables")
        print("   Or create a .env file with your credentials")
    
    return config

def load_env_file(filepath: str = '.env'):
    """
    Load environment variables from .env file
    """
    env_path = os.path.join(os.path.dirname(__file__), filepath)
    
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
        print(f"✅ Environment variables loaded from {filepath}")
    else:
        print(f"⚠️  Environment file {filepath} not found")

# Auto-load .env file when module is imported
load_env_file()