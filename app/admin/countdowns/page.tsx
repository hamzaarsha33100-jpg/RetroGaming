import type { Metadata } from "next";
import CountdownsClient from "./CountdownsClient";

export const metadata: Metadata = {
  title: "Countdown Timers",
};

export default function CountdownsPage() {
  return <CountdownsClient />;
}
