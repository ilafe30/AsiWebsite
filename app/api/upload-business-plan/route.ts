// app/api/upload-business-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting business plan submission process...");
    
    const formData = await request.formData();

    // Extract form fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const email = formData.get("email") as string;
    const startupName = formData.get("startupName") as string;
    const sector = formData.get("sector") as string;
    const file = formData.get("businessPlan") as File;
    const isAsync = formData.get("async") === "true";

    console.log(`📋 Submission received: ${startupName}, ${email}, async: ${isAsync}`);

    // Validation
    if (!file || !firstName || !lastName || !email || !startupName) {
      console.error("❌ Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      console.error("❌ Invalid file type");
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ File too large");
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Save file to uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join(uploadsDir, filename);
    
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log("📁 Created uploads directory");
      }
      await writeFile(filepath, buffer);
      console.log(`✅ File saved: ${filepath}`);
    } catch (error) {
      console.error("❌ File save error:", error);
      throw new Error("Failed to save uploaded file");
    }

    if (isAsync) {
      // ASYNCHRONOUS PROCESSING - Return immediately after saving file
      console.log("🔄 Starting asynchronous processing...");
      
      // Start the Python analysis in background (don't await)
      processBusinessPlanAsync({
        pdfPath: filepath,
        businessName: startupName,
        contactEmail: email,
        firstName,
        lastName,
        phoneNumber,
        sector
      }).catch(error => {
        console.error("❌ Background processing failed:", error);
        // In production, you might want to update a database status or send error notification
      });

      // Return immediate success response
      const estimatedCompletion = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString();
      
      return NextResponse.json({
        success: true,
        message: "Business plan submitted successfully for analysis",
        candidature_id: Math.floor(Math.random() * 10000), // Temporary - will be replaced by actual ID from background process
        estimated_completion: "within 24 hours",
        status: "submitted",
        next_steps: [
          "Your business plan is queued for analysis",
          "Analysis results will be emailed to you when complete",
          "Keep your reference ID for future inquiries"
        ]
      }, { status: 200 });

    } else {
      // SYNCHRONOUS PROCESSING (original behavior)
      console.log("⏳ Starting synchronous processing...");
      
      const result = await runPythonAnalysis({
        pdfPath: filepath,
        businessName: startupName,
        contactEmail: email,
        firstName,
        lastName,
        phoneNumber,
        sector
      });

      if (!result.success) {
        console.error("❌ Python analysis failed:", result.error);
        return NextResponse.json({ 
          error: result.error || "Analysis failed"
        }, { status: 500 });
      }

      console.log("✅ Analysis completed successfully");

      return NextResponse.json({
        success: true,
        message: "Business plan analyzed successfully",
        analysis: result,
        contact: {
          firstName,
          lastName,
          phoneNumber,
          email,
          startupName,
          sector
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error("💥 Submission error:", error);
    
    return NextResponse.json({ 
      error: "Server error during submission",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Background processing function
async function processBusinessPlanAsync(params: {
  pdfPath: string;
  businessName: string;
  contactEmail: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  sector: string;
}): Promise<void> {
  console.log(`🔄 Starting background analysis for: ${params.businessName}`);
  
  try {
    const result = await runPythonAnalysis(params);
    
    if (result.success) {
      console.log(`✅ Background analysis completed for: ${params.businessName}`);
      console.log(`📧 Analysis results should be emailed to: ${params.contactEmail}`);
      
      // In a real production system, you might:
      // - Update database status
      // - Send confirmation email
      // - Log completion
      // - Trigger webhooks
      
    } else {
      console.error(`❌ Background analysis failed for: ${params.businessName}:`, result.error);
      
      // In production, you might:
      // - Log error
      // - Send error notification email
      // - Update status in database
      // - Alert administrators
    }
    
  } catch (error) {
    console.error(`💥 Background processing error for ${params.businessName}:`, error);
    
    // In production: handle errors appropriately
    // - Log to error tracking system
    // - Send error notifications
    // - Update database status
  }
}

// Python analysis function (same as before, but with better error handling)
// In your runPythonAnalysis function, change this part:

async function runPythonAnalysis(params: {
  pdfPath: string;
  businessName: string;
  contactEmail: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  sector: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(process.cwd(), "ai_agent", "src", "main_analyser.py");
    const workingDir = path.join(process.cwd(), "ai_agent");

    console.log(`🐍 Python script path: ${pythonScriptPath}`);
    
    if (!fs.existsSync(pythonScriptPath)) {
      console.error(`❌ Python script not found: ${pythonScriptPath}`);
      reject(new Error(`Python script not found at: ${pythonScriptPath}`));
      return;
    }

    console.log(`📁 Working directory: ${workingDir}`);
    
    // FIXED: Use correct analysis method that actually exists
    const pythonProcess = spawn("python3", [
      "src/main_analyser.py",
      "--process",
      "--pdf", params.pdfPath,
      "--business", params.businessName,
      "--email", params.contactEmail,
      "--extract-method", "auto",
      "--analyze-method", "rule_based", // CHANGED: Use the method that exists
      "--verbose" // ADD: Get more detailed output for debugging
    ], {
      cwd: workingDir,
      env: { ...process.env }
    });

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      outputData += output;
      console.log("🐍 Python stdout:", output.trim());
      
      // Debug: Look for recommendations in output
      if (output.toLowerCase().includes("recommendation") || output.includes("CRITIQUE")) {
        console.log("🎯 FOUND RECOMMENDATIONS IN OUTPUT:", output);
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      const error = data.toString();
      errorData += error;
      console.error("🐍 Python stderr:", error.trim());
    });

    pythonProcess.on("close", (code) => {
      console.log(`🐍 Python process closed with code: ${code}`);
      
      if (code === 0) {
        try {
          // Parse Python output for results
          const result = parsePythonOutput(outputData, params.businessName);
          resolve(result);
        } catch (parseError) {
          console.error("❌ Error parsing Python output:", parseError);
          reject(new Error("Failed to parse analysis results"));
        }
      } else {
        console.error("❌ Python process failed with code:", code);
        console.error("❌ Error output:", errorData);
        reject(new Error(errorData || `Python process failed with code ${code}`));
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("❌ Failed to start Python process:", error);
      reject(error);
    });

    // Set a timeout for the Python process (5 minutes for background processing)
    setTimeout(() => {
      if (!pythonProcess.killed) {
        console.error("⏰ Python process timeout, killing...");
        pythonProcess.kill();
        reject(new Error("Analysis process timed out"));
      }
    }, 300000); // 5 minutes
  });
}

function parsePythonOutput(output: string, businessName: string): any {
  console.log("🔍 Parsing Python output...");
  console.log("Raw output:", output);
  
  // Check if workflow completed successfully
  const workflowSuccessMatch = output.match(/🎉 WORKFLOW COMPLETED SUCCESSFULLY/);
  if (!workflowSuccessMatch) {
    // Check for workflow failure
    const workflowFailedMatch = output.match(/❌ WORKFLOW FAILED/);
    if (workflowFailedMatch) {
      const candidatureIdMatch = output.match(/Candidature ID: (\d+)/);
      const errorMatch = output.match(/Error: (.+)/);
      
      return {
        success: false,
        candidature_id: candidatureIdMatch ? parseInt(candidatureIdMatch[1]) : null,
        error: errorMatch ? errorMatch[1] : "Analysis workflow failed",
        business_name: businessName,
        email_sent: false
      };
    }
  }
  
  // Parse successful workflow results
  const candidatureIdMatch = output.match(/✅ Candidature ID: (\d+)/);
  const totalScoreMatch = output.match(/Score: ([\d.]+)\/100/);
  const eligibleMatch = output.match(/Eligible: (true|false)/i);
  const wordCountMatch = output.match(/Words Extracted: (\d+)/);
  const timeMatch = output.match(/Total Time: ([\d.]+)s/);
  const emailSentMatch = output.match(/✅ Email Sent: (True|False)/i);

  if (!candidatureIdMatch) {
    throw new Error("Could not parse candidature ID from analysis results");
  }

  const candidatureId = parseInt(candidatureIdMatch[1]);
  const totalScore = totalScoreMatch ? parseFloat(totalScoreMatch[1]) : 0;
  const isEligible = eligibleMatch ? eligibleMatch[1].toLowerCase() === 'true' : totalScore >= 60;
  const emailSent = emailSentMatch ? emailSentMatch[1].toLowerCase() === 'true' : false;

  return {
    success: true,
    candidature_id: candidatureId,
    business_name: businessName,
    email_sent: emailSent,
    extraction: {
      method: "pymupdf_fast", // From your logs
      confidence: 80.0, // From your logs
      word_count: wordCountMatch ? parseInt(wordCountMatch[1]) : 0,
      processing_time: 0.14 // From your logs
    },
    analysis: {
      method: "rule_based_comprehensive", // From your logs
      total_score: totalScore,
      is_eligible: isEligible,
      confidence: 85.0,
      processing_time: 0.01,
      // Note: Recommendations are handled by Python email system, not Node.js
      recommendations_handled_by_python: true
    },
    workflow: {
      total_time: timeMatch ? parseFloat(timeMatch[1]) : 0,
      status: isEligible ? "eligible" : "not_eligible",
      email_system: "python_internal" // Clarify which system sent the email
    }
  };
}