import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog Management",
};

export default function BlogPage() {
  return <BlogClient />;
}
