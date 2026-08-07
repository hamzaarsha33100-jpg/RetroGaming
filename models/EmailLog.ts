import mongoose, { Document, Schema } from "mongoose";

export type EmailLogStatus = "sent" | "failed" | "queued";

export interface IEmailLog extends Document {
  to: string;
  subject: string;
  type: string;
  status: EmailLogStatus;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    to: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ["sent", "failed", "queued"], default: "sent" },
    error: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

EmailLogSchema.index({ to: 1, createdAt: -1 });
EmailLogSchema.index({ type: 1, status: 1 });

const EmailLog =
  mongoose.models.EmailLog || mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
