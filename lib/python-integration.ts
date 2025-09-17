import { spawn } from 'child_process';
import path from 'path';

export interface PythonAnalysisParams {
  pdfPath: string;
  businessName: string;
  contactEmail: string;
  extractMethod?: 'auto' | 'fast' | 'high_quality';
  analyzeMethod?: 'auto' | 'ai' | 'rule_based';
}

export interface PythonAnalysisResult {
  success: boolean;
  candidature_id?: number;
  total_score?: number;
  is_eligible?: boolean;
  processing_time?: number;
  error?: string;
}

export class PythonIntegrationService {
  private pythonScriptPath: string;

  constructor() {
    // Adjust path based on your project structure
    this.pythonScriptPath = path.join(
      process.cwd(), 
      '..', 
      'ASI', 
      'project2', 
      'phase1', 
      'objectif1.2', 
      'src', 
      'main_analyser.py'
    );
  }

  async runAnalysis(params: PythonAnalysisParams): Promise<PythonAnalysisResult> {
    return new Promise((resolve, reject) => {
      const args = [
        this.pythonScriptPath,
        '--process',
        '--pdf', params.pdfPath,
        '--business', params.businessName,
        '--email', params.contactEmail
      ];

      if (params.extractMethod) {
        args.push('--extract-method', params.extractMethod);
      }
      if (params.analyzeMethod) {
        args.push('--analyze-method', params.analyzeMethod);
      }

      const pythonProcess = spawn('python', args, {
        cwd: path.dirname(this.pythonScriptPath)
      });

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = this.parsePythonOutput(outputData);
            resolve(result);
          } catch (error) {
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          reject(new Error(errorData || `Python process failed with code ${code}`));
        }
      });
    });
  }

  private parsePythonOutput(output: string): PythonAnalysisResult {
    const candidatureIdMatch = output.match(/Candidature ID: (\d+)/);
    const totalScoreMatch = output.match(/Score: ([\d.]+)\/100/);
    const timeMatch = output.match(/Total Time: ([\d.]+)s/);

    if (!candidatureIdMatch || !totalScoreMatch) {
      throw new Error('Could not parse essential analysis results');
    }

    const totalScore = parseFloat(totalScoreMatch[1]);
    return {
      success: true,
      candidature_id: parseInt(candidatureIdMatch[1]),
      total_score: totalScore,
      is_eligible: totalScore >= 60,
      processing_time: timeMatch ? parseFloat(timeMatch[1]) : 0
    };
  }
}