import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import connectDB from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { formatDateTime } from "@/lib/utils";

export const revalidate = 300;

async function getPost(slug: string) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug, isPublished: true });
    if (post) {
      await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    }
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="page-container py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gaming-textMuted hover:text-neon-cyan transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gaming-textMuted mb-3">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-neon-cyan" />
                {post.author || "Retro Team"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neon-cyan" />
                {post.publishedAt ? formatDateTime(post.publishedAt) : ""}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-gaming font-bold text-white leading-tight">
              {post.title}
            </h1>
          </div>

          {post.image && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <img src={post.image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          {post.excerpt && (
            <p className="text-lg text-gaming-textMuted mb-6 italic">{post.excerpt}</p>
          )}

          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gaming-border">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-gaming-dark border border-gaming-border text-xs text-gaming-textMuted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
