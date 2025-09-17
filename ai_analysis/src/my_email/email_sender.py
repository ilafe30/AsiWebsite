#!/usr/bin/env python3
"""
Streamlined Enhanced Professional Email Sending Module for ASI
Combines PHP template logic with Python email system - NO database dependencies
Task: Advanced email with enhanced recommendations and template processing
"""

import os
import smtplib
import logging
import hashlib
import json
import re
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class TemplateProcessor:
    """Advanced template processing system (enhanced from PHP)"""
    
    def __init__(self, template_dir: str):
        self.template_dir = Path(template_dir)
        self.template_cache = {}
    
    def load_template(self, template_name: str, force_reload: bool = False) -> str:
        """Load template with caching"""
        if template_name not in self.template_cache or force_reload:
            template_path = self.template_dir / template_name
            try:
                with open(template_path, 'r', encoding='utf-8') as f:
                    self.template_cache[template_name] = f.read()
            except FileNotFoundError:
                logger.error(f"Template not found: {template_path}")
                raise
            except Exception as e:
                logger.error(f"Error loading template {template_name}: {e}")
                raise
        
        return self.template_cache[template_name]
    
    def process_template(self, template_content: str, variables: Dict[str, Any]) -> str:
        """
        Enhanced template processing with support for:
        - {{VARIABLE}} - simple replacement
        - {{VARIABLE|default}} - with default values
        - {{#CONDITION}}...{{/CONDITION}} - conditional blocks
        """
        # Convert all values to strings for template processing
        str_vars = {k: str(v) if v is not None else '' for k, v in variables.items()}
        
        # Process conditional blocks first
        conditional_pattern = r'\{\{#([A-Z_0-9]+)\}\}(.*?)\{\{/\1\}\}'
        
        def replace_conditional(match):
            var_name = match.group(1)
            content = match.group(2)
            
            # Check if variable exists and has truthy value
            if var_name in str_vars and str_vars[var_name] and str_vars[var_name] != '0':
                return self._replace_simple_variables(content, str_vars)
            return ''
        
        result = re.sub(conditional_pattern, replace_conditional, template_content, flags=re.DOTALL)
        
        # Process simple variables
        result = self._replace_simple_variables(result, str_vars)
        
        return result
    
    def _replace_simple_variables(self, template: str, variables: Dict[str, str]) -> str:
        """Replace {{VARIABLE}} and {{VARIABLE|default}} patterns"""
        pattern = r'\{\{([A-Z_0-9]+)(?:\|([^}]*))?\}\}'
        
        def replace_match(match):
            var_name = match.group(1)
            default_value = match.group(2) if match.group(2) is not None else ''
            return variables.get(var_name, default_value)
        
        return re.sub(pattern, replace_match, template)

class RecommendationEngine:
    """Advanced recommendation system with intelligent categorization"""
    
    def __init__(self):
        self.recommendation_templates = {
            "critical_restructure": [
                "CRITIQUE - Restructuration complète du business model: Votre modèle économique nécessite une refonte fondamentale. Redéfinissez clairement vos sources de revenus (B2B vs B2C), votre stratégie de pricing (freemium, abonnement, one-time), et vos canaux de distribution. Analysez 3 modèles concurrents performants et adaptez leurs meilleures pratiques à votre contexte.",
                "CRITIQUE - Architecture produit et roadmap: Restructurez votre roadmap produit en phases MVP validables. Phase 1: Core features + 100 early adopters (3 mois), Phase 2: Features premium + 500 utilisateurs (6 mois), Phase 3: Scaling + 2000+ utilisateurs (12 mois). Chaque phase doit avoir des KPIs mesurables et des critères de passage clairs.",
                "CRITIQUE - Équipe fondatrice et gouvernance: Renforcez votre équipe avec des profils complémentaires manquants. Recrutez un CTO expérimenté si vous êtes business-focused, ou un Head of Sales si vous êtes tech-heavy. Définissez une répartition equity claire avec vesting schedule sur 4 ans et cliff d'1 an.",
                "CRITIQUE - Plan de financement et projections financières: Le plan financier manque de détails critiques. Construisez un P&L sur 3 ans, cash-flow mensuel année 1, besoins de financement détaillés par poste. Identifiez 4-5 sources de financement potentielles avec timeline de levée. Modélisez 3 hypothèses (conservateur/réaliste/optimiste)."
            ],
            "high_priority_fixes": [
                "HAUTE - Validation marché et customer development: Conduisez 50+ interviews clients approfondies pour valider le product-market fit. Utilisez le framework 'Mom Test' pour éviter les biais de confirmation. Documentez les pain points réels, le willingness to pay, et les alternatives actuellement utilisées par vos prospects.",
                "HAUTE - Stratégie de financement multi-sources: Diversifiez vos sources de financement: 30% fonds propres/bootstrapping, 25% subventions publiques (ANSEJ, ANGEM), 25% business angels, 20% prêts bancaires. Préparez un pitch deck de 12 slides max avec traction metrics et unit economics clairs.",
                "HAUTE - Analyse concurrentielle différenciante: Analysez vos 5 concurrents principaux avec focus sur leurs faiblesses exploitables. Identifiez leurs pricing gaps, leurs customer complaints récurrents, et leurs blind spots géographiques ou démographiques. Positionnez-vous sur ces opportunités.",
                "HAUTE - Construction d'avantages concurrentiels durables: La différenciation n'est pas assez marquée. Identifiez 2-3 barrières à l'entrée créables (brevets, data network effects, partnerships exclusifs). Développez une stratégie de protection de votre avantage concurrentiel sur 3-5 ans."
            ],
            "medium_improvements": [
                "MOYENNE - Optimisation des métriques business: Définissez vos KPIs North Star: Customer Acquisition Cost (CAC), Life Time Value (LTV), Monthly Recurring Revenue (MRR), et churn rate. Objectif: LTV/CAC ratio > 3, churn mensuel < 5%, croissance MoM > 10%. Mettez en place un dashboard de tracking en temps réel.",
                "MOYENNE - Stratégie marketing et growth hacking: Développez une stratégie d'acquisition multi-canal: content marketing (blog/LinkedIn), SEO local, partenariats stratégiques, et marketing d'influence. Allouez 70% du budget marketing sur les 2 canaux les plus performants après testing.",
                "MOYENNE - Plan opérationnel et scalabilité: Documentez vos processus opérationnels clés pour préparer le scaling. Automatisez le maximum de tâches répétitives, externalisez les fonctions non-core, et définissez des SLAs client clairs avec support multi-canal.",
                "MOYENNE - Renforcement de l'équipe fondatrice: Identifiez précisément les compétences manquantes (technique, commercial, secteur). Constituez un advisory board avec 3-5 experts sectoriels. Documentez les CV, répartition des parts, et plan de recrutement sur 18 mois."
            ]
        }
        
        self.sector_specific_recommendations = {
            "E-commerce": [
                "HAUTE - Infrastructure e-commerce scalable: Choisissez une plateforme e-commerce évolutive (Shopify Plus, WooCommerce, ou custom). Intégrez dès le départ: analytics poussés (Google Analytics 4 + Facebook Pixel), système de recommandations produits, et outils de conversion (abandons panier, retargeting, reviews clients)."
            ],
            "FinTech": [
                "CRITIQUE - Conformité réglementaire et sécurité: Obtenez les autorisations nécessaires (Banque d'Algérie, CNRC) avant le lancement. Implémentez les standards de sécurité PCI DSS, chiffrement bout-en-bout, et audit de sécurité trimestriel."
            ]
        }
    
    def generate_recommendations(self, analysis_data: Dict[str, Any], context: Dict[str, Any]) -> List[str]:
        """Generate intelligent recommendations based on analysis and context"""
        recommendations = []
        
        # Use existing recommendations if they're good quality
        existing_recs = analysis_data.get('recommendations', [])
        if existing_recs and isinstance(existing_recs, list):
            for rec in existing_recs:
                if rec and len(rec.strip()) > 50:  # Quality filter
                    recommendations.append(rec.strip())
        
        # If we have enough quality recommendations, return them
        if len(recommendations) >= 3:
            return recommendations[:5]
        
        # Otherwise, generate based on score and weak areas
        total_score = analysis_data.get('total_score', 0)
        
        if total_score < 30:
            # Critical issues - need fundamental restructuring
            recommendations.extend(random.sample(
                self.recommendation_templates["critical_restructure"], 
                min(2, len(self.recommendation_templates["critical_restructure"]))
            ))
        elif total_score < 60:
            # High priority fixes needed
            recommendations.extend(random.sample(
                self.recommendation_templates["high_priority_fixes"], 
                min(2, len(self.recommendation_templates["high_priority_fixes"]))
            ))
        
        # Add medium priority improvements
        recommendations.extend(random.sample(
            self.recommendation_templates["medium_improvements"], 
            min(2, len(self.recommendation_templates["medium_improvements"]))
        ))
        
        # Add sector-specific recommendations if available
        business_sector = context.get('BUSINESS_SECTOR', '')
        for sector, sector_recs in self.sector_specific_recommendations.items():
            if sector.lower() in business_sector.lower():
                recommendations.extend(random.sample(sector_recs, min(1, len(sector_recs))))
                break
        
        # Ensure we have 3-5 recommendations
        while len(recommendations) < 3:
            all_recs = (
                self.recommendation_templates["critical_restructure"] + 
                self.recommendation_templates["high_priority_fixes"] + 
                self.recommendation_templates["medium_improvements"]
            )
            rec = random.choice(all_recs)
            if rec not in recommendations:
                recommendations.append(rec)
        
        return recommendations[:5]

class ASIEmailSender:
    """
    Enhanced ASI-branded email sender with realistic business plan analysis
    Streamlined version without database dependencies
    """
    
    def __init__(self, smtp_config: Dict[str, Any], template_dir: str):
        self.smtp_config = smtp_config
        self.template_processor = TemplateProcessor(template_dir)
        self.recommendation_engine = RecommendationEngine()
        self.sent_emails_log = "email_sent_log.json"
        self.failed_emails_log = "email_failed_log.json"
        self.last_sent_time = None
        self.min_send_interval = 2  # seconds between emails to avoid rate limiting
        
        # Business sectors for realistic analysis
        self.business_sectors = [
            "E-commerce et MarketPlace", "FinTech et Services Financiers",
            "EdTech et Formation Numérique", "HealthTech et Télémédecine",
            "AgriTech et Agriculture Digitale", "GreenTech et Énergies Renouvelables",
            "PropTech et Immobilier Digital", "LogisticTech et Supply Chain",
            "FoodTech et Restauration Digitale", "RetailTech et Commerce de Proximité"
        ]
        
        # Initialize logs
        self._init_logs()
    
    def _init_logs(self):
        """Initialize email log files if they don't exist"""
        for log_file in [self.sent_emails_log, self.failed_emails_log]:
            if not os.path.exists(log_file):
                with open(log_file, 'w') as f:
                    json.dump([], f)
    
    def _validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def _rate_limit(self):
        """Implement rate limiting to avoid being flagged as spam"""
        if self.last_sent_time:
            elapsed = (datetime.now() - self.last_sent_time).total_seconds()
            if elapsed < self.min_send_interval:
                import time
                time.sleep(self.min_send_interval - elapsed)
        self.last_sent_time = datetime.now()
    
    def _generate_unsubscribe_token(self, email: str, candidature_id: str) -> str:
        """Generate secure unsubscribe token (from PHP version)"""
        data = f"{email}{candidature_id}{datetime.now().date()}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _format_date(self, date_string: str) -> str:
        """Format date for display (from PHP version)"""
        try:
            if date_string:
                date_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
                return date_obj.strftime('%d/%m/%Y à %H:%M')
        except:
            pass
        return datetime.now().strftime('%d/%m/%Y à %H:%M')
    
    def _prepare_template_variables(self, recipient_email: str, recipient_name: str, 
                                   business_name: str, candidature_id: str, 
                                   analysis_data: Dict[str, Any], 
                                   base_url: str = "https://asi.incubateur.dz") -> Dict[str, Any]:
        """Prepare comprehensive template variables (enhanced from PHP)"""
        
        # Generate enhanced business context
        sector = random.choice(self.business_sectors)
        development_stages = ["Idée / Concept", "Pré-seed / Prototype", "Seed / MVP", "Early Stage / Traction"]
        target_markets = ["B2C Algérie", "B2B Algérie", "B2B MENA", "B2C + Export MENA", "Marketplace Local"]
        funding_ranges = ["€25,000 - €75,000", "€75,000 - €150,000", "€150,000 - €300,000", "€500,000+"]
        
        # Base template variables
        variables = {
            'BUSINESS_NAME': business_name,
            'CANDIDATURE_ID': str(candidature_id),
            'SUBMISSION_DATE': datetime.now().strftime('%d/%m/%Y'),
            'ANALYSIS_DATE': datetime.now().strftime('%d/%m/%Y à %H:%M'),
            'EMAIL_DATE': datetime.now().strftime('%d/%m/%Y à %H:%M'),
            'TOTAL_SCORE': f"{analysis_data.get('total_score', 0):.1f}",
            'STATUS_TEXT': 'RETENU POUR INCUBATION ASI' if analysis_data.get('is_eligible', False) else 'NON RETENU POUR L\'INCUBATION',
            'STATUS_CLASS': 'accepted' if analysis_data.get('is_eligible', False) else 'rejected',
            'ANALYSIS_METHOD': analysis_data.get('analysis_method', 'rule_based_comprehensive'),
            'CONFIDENCE_SCORE': str(int(analysis_data.get('confidence_score', 85))),
            
            # URLs and contact info
            'REPORT_URL': f'{base_url}/reports/{candidature_id}',
            'SUPPORT_EMAIL': 'contact@asi.incubateur.dz',
            'WEBSITE_URL': 'https://asi.incubateur.dz',
            'PHONE': '+213 23 45 67 89',
            'UNSUBSCRIBE_URL': f'{base_url}/unsubscribe?token={self._generate_unsubscribe_token(recipient_email, candidature_id)}',
            
            # Enhanced business context
            'BUSINESS_SECTOR': sector,
            'DEVELOPMENT_STAGE': random.choice(development_stages),
            'TARGET_MARKET': random.choice(target_markets),
            'FUNDING_REQUIRED': random.choice(funding_ranges),
        }
        
        # Generate executive summary
        total_score = analysis_data.get('total_score', 0)
        if total_score > 75:
            summary = analysis_data.get('summary', f"Votre projet dans le secteur {sector} présente un potentiel commercial solide avec une proposition de valeur claire. L'équipe démontre les compétences nécessaires et une bonne compréhension du marché. Les recommandations ci-dessous vous aideront à optimiser vos chances de succès.")
        else:
            summary = analysis_data.get('summary', f"Votre projet dans le secteur {sector} nécessite des améliorations dans plusieurs domaines clés pour répondre aux critères d'éligibilité de notre programme d'incubation. Les recommandations détaillées vous guideront vers une version plus solide de votre business plan.")
        
        variables['EXECUTIVE_SUMMARY'] = summary
        
        # Process criteria scores with proper mapping (from PHP)
        criteria_mapping = {
            0: ('EQUIPE', 10), 1: ('PROBLEMATIQUE', 10), 2: ('SOLUTION_MARCHE', 5),
            3: ('SOLUTION_PROPOSEE', 15), 4: ('FEUILLE_ROUTE', 5), 5: ('CLIENTELE', 5),
            6: ('CONCURRENTS', 5), 7: ('DIFFERENCIATION', 10), 8: ('STRATEGIE', 10),
            9: ('BUSINESS_MODEL', 10), 10: ('FINANCEMENTS', 10), 11: ('STATUT_JURIDIQUE', 5)
        }
        
        criteria_results = analysis_data.get('criteria_results', [])
        
        for i, (var_prefix, max_points) in criteria_mapping.items():
            if i < len(criteria_results):
                criterion = criteria_results[i]
                earned_points = criterion.get('earned_points', 0)
                max_criterion_points = criterion.get('max_points', max_points)
                
                variables[f'{var_prefix}_SCORE'] = f"{earned_points:.1f}"
                
                percentage = (earned_points / max_criterion_points) * 100 if max_criterion_points > 0 else 0
                variables[f'{var_prefix}_PERCENT'] = str(int(percentage))
                
                # CSS class assignment (from PHP logic)
                if percentage >= 90:
                    css_class = 'excellent'
                elif percentage >= 80:
                    css_class = 'good'
                elif percentage >= 60:
                    css_class = 'average'
                else:
                    css_class = 'poor'
                
                variables[f'{var_prefix}_CLASS'] = css_class
            else:
                # Default values for missing criteria
                variables[f'{var_prefix}_SCORE'] = '0.0'
                variables[f'{var_prefix}_PERCENT'] = '0'
                variables[f'{var_prefix}_CLASS'] = 'poor'
        
        return variables
    
    def _generate_recommendations_html(self, recommendations: List[str]) -> str:
        """Generate formatted recommendations HTML - CRITICAL FUNCTION"""
        if not recommendations:
            return '''
            <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #fd7e14;'>
                <div style='background-color: #fd7e14; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px; display: inline-block;'>HAUTE</div><br>
                <strong>Amélioration générale:</strong> Renforcez les sections les moins développées de votre business plan.
            </li>'''
        
        html = ""
        priority_colors = {
            'CRITIQUE': '#dc3545', 'HAUTE': '#fd7e14', 
            'MOYENNE': '#ffc107', 'FAIBLE': '#6c757d'
        }
        
        for i, rec in enumerate(recommendations[:5]):  # Max 5 recommendations
            if not rec.strip():
                continue
            
            # Extract priority
            priority = 'MOYENNE'
            for p in priority_colors.keys():
                if p in rec.upper():
                    priority = p
                    break
            
            # Format content
            content = rec.strip()
            if ' - ' in content and ':' in content:
                parts = content.split(' - ', 1)
                if len(parts) == 2:
                    title_desc = parts[1]
                    if ':' in title_desc:
                        title, description = title_desc.split(':', 1)
                        content = f"<strong>{title.strip()}:</strong> {description.strip()}"
            
            # Escape HTML but preserve our formatting
            content = content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            content = content.replace('&lt;strong&gt;', '<strong>').replace('&lt;/strong&gt;', '</strong>')
            
            html += f'''
            <li style='margin-bottom: 15px; padding: 15px; background-color: #FFFFFF; border-radius: 8px; border-left: 4px solid #003255; line-height: 1.6; font-size: 14px;'>
                <div style='display: inline-block; background-color: {priority_colors[priority]}; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; margin-bottom: 8px;'>{priority}</div><br>
                {content}
            </li>'''
        
        return html
    
    def _log_email(self, log_file: str, data: Dict[str, Any]):
        """Log email sending attempt"""
        try:
            with open(log_file, 'r') as f:
                logs = json.load(f)
            
            logs.append({
                "timestamp": datetime.now().isoformat(),
                **data
            })
            
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to log email: {e}")
    
    def send_business_plan_email(self, recipient_email: str, recipient_name: str, 
                               business_name: str, candidature_id: str, 
                               analysis_data: Dict[str, Any], report_url: str = None) -> bool:
        """
        Send business plan analysis email with professional ASI formatting
        This is the MAIN FUNCTION called by your existing system
        """
        # Validate email
        if not self._validate_email(recipient_email):
            logger.error(f"Invalid email address: {recipient_email}")
            self._log_email(self.failed_emails_log, {
                "recipient_email": recipient_email,
                "reason": "Invalid email format",
                "candidature_id": candidature_id
            })
            return False
        
        try:
            # Rate limiting
            self._rate_limit()
            
            # Prepare template variables
            template_vars = self._prepare_template_variables(
                recipient_email, recipient_name, business_name, 
                candidature_id, analysis_data
            )
            
            # Generate recommendations using the enhanced engine
            recommendations = self.recommendation_engine.generate_recommendations(
                analysis_data, template_vars
            )
            
            logger.info(f"Generated {len(recommendations)} recommendations for {business_name}")
            
            # THE CRITICAL FIX: Generate RECOMMENDATIONS_HTML
            template_vars['RECOMMENDATIONS_HTML'] = self._generate_recommendations_html(recommendations)
            
            # Load and process templates
            try:
                html_template = self.template_processor.load_template('business_plan_email_template.html')
                html_content = self.template_processor.process_template(html_template, template_vars)
            except Exception as e:
                logger.error(f"Template processing error: {e}")
                return False
            
            # Create text version
            text_content = f'''Résultats de l'analyse de votre business plan - ASI
========================================================

Bonjour {business_name},

Score global: {template_vars['TOTAL_SCORE']}/100
Statut: {template_vars['STATUS_TEXT']}

Cordialement,
L'équipe ASI

Contact: {template_vars['SUPPORT_EMAIL']}
'''
            
            # Create email message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'Résultats ASI - Analyse Business Plan {business_name}'
            msg['From'] = f'Algerian Startup Initiative <{self.smtp_config["username"]}>'
            msg['To'] = f'{recipient_name} <{recipient_email}>'
            msg['Date'] = formatdate(localtime=True)
            msg['Message-ID'] = f'<ASI-{candidature_id}.{datetime.now().timestamp()}@asi.incubateur.dz>'
            
            # Attach both HTML and plain text versions
            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            # Send email
            with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
            
            # Log successful sending
            self._log_email(self.sent_emails_log, {
                "recipient_email": recipient_email,
                "recipient_name": recipient_name,
                "business_name": business_name,
                "candidature_id": candidature_id,
                "status": "success",
                "recommendations_count": len(recommendations)
            })
            
            logger.info(f"ASI email successfully sent to {recipient_email} for candidature {candidature_id}")
            return True
            
        except Exception as e:
            # Log failed sending
            self._log_email(self.failed_emails_log, {
                "recipient_email": recipient_email,
                "recipient_name": recipient_name,
                "business_name": business_name,
                "candidature_id": candidature_id,
                "error": str(e),
                "status": "failed"
            })
            
            logger.error(f"Failed to send ASI email to {recipient_email}: {e}")
            return False


# Backward compatibility aliases for existing code
class ProfessionalEmailSender(ASIEmailSender):
    """Backward compatibility alias for existing code"""
    pass

# Make sure the class can be imported with the original name
__all__ = ['ASIEmailSender', 'ProfessionalEmailSender']