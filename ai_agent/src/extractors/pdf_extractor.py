#!/usr/bin/env python3
"""
Unified PDF Text Extractor
==========================

Consolidates all PDF extraction methods with intelligent fallback:
1. Fast PyMuPDF extraction (primary)
2. Nanonets OCR (high-quality, optional)
3. Basic text processing (fallback)

Replaces multiple extraction files with single, reliable solution.
"""

import os
import re
import time
import logging
import sqlite3
import fitz  # PyMuPDF
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass
from pathlib import Path
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class TextBlock:
    """Represents a block of text with metadata"""
    text: str
    font_size: float
    font_name: str
    is_bold: bool
    is_italic: bool
    bbox: Tuple[float, float, float, float]
    page_number: int

@dataclass
class ExtractionResult:
    """PDF text extraction result."""
    text: str
    method: str
    confidence: float
    processing_time: float
    page_count: int
    word_count: int
    success: bool
    total_blocks: int = 0
    error_message: Optional[str] = None

class UnifiedPDFExtractor:
    """
    Unified PDF text extractor with multiple fallback methods.
    Consolidates functionality with intelligent method selection and comprehensive logging.
    """
    
    def __init__(self, db_path: str = "unified_extraction.db", enable_nanonets: bool = False):
        """
        Initialize the unified extractor.
        
        Args:
            db_path: Path to SQLite database
            enable_nanonets: Whether to enable Nanonets VLM (requires additional setup)
        """
        self.db_path = db_path
        self.enable_nanonets = enable_nanonets
        self.nanonets_model = None
        self.nanonets_processor = None
        
        # Check available methods
        self.available_methods = self._check_available_methods()
        
        # Initialize database
        self._init_database()
        
        # Load Nanonets if enabled
        if self.enable_nanonets:
            self._init_nanonets()
        
        logger.info(f"PDF Extractor initialized with methods: {self.available_methods}")
    
    def _check_available_methods(self) -> Dict[str, bool]:
        """Check which extraction methods are available."""
        methods = {}
        
        # Check PyMuPDF (fitz)
        try:
            import fitz
            methods["pymupdf"] = True
            logger.info("✅ PyMuPDF available for fast text extraction")
        except ImportError:
            methods["pymupdf"] = False
            logger.warning("⚠️ PyMuPDF not available")
        
        # Check Nanonets dependencies
        try:
            from transformers import AutoTokenizer, AutoProcessor, AutoModelForImageTextToText
            methods["nanonets"] = True
            logger.info("✅ Nanonets OCR available for high-quality extraction")
        except ImportError:
            methods["nanonets"] = False
            logger.warning("⚠️ Nanonets OCR not available")
        
        # Basic text processing always available
        methods["basic"] = True
        
        return methods
    
    def _init_database(self):
        """Initialize comprehensive SQLite database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Files table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    page_count INTEGER,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Extraction results table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS extractions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_id INTEGER,
                    text_content TEXT NOT NULL,
                    extraction_method TEXT NOT NULL,
                    confidence_score REAL,
                    processing_time REAL,
                    pages_processed INTEGER,
                    blocks_processed INTEGER,
                    word_count INTEGER,
                    success BOOLEAN DEFAULT TRUE,
                    error_message TEXT,
                    extraction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (file_id) REFERENCES files (id)
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def _init_nanonets(self):
        """Initialize Nanonets VLM (optional)"""
        try:
            logger.info("Initializing Nanonets VLM...")
            from transformers import AutoTokenizer, AutoProcessor, AutoModelForImageTextToText
            
            model_name = "nanonets/Nanonets-OCR-s"
            
            self.nanonets_processor = AutoProcessor.from_pretrained(
                model_name, trust_remote_code=True
            )
            self.nanonets_model = AutoModelForImageTextToText.from_pretrained(
                model_name, torch_dtype="auto", trust_remote_code=True
            )
            self.nanonets_model.eval()
            
            logger.info("Nanonets VLM initialized successfully")
            
        except Exception as e:
            logger.warning(f"Nanonets VLM initialization failed: {e}")
            self.enable_nanonets = False
    
    def extract_text(self, pdf_path: str, method: str = "auto", 
                    max_pages: Optional[int] = None) -> ExtractionResult:
        """
        Extract text from PDF using specified or best available method.
        
        Args:
            pdf_path: Path to PDF file
            method: Extraction method ("auto", "fast", "high_quality", "basic")
            max_pages: Maximum pages to process (for memory management)
            
        Returns:
            ExtractionResult with text and metadata
        """
        start_time = time.time()
        
        if not os.path.exists(pdf_path):
            return ExtractionResult(
                text="", method="none", confidence=0.0, processing_time=0.0,
                page_count=0, word_count=0, success=False,
                error_message=f"PDF file not found: {pdf_path}"
            )
        
        logger.info(f"Extracting text from: {pdf_path}")
        logger.info(f"Method: {method}, Max pages: {max_pages}")
        
        try:
            # Register file
            file_id = self._register_file(pdf_path)
            
            if method == "auto":
                result = self._extract_auto(pdf_path, max_pages, start_time)
            elif method == "fast":
                result = self._extract_fast(pdf_path, max_pages, start_time)
            elif method == "high_quality":
                result = self._extract_high_quality(pdf_path, max_pages, start_time)
            elif method == "basic":
                result = self._extract_basic(pdf_path, max_pages, start_time)
            else:
                result = ExtractionResult(
                    text="", method="none", confidence=0.0, processing_time=0.0,
                    page_count=0, word_count=0, success=False,
                    error_message=f"Unknown extraction method: {method}"
                )
            
            # Store result
            if result.success:
                self._store_extraction(file_id, result)
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"All extraction methods failed: {e}")
            
            return ExtractionResult(
                text=f"Extraction failed: {str(e)}",
                method="error",
                confidence=0.0,
                processing_time=processing_time,
                page_count=0,
                word_count=0,
                success=False,
                error_message=str(e)
            )
    
    def _extract_auto(self, pdf_path: str, max_pages: Optional[int], start_time: float) -> ExtractionResult:
        """Auto-select best available extraction method."""
        # Try fast method first
        if self.available_methods["pymupdf"]:
            result = self._extract_fast(pdf_path, max_pages, start_time)
            if result.success and len(result.text.strip()) > 100:
                return result
            logger.warning("Fast extraction produced insufficient text, trying high-quality")
        
        # Try high-quality OCR if fast failed
        if self.enable_nanonets and self.available_methods["nanonets"] and self.nanonets_model:
            try:
                result = self._extract_high_quality(pdf_path, max_pages, start_time)
                if result.success:
                    return result
                logger.warning("High-quality extraction failed, falling back to basic")
            except Exception as e:
                logger.warning(f"Nanonets extraction failed, falling back to basic: {e}")
        
        # Fallback to basic method
        return self._extract_basic(pdf_path, max_pages, start_time)
    
    def _extract_fast(self, pdf_path: str, max_pages: Optional[int], start_time: float) -> ExtractionResult:
        """Fast extraction using enhanced PyMuPDF method."""
        if not self.available_methods["pymupdf"]:
            return ExtractionResult(
                text="", method="fast", confidence=0.0, processing_time=0.0,
                page_count=0, word_count=0, success=False,
                error_message="PyMuPDF not available"
            )
        
        try:
            logger.info(f"Starting PyMuPDF extraction: {pdf_path}")
            
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            
            if max_pages:
                page_count = min(page_count, max_pages)
                logger.info(f"Processing {page_count} pages (limited)")
            
            all_text = []
            total_blocks = 0
            
            for page_num in range(page_count):
                try:
                    logger.info(f"Processing page {page_num + 1}/{page_count}")
                    
                    page_text, page_blocks = self._extract_page_enhanced(doc, page_num)
                    
                    if page_text:
                        all_text.append(f"--- Page {page_num + 1} ---\n{page_text}")
                        total_blocks += page_blocks
                    
                except Exception as e:
                    logger.error(f"Error processing page {page_num + 1}: {e}")
                    all_text.append(f"--- Page {page_num + 1} ---\n[ERROR: {e}]")
                    continue
            
            doc.close()
            
            # Combine and clean text
            full_text = "\n\n".join(all_text)
            cleaned_text = self._clean_extracted_text(full_text)
            word_count = len(cleaned_text.split())
            processing_time = time.time() - start_time
            
            # Calculate confidence based on text quality
            confidence = self._calculate_text_confidence(cleaned_text, "pymupdf_fast")
            
            logger.info(f"✅ Fast extraction completed: {word_count} words, confidence: {confidence:.2f}")
            
            return ExtractionResult(
                text=cleaned_text,
                method="pymupdf_fast",
                confidence=confidence,
                processing_time=processing_time,
                page_count=page_count,
                word_count=word_count,
                success=True,
                total_blocks=total_blocks
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"❌ Fast extraction failed: {e}")
            
            return ExtractionResult(
                text="", method="pymupdf_fast", confidence=0.0, processing_time=processing_time,
                page_count=0, word_count=0, success=False,
                error_message=str(e)
            )
    
    def _extract_page_enhanced(self, doc: fitz.Document, page_num: int) -> Tuple[str, int]:
        """Extract text from a single page with enhanced processing"""
        try:
            page = doc.load_page(page_num)
            
            # Try structured text extraction first
            text_blocks = self._extract_structured_text(page, page_num)
            
            if text_blocks:
                page_text = self._process_text_blocks(text_blocks)
                return page_text, len(text_blocks)
            
            # Fallback to regular text extraction
            logger.info(f"Page {page_num + 1}: Using fallback text extraction")
            page_text = page.get_text()
            cleaned_text = self._clean_extracted_text(page_text)
            
            return cleaned_text, 1
            
        except Exception as e:
            logger.error(f"Enhanced page extraction failed: {e}")
            raise
    
    def _extract_structured_text(self, page: fitz.Page, page_num: int) -> List[TextBlock]:
        """Extract text with structure information"""
        try:
            text_blocks = []
            blocks = page.get_text("dict")
            
            for block in blocks.get("blocks", []):
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text_block = TextBlock(
                                text=span["text"].strip(),
                                font_size=span["size"],
                                font_name=span["font"],
                                is_bold="Bold" in span["font"] or span["flags"] & 2**4,
                                is_italic="Italic" in span["font"] or span["flags"] & 2**1,
                                bbox=span["bbox"],
                                page_number=page_num
                            )
                            
                            if text_block.text:
                                text_blocks.append(text_block)
            
            return text_blocks
            
        except Exception as e:
            logger.warning(f"Structured text extraction failed: {e}")
            return []
    
    def _process_text_blocks(self, text_blocks: List[TextBlock]) -> str:
        """Process text blocks into formatted text"""
        try:
            # Sort blocks by position
            text_blocks.sort(key=lambda x: (x.bbox[1], x.bbox[0]))
            
            formatted_lines = []
            current_section = ""
            
            for block in text_blocks:
                text = block.text
                
                # Detect headers by font size and weight
                if block.font_size > 12 or block.is_bold:
                    if current_section:
                        formatted_lines.append(current_section)
                        formatted_lines.append("")
                    
                    current_section = f"## {text.upper()}"
                else:
                    if current_section:
                        current_section += f" {text}"
                    else:
                        current_section = text
            
            if current_section:
                formatted_lines.append(current_section)
            
            return "\n".join(formatted_lines)
            
        except Exception as e:
            logger.error(f"Text block processing failed: {e}")
            return " ".join([block.text for block in text_blocks])
    
    def _extract_high_quality(self, pdf_path: str, max_pages: Optional[int], start_time: float) -> ExtractionResult:
        """High-quality extraction using Nanonets VLM."""
        if not self.enable_nanonets or not self.available_methods["nanonets"] or not self.nanonets_model:
            return ExtractionResult(
                text="", method="nanonets_ocr", confidence=0.0, processing_time=0.0,
                page_count=0, word_count=0, success=False,
                error_message="Nanonets OCR not available"
            )
        
        try:
            logger.info(f"Starting Nanonets VLM extraction: {pdf_path}")
            
            # Convert PDF to images
            images = self._pdf_to_images(pdf_path, max_pages)
            if not images:
                raise Exception("No images extracted from PDF")
            
            all_text = ""
            total_confidence = 0.0
            
            for i, image in enumerate(images):
                logger.info(f"Processing page {i+1}/{len(images)} with Nanonets VLM...")
                
                prompt = """Extract the text from the above document as if you were reading it naturally. Return the tables in html format. Return the equations in LaTeX representation. If there is an image in the document and image caption is not present, add a small description of the image inside the <img></img> tag; otherwise, add the image caption inside <img></img>. Watermarks should be wrapped in brackets. Ex: <watermark>OFFICIAL COPY</watermark>. Page numbers should be wrapped in brackets. Ex: <page_number>14</page_number> or <page_number>9/22</page_number>. Prefer using ☐ and ☑ for check boxes."""
                
                text, confidence = self._process_image_with_nanonets(image, prompt)
                
                if text:
                    all_text += f"\n--- Page {i+1} ---\n{text}\n"
                    total_confidence += confidence
            
            avg_confidence = total_confidence / len(images) if images else 0.0
            cleaned_text = self._clean_extracted_text(all_text)
            word_count = len(cleaned_text.split())
            processing_time = time.time() - start_time
            
            logger.info(f"✅ High-quality extraction completed: {word_count} words")
            
            return ExtractionResult(
                text=cleaned_text,
                method="nanonets_ocr",
                confidence=avg_confidence,
                processing_time=processing_time,
                page_count=len(images),
                word_count=word_count,
                success=True,
                total_blocks=len(images)
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"❌ High-quality extraction failed: {e}")
            
            return ExtractionResult(
                text="", method="nanonets_ocr", confidence=0.0, processing_time=processing_time,
                page_count=0, word_count=0, success=False,
                error_message=str(e)
            )
    
    def _pdf_to_images(self, pdf_path: str, max_pages: Optional[int] = None):
        """Convert PDF pages to PIL images"""
        try:
            from PIL import Image
            import io
            
            images = []
            pdf_document = fitz.open(pdf_path)
            
            total_pages = pdf_document.page_count
            if max_pages:
                total_pages = min(total_pages, max_pages)
            
            for page_num in range(total_pages):
                page = pdf_document[page_num]
                mat = fitz.Matrix(2.0, 2.0)  # Higher resolution
                pix = page.get_pixmap(matrix=mat)
                
                img_data = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_data))
                images.append(image)
            
            pdf_document.close()
            logger.info(f"Converted {len(images)} PDF pages to images")
            return images
            
        except Exception as e:
            logger.error(f"PDF to image conversion failed: {e}")
            return []
    
    def _process_image_with_nanonets(self, image, prompt: str) -> Tuple[str, float]:
        """Process image with Nanonets VLM"""
        try:
            if not self.nanonets_model or not self.nanonets_processor:
                return "", 0.0
            
            # Process with VLM
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt},
                ]},
            ]
            
            text = self.nanonets_processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = self.nanonets_processor(text=[text], images=[image], padding=True, return_tensors="pt")
            
            output_ids = self.nanonets_model.generate(**inputs, max_new_tokens=4096, do_sample=False)
            generated_ids = [output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, output_ids)]
            
            output_text = self.nanonets_processor.batch_decode(generated_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True)
            extracted_text = output_text[0]
            
            confidence = self._estimate_confidence(extracted_text)
            return extracted_text, confidence
            
        except Exception as e:
            logger.error(f"Nanonets image processing failed: {e}")
            return "", 0.0
    
    def _extract_basic(self, pdf_path: str, max_pages: Optional[int], start_time: float) -> ExtractionResult:
        """Basic extraction fallback method."""
        try:
            logger.info("Using basic text extraction fallback...")
            
            # Try to use PyMuPDF if available, otherwise use other libraries
            if self.available_methods["pymupdf"]:
                return self._extract_fast(pdf_path, max_pages, start_time)
            
            # Alternative: try with PyPDF2 or pdfplumber if available
            extracted_text = self._try_alternative_extraction(pdf_path, max_pages)
            
            if not extracted_text:
                extracted_text = f"Could not extract text from {os.path.basename(pdf_path)}. Manual processing required."
            
            cleaned_text = self._clean_extracted_text(extracted_text)
            word_count = len(cleaned_text.split())
            processing_time = time.time() - start_time
            confidence = self._calculate_text_confidence(cleaned_text, "basic_fallback")
            
            logger.info(f"✅ Basic extraction completed: {word_count} words")
            
            return ExtractionResult(
                text=cleaned_text,
                method="basic_fallback",
                confidence=confidence,
                processing_time=processing_time,
                page_count=1,  # Estimated
                word_count=word_count,
                success=True
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"❌ Basic extraction failed: {e}")
            
            return ExtractionResult(
                text="", method="basic_fallback", confidence=0.0, processing_time=processing_time,
                page_count=0, word_count=0, success=False,
                error_message=str(e)
            )
    
    def _try_alternative_extraction(self, pdf_path: str, max_pages: Optional[int]) -> str:
        """Try alternative PDF extraction methods."""
        text = ""
        
        # Try PyPDF2
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                pages = min(len(reader.pages), max_pages) if max_pages else len(reader.pages)
                
                for page_num in range(pages):
                    page = reader.pages[page_num]
                    text += page.extract_text()
                    
            if text.strip():
                return text
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}")
        
        # Try pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                pages = min(len(pdf.pages), max_pages) if max_pages else len(pdf.pages)
                
                for page_num in range(pages):
                    page = pdf.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text
                        
            if text.strip():
                return text
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")
        
        return text
    
    def _clean_extracted_text(self, text: str) -> str:
        """Clean and format extracted text"""
        try:
            if not text:
                return ""
            
            # Remove excessive whitespace
            text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
            text = re.sub(r' +', ' ', text)
            
            # Fix common OCR issues
            text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
            text = re.sub(r'([0-9])([A-Za-z])', r'\1 \2', text)
            
            # Clean up bullet points
            text = re.sub(r'•\s*', '• ', text)
            text = re.sub(r'-\s*', '- ', text)
            
            # Fix paragraph breaks
            text = re.sub(r'([.!?])\s*([A-Z])', r'\1\n\n\2', text)
            
            # Remove orphaned characters
            text = re.sub(r'\s+([.,!?;:])', r'\1', text)
            
            # Clean up multiple spaces
            text = re.sub(r' +', ' ', text)
            
            # Remove page markers for cleaner text
            text = text.replace("--- Page", "\n--- Page")
            
            # Fix common OCR issues
            text = text.replace("•", "- ")
            text = text.replace("◦", "- ")
            
            # Normalize line endings
            text = text.replace('\r\n', '\n').replace('\r', '\n')
            
            # Remove excessive newlines
            while '\n\n\n' in text:
                text = text.replace('\n\n\n', '\n\n')
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Text cleaning failed: {e}")
            return text
    
    def _calculate_text_confidence(self, text: str, method: str) -> float:
        """Calculate confidence score based on text quality and method."""
        base_confidence = {
            "pymupdf_fast": 0.8,
            "nanonets_ocr": 0.95,
            "basic_fallback": 0.3
        }.get(method, 0.5)
        
        if not text or len(text.strip()) < 50:
            return 0.1
        
        # Adjust confidence based on text characteristics
        word_count = len(text.split())
        if word_count > 1000:
            base_confidence += 0.1
        elif word_count < 100:
            base_confidence -= 0.2
        
        # Check for business plan indicators
        business_indicators = ["business", "market", "revenue", "strategy", "plan"]
        indicator_count = sum(1 for indicator in business_indicators if indicator in text.lower())
        
        if indicator_count >= 3:
            base_confidence += 0.1
        
        # Additional quality checks from original implementation
        special_char_ratio = sum(1 for c in text if not c.isalnum() and not c.isspace()) / len(text)
        if special_char_ratio > 0.3:
            base_confidence -= 0.3
        
        if any(text.count(c) > len(text) * 0.1 for c in text if c.isalnum()):
            base_confidence -= 0.2
        
        if any(tag in text for tag in ['<', '>', '$', '$$', '☐', '☑']):
            base_confidence += 0.1
        
        return max(0.1, min(1.0, base_confidence))
    
    def _estimate_confidence(self, text: str) -> float:
        """Estimate confidence based on text quality (alias for compatibility)"""
        return self._calculate_text_confidence(text, "nanonets_ocr")
    
    def _register_file(self, pdf_path: str) -> int:
        """Register file in database"""
        try:
            filename = os.path.basename(pdf_path)
            file_size = os.path.getsize(pdf_path)
            
            # Get page count
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            doc.close()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO files (filename, file_path, file_size, page_count)
                VALUES (?, ?, ?, ?)
            ''', (filename, pdf_path, file_size, page_count))
            
            conn.commit()
            file_id = cursor.lastrowid
            conn.close()
            
            logger.info(f"File registered with ID: {file_id}")
            return file_id
            
        except Exception as e:
            logger.error(f"Failed to register file: {e}")
            return 0
    
    def _store_extraction(self, file_id: int, result: ExtractionResult):
        """Store extraction result in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO extractions 
                (file_id, text_content, extraction_method, confidence_score, 
                 processing_time, pages_processed, blocks_processed, word_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (file_id, result.text, result.method, result.confidence, 
                  result.processing_time, result.page_count, result.total_blocks, result.word_count))
            
            conn.commit()
            conn.close()
            logger.info("Extraction result stored in database")
            
        except Exception as e:
            logger.error(f"Failed to store extraction result: {e}")
    
    def extract_and_save(self, pdf_path: str, output_path: str = None, 
                        method: str = "auto", max_pages: Optional[int] = None) -> ExtractionResult:
        """Extract text and save to file."""
        result = self.extract_text(pdf_path, method, max_pages)
        
        if result.success and output_path:
            try:
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(result.text)
                logger.info(f"Extracted text saved to: {output_path}")
            except Exception as e:
                logger.error(f"Failed to save extracted text: {e}")
        
        return result
    
    def get_extraction_stats(self, pdf_path: str = None) -> Dict[str, Any]:
        """Get extraction statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if pdf_path:
                cursor.execute('''
                    SELECT COUNT(*) as total_extractions,
                           AVG(confidence_score) as avg_confidence,
                           AVG(processing_time) as avg_time,
                           SUM(pages_processed) as total_pages,
                           extraction_method
                    FROM extractions e
                    JOIN files f ON e.file_id = f.id
                    WHERE f.file_path = ?
                    GROUP BY extraction_method
                ''', (pdf_path,))
            else:
                cursor.execute('''
                    SELECT COUNT(*) as total_extractions,
                           AVG(confidence_score) as avg_confidence,
                           AVG(processing_time) as avg_time,
                           SUM(pages_processed) as total_pages,
                           extraction_method
                    FROM extractions
                    GROUP BY extraction_method
                ''')
            
            results = cursor.fetchall()
            conn.close()
            
            stats = {}
            for row in results:
                stats[row[4]] = {
                    "total_extractions": row[0],
                    "avg_confidence": round(row[1] or 0, 2),
                    "avg_processing_time": round(row[2] or 0, 2),
                    "total_pages": row[3] or 0
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get extraction stats: {e}")
            return {}
    
    def get_pdf_stats(self, pdf_path: str) -> Dict[str, Any]:
        """Get PDF statistics without full extraction (alias for compatibility)."""
        stats = {
            "file_size": 0,
            "page_count": 0,
            "file_exists": False,
            "estimated_complexity": "unknown"
        }
        
        try:
            if os.path.exists(pdf_path):
                stats["file_exists"] = True
                stats["file_size"] = os.path.getsize(pdf_path)
                
                if self.available_methods["pymupdf"]:
                    doc = fitz.open(pdf_path)
                    stats["page_count"] = doc.page_count
                    
                    # Estimate complexity based on page count and file size
                    if stats["page_count"] > 50 or stats["file_size"] > 10 * 1024 * 1024:  # 10MB
                        stats["estimated_complexity"] = "high"
                    elif stats["page_count"] > 10 or stats["file_size"] > 1 * 1024 * 1024:   # 1MB
                        stats["estimated_complexity"] = "medium"
                    else:
                        stats["estimated_complexity"] = "low"
                    
                    doc.close()
        except Exception as e:
            logger.error(f"Failed to get PDF stats: {e}")
        
        return stats
    
    def cleanup(self):
        """Clean up resources"""
        if self.nanonets_model:
            del self.nanonets_model
            self.nanonets_model = None
        
        if self.nanonets_processor:
            del self.nanonets_processor
            self.nanonets_processor = None
        
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except ImportError:
            pass
        
        logger.info("Resources cleaned up")


def main():
    """Test the unified PDF extractor"""
    print("📄 Unified PDF Text Extractor - Test Mode")
    print("="*50)
    
    try:
        # Initialize extractor
        extractor = UnifiedPDFExtractor(enable_nanonets=False)
        
        print(f"Available methods: {list(extractor.available_methods.keys())}")
        print(f"PyMuPDF available: {extractor.available_methods['pymupdf']}")
        print(f"Nanonets available: {extractor.available_methods['nanonets']}")
        
        # Test with a sample PDF
        pdf_path = "business_plan_template_tStart.pdf"
        
        if not os.path.exists(pdf_path):
            print(f"❌ PDF file not found: {pdf_path}")
            print(f"💡 Usage: python unified_pdf_extractor.py")
            return
        
        print(f"\n🧪 Testing extraction on: {pdf_path}")
        
        # Get stats first
        stats = extractor.get_pdf_stats(pdf_path)
        print(f"📊 File stats: {stats}")
        
        # Test extraction with first 3 pages
        print("\n🚀 Starting extraction (first 3 pages)...")
        result = extractor.extract_text(pdf_path, method="auto", max_pages=3)
        
        if result.success:
            print(f"✅ Extraction successful!")
            print(f"   Method: {result.method}")
            print(f"   Confidence: {result.confidence:.2f}")
            print(f"   Words: {result.word_count}")
            print(f"   Pages: {result.page_count}")
            print(f"   Blocks: {result.total_blocks}")
            print(f"   Time: {result.processing_time:.2f}s")
            print(f"   Preview: {result.text[:300]}...")
            
            # Show extraction statistics
            print("\n📈 Extraction Statistics:")
            extraction_stats = extractor.get_extraction_stats(pdf_path)
            for method, data in extraction_stats.items():
                print(f"  {method}: {data}")
        else:
            print(f"❌ Extraction failed: {result.error_message}")
        
        # Clean up
        extractor.cleanup()
        print(f"\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()