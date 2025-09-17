# Email Module Integration - Complete Setup Guide

## Current Status
Your email sending module is **90% complete** but needs configuration and testing.

## Quick Setup (5 minutes)

### 1. Create Configuration Files

```bash
cd phase1/objectif1.2/config/
```

Create `email_config.py` with the provided code and copy `.env.template` to `.env`:

```bash
cp .env.template .env
```

### 2. Configure SMTP Credentials

Edit `.env` file with your Gmail credentials:

```bash
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Not your regular password!
SMTP_ENCRYPTION=tls
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App passwords
3. Generate "App password" for Mail
4. Use the 16-character password (spaces removed)

### 3. Create Missing Text Template

Save the text template I provided as:
```
phase1/objectif1.2/email_templates/business_plan_email_template.txt
```

### 4. Test the System

```bash
cd phase1/objectif1.2/
python test_email_system.py
```

### 5. Send Test Email

```bash
python -c "
import sys
sys.path.insert(0, 'src')
from config.email_config import get_config
from my_email.email_sender import ProfessionalEmailSender

config = get_config()
sender = ProfessionalEmailSender(config['smtp'], config['template_path'])

test_data = {
    'total_score': 85.5,
    'is_eligible': True,
    'analysis_method': 'Test',
    'confidence_score': 92.0,
    'summary': 'Test email verification',
    'criteria_results': [
        {'criterion_name': 'Équipe', 'earned_points': 8.5, 'max_points': 10}
    ],
    'recommendations': ['Test recommendation']
}

success = sender.send_business_plan_email(
    recipient_email='your-email@gmail.com',
    recipient_name='Test User',
    business_name='Test Company',
    candidature_id='TEST-001',
    analysis_data=test_data
)

print('Email sent!' if success else 'Email failed!')
"
```

## Full Integration

### 1. Update main_analyser.py

Add this to your `__init__` method:

```python
# Initialize email service
try:
    from config.email_config import get_config
    from my_email.email_service import EmailService
    
    config = get_config()
    self.email_service = EmailService(
        smtp_config=config['smtp'],
        template_dir=config['template_path'],
        db_path=config['db_path']
    )
    logger.info("Email service initialized successfully")
except Exception as e:
    logger.warning(f"Email service not available: {e}")
    self.email_service = None
```

### 2. Process Email Queue

Create automated email processing:

```bash
# Process queue once
python process_email_queue.py process

# Monitor continuously (every 5 minutes)
python process_email_queue.py monitor

# Check status
python process_email_queue.py status

# Add test emails
python process_email_queue.py test --count 3
```

### 3. Web Interface (Optional)

Start email status server:

```bash
python email_status_server.py --port 8001
```

Access endpoints:
- `http://localhost:8001/email/status` - System status
- `http://localhost:8001/email/queue` - Queue status
- `http://localhost:8001/email/stats` - Statistics

## Production Deployment

### 1. Environment Variables
Never commit `.env` file. Use system environment variables:

```bash
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export SUPPORT_EMAIL="support@yourcompany.com"
```

### 2. Scheduled Processing
Add to crontab for automatic email processing:

```bash
# Process emails every 10 minutes
*/10 * * * * cd /path/to/project && python process_email_queue.py process
```

### 3. Monitoring
Set up log monitoring:

```bash
tail -f email_queue_processor.log
```

## Alternative SMTP Providers

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

### Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your-email@company.com
SMTP_PASSWORD=your-password
```

## Troubleshooting

### Common Issues

1. **"SMTP credentials not configured"**
   - Check `.env` file exists and has correct values
   - Verify environment variables are loaded

2. **"Authentication failed"**
   - Use App Password, not regular Gmail password
   - Enable 2-Factor Authentication first

3. **"Template not found"**
   - Verify both HTML and TXT templates exist
   - Check template path configuration

4. **"Database connection failed"**
   - Ensure database file exists
   - Check file permissions

### Debug Mode

Run with verbose logging:
```bash
python test_email_system.py --verbose
```

### Test Components Individually

```bash
# Test only configuration
python -c "from config.email_config import get_config; print(get_config())"

# Test only database
python -c "from database.database_manager import DatabaseManager; db = DatabaseManager(); print('OK')"

# Test only SMTP connection
python -c "import smtplib; s = smtplib.SMTP('smtp.gmail.com', 587); s.starttls(); print('SMTP OK')"
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use App Passwords** instead of account passwords
3. **Enable rate limiting** to avoid being flagged as spam
4. **Monitor failed attempts** for suspicious activity
5. **Use TLS encryption** for SMTP connections

## Performance Optimization

1. **Batch processing**: Process 10-20 emails at once
2. **Rate limiting**: 2-second delay between emails
3. **Retry logic**: Automatic retry for failed emails
4. **Monitoring**: Track success rates and failures

## Task Completion Checklist

- [x] **Email sender implementation** - Professional email sending with templates
- [x] **Database integration** - Email queue and tracking tables
- [x] **Template system** - HTML and text email templates
- [x] **Error handling** - Comprehensive error logging and retry logic
- [x] **Rate limiting** - Prevent spam flagging
- [x] **Configuration management** - Environment variable support
- [x] **CLI interface** - Command-line tools for management
- [x] **Web interface** - HTTP endpoints for monitoring
- [x] **Security features** - Credential protection and validation
- [ ] **SMTP configuration** - Configure with your email provider
- [ ] **Testing** - Send test emails to verify functionality
- [ ] **Production deployment** - Set up automated processing

## Next Steps

1. **Configure SMTP** with your email provider
2. **Run tests** to verify everything works
3. **Integrate** with your main analyzer
4. **Deploy** to production environment
5. **Monitor** email delivery and success rates

Your email module is ready for production use once you complete the configuration step!