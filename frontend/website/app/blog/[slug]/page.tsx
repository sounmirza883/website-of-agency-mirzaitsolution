"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon, SiteShell } from "../../components";
import { FadeIn } from "../../animations";
import { useBlogPost } from "../../hooks";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPost(params.slug);

  return (
    <SiteShell active="Blog">
      <section className="page-hero">
        <div className="container">
          {isLoading && <div className="skeleton" style={{ height: 48, maxWidth: 600, margin: "0 auto" }} />}
          {isError && (
            <div className="text-center">
              <h1 className="section-title">Post Not Found</h1>
              <Link href="/blog" className="pill pill-outline"><Icon name="fa-arrow-left" /> Back to Blog</Link>
            </div>
          )}
          {post && (
            <FadeIn>
              <div className="text-center" style={{ marginBottom: 40 }}>
                <div className="section-eyebrow">{post.category || "Blog"}</div>
                <h1 className="section-title">{post.title}</h1>
                <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>{post.author} · {post.date}</p>
              </div>
              <div className="blog-post-body">
                {post.content.split("\n").filter(Boolean).map((para: string, i: number) => <p key={i}>{para}</p>)}
              </div>
              <div className="text-center" style={{ marginTop: 48 }}>
                <Link href="/blog" className="pill pill-outline"><Icon name="fa-arrow-left" /> Back to Blog</Link>
              </div>
            </FadeIn>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
