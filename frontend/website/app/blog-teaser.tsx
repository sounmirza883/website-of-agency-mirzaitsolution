"use client";

import Link from "next/link";
import { Icon } from "./components";
import { FadeIn, StaggerContainer, StaggerItem } from "./animations";
import { useBlogPosts } from "./hooks";

export function BlogTeaser() {
  const { data: posts } = useBlogPosts();
  if (!posts || posts.length === 0) return null;

  return (
    <section className="section-soft">
      <div className="container">
        <FadeIn>
          <div className="text-center">
            <div className="section-eyebrow">From the Blog</div>
            <h2 className="section-title">Latest <strong>Insights</strong></h2>
          </div>
          <StaggerContainer className="grid-3">
            {posts.slice(0, 3).map((post: any) => (
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
          <div className="text-center section-link">
            <Link href="/blog" className="pill pill-outline">View All Posts <Icon name="fa-arrow-right" /></Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
