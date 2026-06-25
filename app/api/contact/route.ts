import { NextRequest, NextResponse } from "next/server";
// import { sendContactEmail } from "@/lib/email"; // Uncomment when email service is ready

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // TODO: Send email using Nodemailer
    // await sendContactEmail({ name, email, subject, message });

    // For now, just log it
    console.log("Contact form submission:", { name, email, subject, message });

    return NextResponse.json({
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
