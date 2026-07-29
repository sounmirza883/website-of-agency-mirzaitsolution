"use client";

import Link from "next/link";
import { Icon, PageHero, SiteShell } from "../components";
import { FadeIn, StaggerContainer, StaggerItem } from "../animations";
import { useBlogPosts } from "../hooks";

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <SiteShell active="Blog">
      <PageHero eyebrow="Blog" title={<>Insights & <strong>Updates</strong></>}>
        Notes on software, product, and building things that last.
      </PageHero>
      <section>
        <div className="container">
          {isLoading && (
            <div className="grid-3">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 320 }} />)}
            </div>
          )}
          {!isLoading && posts && posts.length === 0 && (
            <div className="text-center" style={{ color: "var(--ink-muted)" }}>No posts published yet — check back soon.</div>
          )}
          {!isLoading && posts && posts.length > 0 && (
            <FadeIn>
              <StaggerContainer className="grid-3">
                {posts.map((post: any) => (
                  <StaggerItem key={post.id} className="blog-card">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="thumb">
                        {post.featured_image ? <img src={post.featured_image} alt={post.title} /> : <Icon name="fa-newspaper" />}
                      </div>
                      <div className="info">
                        <div className="meta">
                          {post.category && <span className="cat">{post.category}</span>}
                          <span>{post.date}</span>
                        </div>
                        <h3>{post.title}</h3>
                        {post.excerpt && <p>{post.excerpt}</p>}
                        <span className="read-more">Read More <Icon name="fa-arrow-right" /></span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeIn>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
