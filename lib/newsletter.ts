import "server-only";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

export interface Recipient {
  email: string;
  name?: string;
}

export async function gatherRecipients(
  audience: string
): Promise<Recipient[]> {
  await connectDB();
  const query: Record<string, unknown> = { isActive: true };
  if (audience === "active") {
    query.unsubscribedAt = { $exists: false };
  }
  const subscribers = await Newsletter.find(query)
    .select("email name")
    .lean();
  return subscribers.map((s) => ({
    email: s.email,
    name: s.name || undefined,
  }));
}
