#!/usr/bin/env python3
"""
Professional PDF Report Generator for Business Plan Analysis
Task 1.4 - Email automatique avec rapport professionnel
"""

import os
import json
from fpdf import FPDF
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger(__name__)

class ProfessionalReportGenerator:
    def __init__(self, output_dir="../data/reports"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        logger.info(f"Report generator initialized with output directory: {output_dir}")
    
    def generate_professional_report(self, candidature_id, analysis_data, business_name):
        """Generate a professional PDF report for the analysis."""
        try:
            pdf = FPDF()
            pdf.add_page()
            
            # Set fonts
            pdf.set_font("Arial", 'B', 16)
            
            # Header with title
            pdf.cell(0, 10, "Incubateur de Startups - Analyse de Business Plan", 0, 1, 'C')
            pdf.set_font("Arial", 'I', 12)
            pdf.cell(0, 10, "Rapport d'analyse professionnel", 0, 1, 'C')
            pdf.ln(10)
            
            # Business information section
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, f"Entreprise: {business_name}", 0, 1)
            pdf.set_font("Arial", '', 12)
            pdf.cell(0, 10, f"ID Candidature: #{candidature_id}", 0, 1)
            pdf.cell(0, 10, f"Date d'analyse: {datetime.now().strftime('%d/%m/%Y à %H:%M')}", 0, 1)
            pdf.ln(5)
            
            # Score summary with color coding
            status = "ÉLIGIBLE" if analysis_data.get('is_eligible', False) else "NON ÉLIGIBLE"
            status_color = (0, 128, 0) if analysis_data.get('is_eligible', False) else (255, 0, 0)
            total_score = analysis_data.get('total_score', 0)
            
            pdf.set_font("Arial", 'B', 16)
            pdf.set_text_color(*status_color)
            pdf.cell(0, 10, f"Score Final: {total_score:.1f}/100 - {status}", 0, 1, 'C')
            pdf.set_text_color(0, 0, 0)  # Reset to black
            pdf.ln(5)
            
            # Detailed criteria evaluation
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, "Détail par critère d'évaluation", 0, 1)
            pdf.set_font("Arial", '', 12)
            
            # Create a table for criteria
            pdf.set_fill_color(240, 240, 240)
            pdf.cell(100, 10, "Critère", 1, 0, 'C', True)
            pdf.cell(45, 10, "Score obtenu", 1, 0, 'C', True)
            pdf.cell(45, 10, "Score maximum", 1, 1, 'C', True)
            
            for criterion in analysis_data.get('criteria_results', []):
                # Determine color based on performance
                percentage = (criterion.get('earned_points', 0) / criterion.get('max_points', 1)) * 100
                if percentage >= 80:
                    pdf.set_text_color(0, 128, 0)  # Green
                elif percentage >= 60:
                    pdf.set_text_color(200, 120, 0)  # Orange
                else:
                    pdf.set_text_color(255, 0, 0)  # Red
                
                pdf.cell(100, 8, criterion.get('criterion_name', 'N/A'), 1)
                pdf.cell(45, 8, f"{criterion.get('earned_points', 0):.1f}", 1, 0, 'C')
                pdf.cell(45, 8, f"{criterion.get('max_points', 0)}", 1, 1, 'C')
                pdf.set_text_color(0, 0, 0)  # Reset to black
            
            pdf.ln(10)
            
            # Recommendations section
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, "Recommandations pour amélioration", 0, 1)
            pdf.set_font("Arial", '', 12)
            
            for i, rec in enumerate(analysis_data.get('recommendations', []), 1):
                pdf.multi_cell(0, 8, f"{i}. {rec}")
                pdf.ln(2)
            
            # Additional information
            pdf.ln(10)
            pdf.set_font("Arial", 'I', 10)
            pdf.cell(0, 8, f"Méthode d'analyse: {analysis_data.get('analysis_method', 'AI structurée')}", 0, 1)
            pdf.cell(0, 8, f"Niveau de confiance: {analysis_data.get('confidence_score', 85):.1f}%", 0, 1)
            
            # Footer
            pdf.ln(15)
            pdf.set_font("Arial", 'I', 8)
            pdf.cell(0, 5, "Ce document est confidentiel et destiné exclusivement à l'usage du destinataire.", 0, 1, 'C')
            pdf.cell(0, 5, "Incubateur de Startups - Tous droits réservés.", 0, 1, 'C')
            
            # Save the PDF with a professional filename
            filename = f"rapport_business_plan_{candidature_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
            filepath = os.path.join(self.output_dir, filename)
            pdf.output(filepath)
            
            logger.info(f"Rapport professionnel généré: {filename}")
            return filename, filepath
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération du rapport: {e}")
            return None, None

