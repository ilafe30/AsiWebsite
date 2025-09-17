<?php
// Load environment variables
$env = parse_ini_file(__DIR__ . '/.env');

return [
    'template_path' => __DIR__ . '/../email_templates/',
    'base_url' => $env['BASE_URL'] ?? 'http://localhost:8000',
    'smtp' => [
        'host' => $env['SMTP_HOST'] ?? 'smtp.gmail.com',
        'port' => $env['SMTP_PORT'] ?? 587,
        'username' => $env['SMTP_USERNAME'] ?? '',
        'password' => $env['SMTP_PASSWORD'] ?? '',
        'encryption' => $env['SMTP_ENCRYPTION'] ?? 'tls'
    ],
    'support' => [
        'email' => $env['SUPPORT_EMAIL'] ?? 'support@incubateur.com',
        'phone' => $env['SUPPORT_PHONE'] ?? '+33 1 23 45 67 89'
    ],
    'db_path' => __DIR__ . '/../data/database/nanonets_extraction.db',
    'token_secret' => $env['REPORT_ACCESS_TOKEN_SECRET'] ?? 'default_secret_change_in_production'
];