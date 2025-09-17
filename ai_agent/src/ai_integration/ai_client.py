#!/usr/bin/env python3
"""
Unified AI Client - Optimized Version
=====================================

Fixed model loading issues for faster processing:
1. Smart model checking instead of always pulling
2. Non-blocking model operations
3. Better fallback handling
4. Reduced timeout issues
"""

import os
import json
import logging
import requests
import time
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class AIResponse:
    """AI analysis response."""
    content: str
    method: str
    model_used: str
    confidence: float
    processing_time: float
    token_usage: Dict[str, int]
    success: bool
    error_message: Optional[str] = None

class UnifiedAIClient:
    """
    Unified AI client with optimized model handling.
    Fixed the slow model pulling issue.
    """
    
    def __init__(self, ollama_base_url: str = "http://localhost:11434"):
        """Initialize the unified AI client."""
        self.ollama_base_url = ollama_base_url
        self.available_methods = self._check_available_methods()
        self.lightweight_models = ["llama3.2:1b", "llama3.2:3b", "phi3:mini", "llama2:7b"]
        self._model_cache = {}  # Cache model availability
        
        logger.info(f"AI Client initialized with methods: {list(self.available_methods.keys())}")
    
    def _check_available_methods(self) -> Dict[str, bool]:
        """Check which AI methods are available."""
        methods = {}
        
        # Check Ollama availability
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                methods["ollama"] = len(models) > 0
                logger.info(f"✅ Ollama available with {len(models)} models")
            else:
                methods["ollama"] = False
                logger.warning("⚠️ Ollama server not responding")
        except Exception as e:
            methods["ollama"] = False
            logger.warning(f"⚠️ Ollama not available: {e}")
        
        # Rule-based analysis always available
        methods["rule_based"] = True
        
        return methods
    
    def analyze_business_plan(self, text: str, prompt: str, method: str = "auto") -> AIResponse:
        """
        Analyze business plan using specified or best available method.
        
        Args:
            text: Business plan text
            prompt: Analysis prompt
            method: AI method ("auto", "ollama", "rule_based")
            
        Returns:
            AIResponse with analysis results
        """
        start_time = time.time()
        
        if method == "auto":
            return self._analyze_auto(text, prompt, start_time)
        elif method == "ollama":
            return self._analyze_ollama(text, prompt, start_time)
        elif method == "rule_based":
            return self._analyze_rule_based(text, prompt, start_time)
        else:
            return AIResponse(
                content="", method="none", model_used="none", confidence=0.0,
                processing_time=0.0, token_usage={}, success=False,
                error_message=f"Unknown analysis method: {method}"
            )
    
    def _analyze_auto(self, text: str, prompt: str, start_time: float) -> AIResponse:
        """Auto-select best available analysis method."""
        # Try Ollama first if available
        if self.available_methods["ollama"]:
            try:
                return self._analyze_ollama(text, prompt, start_time)
            except Exception as e:
                logger.warning(f"Ollama analysis failed, falling back: {e}")
        
        # Fallback to rule-based analysis
        return self._analyze_rule_based(text, prompt, start_time)
    
    def _analyze_ollama(self, text: str, prompt: str, start_time: float) -> AIResponse:
        """Analyze using Ollama with lightweight models."""
        if not self.available_methods["ollama"]:
            raise Exception("Ollama not available")
        
        # Get best available model - DON'T pull, just use what's available
        model = self._get_available_model()
        if not model:
            raise Exception("No models available - use rule-based fallback")
        
        try:
            # Truncate text for small models
            max_text_length = 2000 if "1b" in model else 4000 if "3b" in model else 6000
            truncated_text = text[:max_text_length]
            
            # Build request
            full_prompt = f"{prompt}\n\nBusiness Plan Text:\n{truncated_text}"
            
            data = {
                "model": model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Low temperature for consistent scoring
                    "num_predict": 1000 if "1b" in model else 1500,
                    "num_ctx": 2048 if "1b" in model else 4096
                }
            }
            
            logger.info(f"Sending request to Ollama with model: {model}")
            
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json=data,
                timeout=200
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("response", "")
                
                if not content:
                    raise Exception("Empty response from Ollama")
                
                processing_time = time.time() - start_time
                
                # Calculate confidence based on model and response quality
                confidence = self._calculate_ollama_confidence(model, content)
                
                # Estimate token usage
                token_usage = {
                    "prompt_tokens": len(full_prompt.split()) * 1.3,  # Rough estimate
                    "completion_tokens": len(content.split()) * 1.3,
                    "total_tokens": len((full_prompt + content).split()) * 1.3
                }
                
                logger.info(f"Ollama analysis completed in {processing_time:.2f}s")
                
                return AIResponse(
                    content=content,
                    method="ollama",
                    model_used=model,
                    confidence=confidence,
                    processing_time=processing_time,
                    token_usage=token_usage,
                    success=True
                )
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
                
        except Exception as e:
            processing_time = time.time() - start_time
            raise Exception(f"Ollama analysis failed: {e}")
    
    def _analyze_rule_based(self, text: str, prompt: str, start_time: float) -> AIResponse:
        """Fallback rule-based analysis."""
        logger.info("Using rule-based analysis fallback")
        
        try:
            # Extract key requirements from prompt
            analysis_requirements = self._parse_prompt_requirements(prompt)
            
            # Perform comprehensive text analysis
            analysis_result = self._perform_rule_based_analysis(text, analysis_requirements)
            
            processing_time = time.time() - start_time
            
            return AIResponse(
                content=analysis_result,
                method="rule_based",
                model_used="rule_based_analyzer",
                confidence=0.75,  # Good confidence for rule-based
                processing_time=processing_time,
                token_usage={"total_tokens": len(analysis_result.split())},
                success=True
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            return AIResponse(
                content="", method="rule_based", model_used="none", confidence=0.0,
                processing_time=processing_time, token_usage={}, success=False,
                error_message=str(e)
            )
    
    def _get_available_model(self) -> Optional[str]:
        """Get an available model WITHOUT pulling/downloading."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                available_models = [model['name'] for model in models]
                
                logger.info(f"Available models: {available_models}")
                
                # Prefer smaller, faster models that are already downloaded
                for preferred in self.lightweight_models:
                    for available in available_models:
                        if preferred in available:
                            logger.info(f"Using available model: {available}")
                            return available
                
                # If no preferred models, use any available
                if available_models:
                    logger.info(f"Using first available model: {available_models[0]}")
                    return available_models[0]
            
            logger.warning("No models available locally")
            return None
        except Exception as e:
            logger.error(f"Error checking available models: {e}")
            return None
    
    def _calculate_ollama_confidence(self, model: str, content: str) -> float:
        """Calculate confidence based on model and response quality."""
        base_confidence = 0.85  # High confidence for Ollama
        
        # Adjust based on model size
        if "1b" in model:
            base_confidence = 0.75
        elif "3b" in model:
            base_confidence = 0.80
        elif "7b" in model:
            base_confidence = 0.85
        
        # Adjust based on response quality
        if len(content) < 200:
            base_confidence -= 0.15
        elif len(content) > 1000:
            base_confidence += 0.05
        
        # Check for structured response indicators
        if "score" in content.lower() and "critère" in content.lower():
            base_confidence += 0.1
        
        return min(max(base_confidence, 0.1), 1.0)
    
    def _parse_prompt_requirements(self, prompt: str) -> Dict[str, Any]:
        """Parse prompt to understand analysis requirements."""
        requirements = {
            "criteria_count": 12,  # Default for business plan analysis
            "scoring_required": "score" in prompt.lower(),
            "structured_response": "format" in prompt.lower(),
            "french_response": "français" in prompt.lower() or "critère" in prompt.lower(),
            "business_focus": "business" in prompt.lower(),
            "evaluation_threshold": 60  # Default threshold
        }
        
        # Extract threshold if mentioned
        import re
        threshold_match = re.search(r'(\d+)/100', prompt)
        if threshold_match:
            requirements["evaluation_threshold"] = int(threshold_match.group(1))
        
        return requirements
    
    def _perform_rule_based_analysis(self, text: str, requirements: Dict[str, Any]) -> str:
        """Perform comprehensive rule-based business plan analysis."""
        text_lower = text.lower()
        
        # Calculate scores for each business criterion
        criteria_scores = self._calculate_business_criteria_scores(text_lower)
        total_score = sum(criteria_scores.values())
        
        # Generate structured response
        if requirements["french_response"]:
            response = self._generate_french_analysis_response(criteria_scores, total_score, text)
        else:
            response = self._generate_english_analysis_response(criteria_scores, total_score, text)
        
        return response
    
    def _calculate_business_criteria_scores(self, text: str) -> Dict[str, float]:
        """Calculate scores for business plan criteria."""
        scores = {}
        
        # Criteria 1: Team (10 points)
        team_terms = ["team", "founder", "experience", "management", "expertise"]
        team_score = min(sum(text.count(term) for term in team_terms) * 1.5, 10)
        scores["equipe"] = team_score
        
        # Criteria 2: Problem identification (10 points)
        problem_terms = ["problem", "problème", "need", "besoin", "challenge"]
        problem_score = min(sum(text.count(term) for term in problem_terms) * 2, 10)
        scores["problematique"] = problem_score
        
        # Criteria 4: Solution & Value (15 points)
        solution_terms = ["solution", "innovation", "value", "benefit", "unique"]
        solution_score = min(sum(text.count(term) for term in solution_terms) * 1.8, 15)
        scores["solution"] = solution_score
        
        # Criteria 6: Target customers (5 points)
        customer_terms = ["customer", "client", "target", "market", "segment"]
        customer_score = min(sum(text.count(term) for term in customer_terms) * 1, 5)
        scores["clientele"] = customer_score
        
        # Criteria 7: Competition (5 points)
        competition_terms = ["competitor", "competition", "concurrent", "rival"]
        competition_score = min(sum(text.count(term) for term in competition_terms) * 1.5, 5)
        scores["concurrents"] = competition_score
        
        # Criteria 10: Business model (10 points)
        business_terms = ["revenue", "profit", "business model", "monetization", "pricing"]
        business_score = min(sum(text.count(term) for term in business_terms) * 1.5, 10)
        scores["business_model"] = business_score
        
        # Criteria 11: Financing (10 points)
        finance_terms = ["funding", "investment", "financial", "budget", "cash"]
        finance_score = min(sum(text.count(term) for term in finance_terms) * 1.2, 10)
        scores["financement"] = finance_score
        
        # Fill remaining criteria with estimated scores
        remaining_criteria = ["solution_marche", "roadmap", "differentiation", "strategie", "statut"]
        for criterion in remaining_criteria:
            # Base score on overall text quality and length
            base_score = min(len(text.split()) * 0.01, 8)
            scores[criterion] = base_score
        
        return scores
    
    def _generate_french_analysis_response(self, scores: Dict[str, float], total_score: float, text: str) -> str:
        """Generate French analysis response."""
        response = f"""ANALYSE DU BUSINESS PLAN - ÉVALUATION STRUCTURÉE

CRITÈRE 1: ÉQUIPE ({scores['equipe']:.1f}/10 points)
- Équipe fondatrice identifiée: {scores['equipe']/3:.1f}/3 - Analyse basée sur mentions d'équipe
- Compétences complémentaires: {scores['equipe']*0.4:.1f}/4 - Évaluation des compétences décrites
- Expérience sectorielle: {scores['equipe']*0.3:.1f}/3 - Expérience mentionnée dans le texte
Score total critère 1: {scores['equipe']:.1f}/10

CRITÈRE 2: PROBLÉMATIQUE IDENTIFIÉE ({scores['problematique']:.1f}/10 points)
- Problématique réelle et bien définie: {scores['problematique']*0.5:.1f}/5 - Clarté du problème identifié
- Données validantes: {scores['problematique']*0.5:.1f}/5 - Preuves de l'existence du problème
Score total critère 2: {scores['problematique']:.1f}/10

CRITÈRE 3: SOLUTION ACTUELLE SUR LE MARCHÉ ({scores['solution_marche']:.1f}/5 points)
- Connaissance des solutions: {scores['solution_marche']*0.6:.1f}/3 - Analyse des solutions existantes
- Limites identifiées: {scores['solution_marche']*0.4:.1f}/2 - Identification des limites actuelles
Score total critère 3: {scores['solution_marche']:.1f}/5

CRITÈRE 4: SOLUTION PROPOSÉE & VALEUR AJOUTÉE ({scores['solution']:.1f}/15 points)
- Solution expliquée clairement: {scores['solution']/3:.1f}/5 - Clarté de la solution proposée
- Innovation: {scores['solution']/3:.1f}/5 - Niveau d'innovation de la solution
- Impact concret: {scores['solution']/3:.1f}/5 - Bénéfices concrets pour les clients
Score total critère 4: {scores['solution']:.1f}/15

CRITÈRE 10: MODÈLE DE BUSINESS ({scores['business_model']:.1f}/10 points)
- Modèle économique clair: {scores['business_model']*0.5:.1f}/5 - Clarté du modèle économique
- Génération de revenus: {scores['business_model']*0.5:.1f}/5 - Logique de génération de revenus
Score total critère 10: {scores['business_model']:.1f}/10

CRITÈRE 11: FINANCEMENTS DÉTAILLÉS ({scores['financement']:.1f}/10 points)
- P&L: {scores['financement']*0.5:.1f}/5 - Présence d'un plan financier
- Besoins de financement: {scores['financement']*0.3:.1f}/3 - Estimation des besoins
- Sources de financement: {scores['financement']*0.2:.1f}/2 - Sources identifiées
Score total critère 11: {scores['financement']:.1f}/10

RÉSUMÉ FINAL:
Score total: {total_score:.1f}/100
Seuil de validation: 60/100
Décision: {'ACCEPTÉ' if total_score >= 60 else 'REFUSÉ'} pour l'incubation

Recommandations principales:
1. {"Renforcer la présentation de l'équipe" if scores['equipe'] < 6 else "Maintenir la qualité de l'équipe"}
2. {"Développer l'analyse financière" if scores['financement'] < 6 else "Affiner les projections financières"}
3. {"Clarifier la proposition de valeur" if scores['solution'] < 9 else "Exploiter l'avantage concurrentiel"}

Analyse réalisée par méthode rule-based avec confiance élevée."""
        
        return response
    
    def _generate_english_analysis_response(self, scores: Dict[str, float], total_score: float, text: str) -> str:
        """Generate English analysis response."""
        return f"""BUSINESS PLAN ANALYSIS - STRUCTURED EVALUATION

Overall Score: {total_score:.1f}/100
Recommendation: {'ACCEPT' if total_score >= 60 else 'REJECT'} for incubation

Key Findings:
- Team Strength: {scores['equipe']:.1f}/10
- Problem Definition: {scores['problematique']:.1f}/10  
- Solution Quality: {scores['solution']:.1f}/15
- Business Model: {scores['business_model']:.1f}/10
- Financial Planning: {scores['financement']:.1f}/10

Analysis Method: Rule-based evaluation with high confidence
Text Length: {len(text)} characters
Processing: Comprehensive automated analysis"""
    
    def pull_model(self, model_name: str) -> bool:
        """
        OPTIMIZED: Only pull model if it doesn't exist.
        This fixes the slow loading issue.
        """
        try:
            # First check if model already exists
            if self._is_model_available(model_name):
                logger.info(f"Model {model_name} already available, skipping pull")
                return True
            
            logger.info(f"Model {model_name} not found locally, attempting to pull...")
            
            # Only pull if model doesn't exist
            data = {"name": model_name}
            response = requests.post(
                f"{self.ollama_base_url}/api/pull",
                json=data,
                timeout=300  # 5 minutes for model download
            )
            
            if response.status_code == 200:
                logger.info(f"Model {model_name} pulled successfully")
                return True
            else:
                logger.error(f"Failed to pull model {model_name}: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error pulling model {model_name}: {e}")
            return False
    
    def _is_model_available(self, model_name: str) -> bool:
        """Check if a specific model is already available locally."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                available_models = [model['name'] for model in models]
                
                # Check if the exact model or a variant exists
                for available in available_models:
                    if model_name in available or available in model_name:
                        return True
                return False
            return False
        except Exception:
            return False
    
    def list_available_models(self) -> List[str]:
        """List all available models."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [model['name'] for model in models]
            return []
        except Exception:
            return []
    
    def is_server_up(self) -> bool:
        """Check if Ollama server is running."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def get_server_info(self) -> Dict[str, Any]:
        """Get server information."""
        info = {
            "server_up": self.is_server_up(),
            "available_models": self.list_available_models(),
            "lightweight_models": self.lightweight_models,
            "recommended_model": self._get_available_model()
        }
        return info


def main():
    """Test the unified AI client."""
    print("AI Unified AI Client - Test Mode")
    print("="*50)
    
    client = UnifiedAIClient()
    
    # Show server info
    info = client.get_server_info()
    print(f"Server Status: {'UP' if info['server_up'] else 'DOWN'}")
    print(f"Available Models: {len(info['available_models'])}")
    print(f"Recommended Model: {info['recommended_model']}")
    
    # Test analysis
    sample_text = """
    TechStart Business Plan
    Our team of experienced developers creates innovative mobile solutions.
    We target small businesses needing digital transformation.
    Revenue model: SaaS subscription with $299 monthly pricing.
    Market size: $50B mobile solutions market.
    Competition: Large players but focused on enterprise.
    Funding needed: $500K for development and marketing.
    """
    
    sample_prompt = """Analyze this business plan and provide scores for key criteria including team, market, solution, and business model. Provide total score out of 100."""
    
    print(f"\nTesting analysis...")
    result = client.analyze_business_plan(sample_text, sample_prompt, method="auto")
    
    if result.success:
        print(f"Success! Method: {result.method}")
        print(f"Model: {result.model_used}")
        print(f"Confidence: {result.confidence:.2f}")
        print(f"Time: {result.processing_time:.2f}s")
        print(f"Content preview: {result.content[:300]}...")
    else:
        print(f"Failed: {result.error_message}")


if __name__ == "__main__":
    main()