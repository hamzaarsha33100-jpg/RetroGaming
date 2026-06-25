import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  return <CheckoutClient />;
}
