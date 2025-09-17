#!/usr/bin/env python3
"""
Unified Configuration for ASI Project
Ensures both objectives use consistent configuration
"""

import os
from typing import Dict, Any

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class UnifiedConfig:
    """Unified configuration class for both objectives"""
    
    def __init__(self):
        self.base_dir = BASE_DIR
        self.data_dir = os.path.join(self.base_dir, 'data')
        self.reports_dir = os.path.join(self.data_dir, 'reports')
        self.database_dir = os.path.join(self.data_dir, 'database')
        
        # Ensure directories exist
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)
        os.makedirs(self.database_dir, exist_ok=True)
    
    @property
    def db_path(self) -> str:
        """Single database path for all components"""
        return os.path.join(self.database_dir, 'nanonets_extraction.db')
    
    @property
    def template_path(self) -> str:
        """Email templates directory"""
        return os.path.join(self.base_dir, 'email_templates')
    
    @property
    def smtp_config(self) -> Dict[str, Any]:
        """SMTP configuration with environment variable support"""
        return {
            'host': os.environ.get('SMTP_HOST', 'smtp.gmail.com'),
            'port': int(os.environ.get('SMTP_PORT', '587')),
            'username': os.environ.get('SMTP_USERNAME', ''),
            'password': os.environ.get('SMTP_PASSWORD', ''),
            'encryption': os.environ.get('SMTP_ENCRYPTION', 'tls')
        }
    
    @property
    def ai_config(self) -> Dict[str, Any]:
        """AI model configuration"""
        return {
            'model': os.environ.get('AI_MODEL', 'llama3.2:1b'),
            'timeout': int(os.environ.get('AI_TIMEOUT', '300')),
            'host': os.environ.get('OLLAMA_HOST', 'localhost'),
            'port': int(os.environ.get('OLLAMA_PORT', '11434'))
        }
    
    def get_config(self) -> Dict[str, Any]:
        """Get complete unified configuration"""
        return {
            'db_path': self.db_path,
            'template_path': self.template_path,
            'reports_dir': self.reports_dir,
            'smtp': self.smtp_config,
            'ai': self.ai_config,
            'base_dir': self.base_dir
        }
    
    def validate_config(self) -> Dict[str, bool]:
        """Validate configuration completeness"""
        validation = {
            'database_dir_exists': os.path.exists(self.database_dir),
            'template_dir_exists': os.path.exists(self.template_path),
            'reports_dir_exists': os.path.exists(self.reports_dir),
            'smtp_configured': bool(self.smtp_config['username']),
            'email_template_exists': os.path.exists(
                os.path.join(self.template_path, 'business_plan_email_template.html')
            )
        }
        return validation

# Global unified configuration instance
_unified_config = UnifiedConfig()

def get_unified_config() -> Dict[str, Any]:
    """Get unified configuration for all components"""
    return _unified_config.get_config()

def get_db_path() -> str:
    """Get standardized database path"""
    return _unified_config.db_path

def validate_setup() -> bool:
    """Validate complete setup"""
    validation = _unified_config.validate_config()
    
    print("Configuration Validation:")
    for check, result in validation.items():
        status = "✅" if result else "❌"
        print(f"  {status} {check}")
    
    return all(validation.values())

# Updated settings.py replacement
# Database settings - USE THIS EVERYWHERE
DB_PATH = get_db_path()

# Email settings - USE THIS EVERYWHERE  
EMAIL_CONFIG = get_unified_config()

# AI settings
AI_CONFIG = _unified_config.ai_config

if __name__ == "__main__":
    print("🔧 Unified Configuration Validation")
    print("=" * 40)
    
    config = get_unified_config()
    print(f"Database Path: {config['db_path']}")
    print(f"Templates Path: {config['template_path']}")
    print(f"Reports Dir: {config['reports_dir']}")
    print(f"SMTP Host: {config['smtp']['host']}")
    print(f"AI Model: {config['ai']['model']}")
    
    print("\nValidation Results:")
    is_valid = validate_setup()
    
    if is_valid:
        print("\n✅ Configuration is complete and valid!")
    else:
        print("\n❌ Configuration needs attention!")