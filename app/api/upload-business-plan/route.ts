// app/api/upload-business-plan/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract text fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const email = formData.get("email") as string;
    const startupName = formData.get("startupName") as string;
    const sector = formData.get("sector") as string;

    // Extract file
    const file = formData.get("businessPlan") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Log data to console for testing
    console.log("Received upload:");
    console.log({
      firstName,
      lastName,
      phoneNumber,
      email,
      startupName,
      sector,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Simulate success (extend this for real storage/email later)
    return NextResponse.json({ message: "Upload successful" }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Server error during upload" }, { status: 500 });
  }
}