import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, guides, and tips from Retro Gaming",
};

export const revalidate = 300;

async function getPosts() {
  try {
    await connectDB();
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen">
      <div className="page-container py-12">
        <div className="mb-10 text-center">
          <p className="text-neon-cyan text-sm font-semibold uppercase tracking-widest mb-2">
            The Retro Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-gaming font-bold text-white">
            Gaming <span className="text-gradient">News &amp; Guides</span>
          </h1>
          <p className="text-gaming-textMuted mt-3 max-w-xl mx-auto">
            The latest news, buying guides, and gaming tips from our team.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gaming-textMuted">No blog posts published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="gaming-card overflow-hidden group hover:border-neon-cyan/30 transition-all"
              >
                <div className="aspect-video w-full overflow-hidden bg-gaming-dark">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gaming-textMuted/30">
                      <span className="font-gaming text-4xl">🎮</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-gaming-textMuted mb-2">
                    <span className="text-neon-cyan">{post.author || "Retro Team"}</span>
                    <span>·</span>
                    <span>{post.publishedAt ? formatDateTime(post.publishedAt) : ""}</span>
                  </div>
                  <h2 className="text-lg font-gaming font-semibold text-white group-hover:text-neon-cyan transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gaming-textMuted text-sm mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
