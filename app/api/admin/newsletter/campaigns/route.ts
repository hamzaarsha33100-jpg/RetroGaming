import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewsletterCampaign from "@/models/NewsletterCampaign";
import { auth } from "@/lib/auth";
import { sendCampaignToRecipients } from "@/lib/email";
import { createAdminNotification } from "@/lib/notifications";
import { gatherRecipients } from "@/lib/newsletter";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const campaigns = await NewsletterCampaign.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(campaigns)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    if (!body.name || !body.subject || !body.content) {
      return NextResponse.json(
        { error: "Name, subject, and content are required" },
        { status: 400 }
      );
    }

    const campaign = await NewsletterCampaign.create({
      name: body.name,
      subject: body.subject,
      content: body.content,
      template: body.template || "promotional",
      audience: body.audience || "active",
      segments: body.segments,
      status: body.sendNow ? "sending" : "draft",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      createdBy: session.user.id,
    });

    // If sendNow, gather recipients and send immediately
    if (body.sendNow) {
      const recipients = await gatherRecipients(campaign.audience);
      campaign.totalRecipients = recipients.length;
      await campaign.save();

      const { sent, failed } = await sendCampaignToRecipients(
        recipients,
        campaign.subject,
        campaign.content,
        campaign.template
      );

      campaign.sentCount = sent;
      campaign.failedCount = failed;
      campaign.status = "sent";
      campaign.sentAt = new Date();
      await campaign.save();

      createAdminNotification({
        type: "campaign",
        title: "Campaign sent",
        message: `"${campaign.name}" was sent to ${sent} subscriber${sent !== 1 ? "s" : ""}.`,
        severity: "success",
        link: "/admin/newsletter",
        data: { campaignId: campaign._id.toString() },
      }).catch(() => undefined);
    }

    return NextResponse.json(
      { success: true, data: JSON.parse(JSON.stringify(campaign)) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
