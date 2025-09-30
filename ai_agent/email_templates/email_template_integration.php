<?php
/**
 * Business Plan Analysis Email Template System
 * ============================================
 * 
 * This class handles the automatic email sending after business plan analysis.
 * It integrates with your Python analysis system and sends personalized emails
 * with dynamic content based on analysis results.
 * 
 * Task 1.4 - Email automatique
 */

class BusinessPlanEmailTemplate {
    
    private $smtp_config;
    private $template_path;
    private $base_url;
    private $default_values;
    
    public function __construct($config = []) {
        $this->smtp_config = $config['smtp'] ?? [
            'host' => 'localhost',
            'port' => 587,
            'username' => '',
            'password' => '',
            'encryption' => 'tls'
        ];
        
        $this->template_path = $config['template_path'] ?? './email_templates/';
        $this->base_url = $config['base_url'] ?? 'https://incubateur.example.com';
        
        // Default values for variables (fallback in case of missing data)
        $this->default_values = [
            'BUSINESS_NAME' => 'Entreprise',
            'SUBMISSION_DATE' => date('d/m/Y'),
            'TOTAL_SCORE' => '0',
            'STATUS_TEXT' => 'EN COURS D\'ANALYSE',
            'STATUS_CLASS' => 'pending',
            'ANALYSIS_METHOD' => 'Analyse automatique',
            'CONFIDENCE_SCORE' => '85',
            'CANDIDATURE_ID' => 'N/A',
            'ANALYSIS_DATE' => date('d/m/Y à H:i'),
            'EMAIL_DATE' => date('d/m/Y à H:i'),
            'SUPPORT_EMAIL' => 'support@incubateur.com',
            'WEBSITE_URL' => 'https://www.incubateur.com',
            'PHONE' => '+33 1 23 45 67 89',
            'REPORT_URL' => $this->base_url . '/reports/{{CANDIDATURE_ID}}',
            'UNSUBSCRIBE_URL' => $this->base_url . '/unsubscribe',
            
            // Default scores for all criteria
            'EQUIPE_SCORE' => '0', 'EQUIPE_CLASS' => 'poor', 'EQUIPE_PERCENT' => '0',
            'PROBLEMATIQUE_SCORE' => '0', 'PROBLEMATIQUE_CLASS' => 'poor', 'PROBLEMATIQUE_PERCENT' => '0',
            'SOLUTION_MARCHE_SCORE' => '0', 'SOLUTION_MARCHE_CLASS' => 'poor', 'SOLUTION_MARCHE_PERCENT' => '0',
            'SOLUTION_PROPOSEE_SCORE' => '0', 'SOLUTION_PROPOSEE_CLASS' => 'poor', 'SOLUTION_PROPOSEE_PERCENT' => '0',
            'FEUILLE_ROUTE_SCORE' => '0', 'FEUILLE_ROUTE_CLASS' => 'poor', 'FEUILLE_ROUTE_PERCENT' => '0',
            'CLIENTELE_SCORE' => '0', 'CLIENTELE_CLASS' => 'poor', 'CLIENTELE_PERCENT' => '0',
            'CONCURRENTS_SCORE' => '0', 'CONCURRENTS_CLASS' => 'poor', 'CONCURRENTS_PERCENT' => '0',
            'DIFFERENCIATION_SCORE' => '0', 'DIFFERENCIATION_CLASS' => 'poor', 'DIFFERENCIATION_PERCENT' => '0',
            'STRATEGIE_SCORE' => '0', 'STRATEGIE_CLASS' => 'poor', 'STRATEGIE_PERCENT' => '0',
            'BUSINESS_MODEL_SCORE' => '0', 'BUSINESS_MODEL_CLASS' => 'poor', 'BUSINESS_MODEL_PERCENT' => '0',
            'FINANCEMENTS_SCORE' => '0', 'FINANCEMENTS_CLASS' => 'poor', 'FINANCEMENTS_PERCENT' => '0',
            'STATUT_JURIDIQUE_SCORE' => '0', 'STATUT_JURIDIQUE_CLASS' => 'poor', 'STATUT_JURIDIQUE_PERCENT' => '0',
            
            // Default recommendations
            'RECOMMENDATION_1' => 'Améliorer la structure générale du business plan',
            'RECOMMENDATION_2' => 'Fournir plus de données quantitatives',
            'RECOMMENDATION_3' => 'Développer l\'analyse de marché',
            'RECOMMENDATION_4' => '',
            'RECOMMENDATION_5' => '',
            
            'EXECUTIVE_SUMMARY' => 'Votre business plan nécessite des améliorations dans plusieurs domaines clés pour répondre aux critères d\'éligibilité de notre programme d\'incubation.',
            'BUSINESS_SECTOR' => 'Non spécifié',
            'DEVELOPMENT_STAGE' => 'Non spécifié',
            'TARGET_MARKET' => 'Non spécifié',
            'FUNDING_REQUIRED' => 'Non spécifié'
        ];
    }
    
    /**
     * Send business plan analysis email
     */
    public function sendAnalysisEmail($analysis_data) {
        try {
            // Add debugging
            error_log("Sending email with data: " . json_encode($analysis_data));
            
            // Validate and prepare data
            $email_data = $this->prepareEmailData($analysis_data);
            
            // Add more debugging
            error_log("Prepared email data: " . json_encode($email_data));
            
            // Load and process HTML template
            $html_content = $this->processTemplate('business_plan_email_template.html', $email_data);
            
            // Create a simple text version if txt template doesn't exist
            $text_content = $this->createTextVersion($email_data);
            
            // Send email
            $success = $this->sendEmail(
                $email_data['recipient_email'],
                $email_data['recipient_name'],
                'Résultats de l\'analyse de votre business plan - ' . $email_data['BUSINESS_NAME'],
                $html_content,
                $text_content
            );
            
            // Log email sending
            $this->logEmailSent($email_data, $success);
            
            return $success;
            
        } catch (Exception $e) {
            error_log("Email sending error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Prepare email data from analysis results
     */
    private function prepareEmailData($analysis_data) {
        // Start with defaults
        $email_data = $this->default_values;
        
        // Override with actual data
        $email_data['recipient_email'] = $analysis_data['contact_email'] ?? '';
        $email_data['recipient_name'] = $analysis_data['business_name'] ?? 'Entreprise';
        $email_data['BUSINESS_NAME'] = $analysis_data['business_name'] ?? 'Entreprise';
        $email_data['CANDIDATURE_ID'] = $analysis_data['candidature_id'] ?? 'N/A';
        $email_data['SUBMISSION_DATE'] = $this->formatDate($analysis_data['submission_date'] ?? null);
        $email_data['ANALYSIS_DATE'] = $this->formatDate($analysis_data['analysis_date'] ?? null);
        $email_data['EMAIL_DATE'] = date('d/m/Y à H:i');
        
        // Process analysis results if available
        if (isset($analysis_data['analysis'])) {
            $analysis = $analysis_data['analysis'];
            
            $total_score = floatval($analysis['total_score'] ?? 0);
            $email_data['TOTAL_SCORE'] = number_format($total_score, 1);
            $email_data['CONFIDENCE_SCORE'] = number_format($analysis['confidence_score'] ?? 85, 0);
            $email_data['ANALYSIS_METHOD'] = $analysis['analysis_method'] ?? 'Analyse automatique';
            
            // Determine status
            $is_eligible = $analysis['is_eligible'] ?? false;
            $email_data['STATUS_TEXT'] = $is_eligible ? 'ACCEPTÉ POUR L\'INCUBATION' : 'NON RETENU POUR L\'INCUBATION';
            $email_data['STATUS_CLASS'] = $is_eligible ? 'accepted' : 'rejected';
            
            // Process criteria scores
            if (isset($analysis['criteria_results']) && is_array($analysis['criteria_results'])) {
                $this->processCriteriaScores($email_data, $analysis['criteria_results']);
            }
            
            // Process recommendations
            if (isset($analysis['recommendations']) && is_array($analysis['recommendations'])) {
                $this->processRecommendations($email_data, $analysis['recommendations']);
            }
            
            // Process summary
            if (isset($analysis['summary'])) {
                $email_data['EXECUTIVE_SUMMARY'] = $analysis['summary'];
            }
        }
        
        // Generate URLs
        $email_data['REPORT_URL'] = $this->base_url . '/reports/' . $email_data['CANDIDATURE_ID'];
        $email_data['UNSUBSCRIBE_URL'] = $this->base_url . '/unsubscribe?token=' . 
            hash('sha256', $email_data['recipient_email'] . $email_data['CANDIDATURE_ID']);
        
        return $email_data;
    }
    
    /**
     * Process criteria scores and assign CSS classes
     */
    private function processCriteriaScores(&$email_data, $criteria_results) {
        $criteria_mapping = [
            1 => 'EQUIPE',
            2 => 'PROBLEMATIQUE', 
            3 => 'SOLUTION_MARCHE',
            4 => 'SOLUTION_PROPOSEE',
            5 => 'FEUILLE_ROUTE',
            6 => 'CLIENTELE',
            7 => 'CONCURRENTS',
            8 => 'DIFFERENCIATION',
            9 => 'STRATEGIE',
            10 => 'BUSINESS_MODEL',
            11 => 'FINANCEMENTS',
            12 => 'STATUT_JURIDIQUE'
        ];
        
        foreach ($criteria_results as $criterion) {
            $criterion_id = intval($criterion['criterion_id'] ?? 0);
            $earned_points = floatval($criterion['earned_points'] ?? 0);
            $max_points = floatval($criterion['max_points'] ?? 1);
            
            if (isset($criteria_mapping[$criterion_id])) {
                $key = $criteria_mapping[$criterion_id];
                $email_data[$key . '_SCORE'] = number_format($earned_points, 1);
                
                // Calculate percentage
                $percentage = $max_points > 0 ? ($earned_points / $max_points) * 100 : 0;
                $email_data[$key . '_PERCENT'] = number_format($percentage, 0);
                
                // Assign CSS class based on performance
                if ($percentage >= 80) {
                    $email_data[$key . '_CLASS'] = 'excellent';
                } elseif ($percentage >= 60) {
                    $email_data[$key . '_CLASS'] = 'good';
                } elseif ($percentage >= 40) {
                    $email_data[$key . '_CLASS'] = 'average';
                } else {
                    $email_data[$key . '_CLASS'] = 'poor';
                }
            }
        }
    }
    
    /**
     * Process recommendations
     */
/**
 * Process recommendations - FIXED VERSION
 */
private function processRecommendations(&$email_data, $recommendations) {
    error_log("Processing recommendations: " . json_encode($recommendations));
    
    $email_data['RECOMMENDATIONS_HTML'] = '';
    
    if (empty($recommendations) || !is_array($recommendations)) {
        error_log("No recommendations found or not an array. Generating fallback.");
        $email_data['RECOMMENDATIONS_HTML'] = $this->generateFallbackRecommendations($email_data);
        return;
    }
    
    $count = 0;
    foreach ($recommendations as $index => $rec) {
        if (empty(trim($rec))) continue;
        
        $count++;
        
        // Extract priority and content from AI recommendation
        $priority = 'MOYENNE'; // default
        $content = htmlspecialchars($rec);
        
        // Parse format: "PRIORITÉ - TITRE: Description"
        if (preg_match('/^(CRITIQUE|HAUTE|MOYENNE|FAIBLE)\s*-\s*(.*?):\s*(.*)/i', $rec, $matches)) {
            $priority = strtoupper($matches[1]);
            $title = htmlspecialchars($matches[2]);
            $description = htmlspecialchars($matches[3]);
            $content = "<strong>$title:</strong> $description";
        }
        
        $priorityColor = [
            'CRITIQUE' => '#dc3545',
            'HAUTE' => '#fd7e14', 
            'MOYENNE' => '#ffc107',
            'FAIBLE' => '#6c757d'
        ][$priority] ?? '#ffc107';
        
        $email_data['RECOMMENDATIONS_HTML'] .= "
            <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #003255; line-height: 1.6; font-size: 14px;'>
                <div style='display: inline-block; background-color: $priorityColor; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px;'>$priority</div><br>
                $content
            </li>";
    }
    
    error_log("Generated recommendations HTML for $count recommendations");
    
    if (empty($email_data['RECOMMENDATIONS_HTML'])) {
        $email_data['RECOMMENDATIONS_HTML'] = $this->generateFallbackRecommendations($email_data);
    }
}

    /**
     * Generate fallback recommendations when parsing fails
     */
    private function generateFallbackRecommendations($email_data) {
        $score = floatval($email_data['TOTAL_SCORE'] ?? 0);
        
        if ($score < 30) {
            return "
                <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #dc3545;'>
                    <div style='background-color: #dc3545; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px; display: inline-block;'>CRITIQUE</div><br>
                    <strong>Restructuration complète nécessaire:</strong> Votre business plan nécessite une révision fondamentale. Concentrez-vous sur la définition claire de votre proposition de valeur, l'identification précise du marché cible, et la présentation détaillée de votre équipe et de votre solution.
                </li>
                <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #dc3545;'>
                    <div style='background-color: #dc3545; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px; display: inline-block;'>CRITIQUE</div><br>
                    <strong>Documentation financière:</strong> Développez un plan financier détaillé avec projections sur 3 ans, analyse des coûts, et stratégie de financement. Incluez des données concrètes et des hypothèses réalistes.
                </li>
                <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #fd7e14;'>
                    <div style='background-color: #fd7e14; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px; display: inline-block;'>HAUTE</div><br>
                    <strong>Renforcement de l'équipe:</strong> Constituez une équipe avec des compétences complémentaires incluant expertise technique, commerciale et sectorielle. Documentez l'expérience et les rôles de chaque membre.
                </li>";
        } else {
            return "
                <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #fd7e14;'>
                    <div style='background-color: #fd7e14; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px; display: inline-block;'>HAUTE</div><br>
                    <strong>Amélioration des points faibles:</strong> Renforcez les sections les moins développées de votre business plan en ajoutant plus de détails, de données quantitatives, et d'analyses sectorielles.
                </li>";
        }
    }
    
    /**
     * Process template with variable substitution
     */
    private function processTemplate($template_filename, $data) {
        $template_path = $this->template_path . $template_filename;
        
        if (!file_exists($template_path)) {
            throw new Exception("Template file not found: $template_path");
        }
        
        $template_content = file_get_contents($template_path);
        
        // Replace variables with format {{VARIABLE|default_value}}
        $template_content = preg_replace_callback(
            '/\{\{([^|}\s]+)(\|([^}]*))?\}\}/',
            function($matches) use ($data) {
                $variable = $matches[1];
                $default = $matches[3] ?? '';
                
                return $data[$variable] ?? $default;
            },
            $template_content
        );
        
        return $template_content;
    }
    
    /**
     * Create simple text version of email
     */
    private function createTextVersion($data) {
        $text = "Résultats de l'analyse de votre business plan\n";
        $text .= "==========================================\n\n";
        $text .= "Bonjour {$data['BUSINESS_NAME']},\n\n";
        $text .= "Votre business plan a été analysé.\n\n";
        $text .= "Score global: {$data['TOTAL_SCORE']}/100\n";
        $text .= "Statut: {$data['STATUS_TEXT']}\n\n";
        $text .= "Un rapport détaillé vous a été généré.\n\n";
        $text .= "Cordialement,\n";
        $text .= "L'équipe ASI\n";
        
        return $text;
    }
    
    /**
     * Send email using PHPMailer
     */
    private function sendEmail($to_email, $to_name, $subject, $html_body, $text_body) {
        require_once 'vendor/autoload.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtp_config['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtp_config['username'];
            $mail->Password = $this->smtp_config['password'];
            $mail->SMTPSecure = $this->smtp_config['encryption'];
            $mail->Port = $this->smtp_config['port'];
            $mail->CharSet = 'UTF-8';
            
            // Recipients
            $mail->setFrom($this->smtp_config['username'], 'ASI - Incubateur de Startups');
            $mail->addAddress($to_email, $to_name);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $html_body;
            $mail->AltBody = $text_body;
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $mail->ErrorInfo);
            return false;
        }
    }
    
    /**
     * Format date for display
     */
    private function formatDate($date_string) {
        if (!$date_string) {
            return date('d/m/Y');
        }
        
        try {
            $date = new DateTime($date_string);
            return $date->format('d/m/Y à H:i');
        } catch (Exception $e) {
            return date('d/m/Y');
        }
    }
    
    /**
     * Log email sending activity
     */
    private function logEmailSent($email_data, $success) {
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'candidature_id' => $email_data['CANDIDATURE_ID'],
            'business_name' => $email_data['BUSINESS_NAME'],
            'recipient_email' => $email_data['recipient_email'],
            'success' => $success,
            'total_score' => $email_data['TOTAL_SCORE'],
            'status' => $email_data['STATUS_TEXT']
        ];
        
        $log_line = json_encode($log_entry) . "\n";
        file_put_contents('email_logs.json', $log_line, FILE_APPEND | LOCK_EX);
    }
}

// FIXED BusinessPlanEmailIntegration class
class BusinessPlanEmailIntegration {
    
    private $email_template;
    private $db_connection;
    
    public function __construct($config) {
        $this->email_template = new BusinessPlanEmailTemplate($config);
        // Initialize database connection
        $this->db_connection = new PDO(
            "sqlite:" . ($config['db_path'] ?? 'nanonets_extraction.db')
        );
        $this->db_connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    /**
     * Send email for a specific candidature ID
     */
    public function sendEmailForCandidature($candidature_id) {
        try {
            // Fetch complete candidature data from database
            $analysis_data = $this->fetchCandidatureData($candidature_id);
            
            if (!$analysis_data) {
                throw new Exception("Candidature not found: $candidature_id");
            }
            
            echo "Fetched data for candidature $candidature_id:\n";
            echo "- Business: {$analysis_data['business_name']}\n";
            echo "- Email: {$analysis_data['contact_email']}\n";
            echo "- Score: {$analysis_data['analysis']['total_score']}\n";
            echo "- Eligible: " . ($analysis_data['analysis']['is_eligible'] ? 'Yes' : 'No') . "\n";
            
            // Send email
            $success = $this->email_template->sendAnalysisEmail($analysis_data);
            
            // Update database with email status
            if ($success) {
                $this->updateEmailStatus($candidature_id, true);
                echo "Email sent successfully!\n";
            } else {
                echo "Failed to send email\n";
            }
            
            return $success;
            
        } catch (Exception $e) {
            error_log("Email integration error: " . $e->getMessage());
            echo "Error: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Fetch candidature data from database - CORRECTED VERSION
     */
    private function fetchCandidatureData($candidature_id) {
        // Updated query to match your actual database structure
        $sql = "
            SELECT 
                c.id,
                c.business_name,
                c.contact_email,
                c.submission_date,
                c.pdf_filename,
                ar.total_score,
                ar.is_eligible,
                ar.analysis_date,
                ar.model_used,
                ar.confidence_score,
                ar.structured_result
            FROM candidatures c
            LEFT JOIN analysis_results ar ON c.analysis_result_id = ar.id
            WHERE c.id = :candidature_id
        ";
        
        $stmt = $this->db_connection->prepare($sql);
        $stmt->execute(['candidature_id' => $candidature_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            return null;
        }
        
        // Debug: Log what we found
        error_log("Raw database row: " . json_encode($row));
        
        // Parse the structured result which contains detailed analysis
        $structured_result = [];
        if (!empty($row['structured_result'])) {
            $structured_result = json_decode($row['structured_result'], true);
            if ($structured_result === null) {
                error_log("Failed to parse structured_result JSON");
                $structured_result = [];
            }
        }
        
        // Build the analysis data structure
        return [
            'contact_email' => $row['contact_email'],
            'business_name' => $row['business_name'],
            'candidature_id' => $row['id'],
            'submission_date' => $row['submission_date'],
            'analysis_date' => $row['analysis_date'],
            'analysis' => [
                'total_score' => floatval($row['total_score'] ?? 0),
                'is_eligible' => (bool) $row['is_eligible'],
                'confidence_score' => floatval($row['confidence_score'] ?? 85),
                'analysis_method' => $row['model_used'] ?? 'rule_based',
                'criteria_results' => $structured_result['criteria_results'] ?? [],
                'recommendations' => $structured_result['recommendations'] ?? [],
                'summary' => $structured_result['summary'] ?? 'Analysis completed with rule-based evaluation.'
            ]
        ];
    }
    
    /**
     * Update email status in database
     */
    private function updateEmailStatus($candidature_id, $success) {
        $sql = "
            UPDATE candidatures 
            SET 
                email_sent = :email_sent,
                email_sent_date = :email_sent_date,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :candidature_id
        ";
        
        $stmt = $this->db_connection->prepare($sql);
        $stmt->execute([
            'candidature_id' => $candidature_id,
            'email_sent' => $success ? 1 : 0,
            'email_sent_date' => $success ? date('Y-m-d H:i:s') : null
        ]);
    }
}

// CLI testing
if (php_sapi_name() === 'cli' && isset($argv[1])) {
    $candidature_id = $argv[1];
    
    $config = [
        'smtp' => [
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'username' => 'thouria.tahari.ensia@gmail.com',
            'password' => 'hbbountalkwhhcuv',
            'encryption' => 'tls'
        ],
        'template_path' => __DIR__ . '/',
        'base_url' => 'http://localhost:8000',
        'db_path' => __DIR__ . '/../data/database/nanonets_extraction.db'
    ];
    
    echo "Testing with candidature ID: $candidature_id\n";
    echo "Database path: " . realpath($config['db_path']) . "\n\n";
    
    $integration = new BusinessPlanEmailIntegration($config);
    $integration->sendEmailForCandidature($candidature_id);
}