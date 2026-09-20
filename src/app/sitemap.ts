import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { TOOLS } from "@/lib/tools";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { getAllContentPages } from "@/lib/pages";

/** Generated from the tool registry and the blog folder — no manual upkeep. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const posts = getAllPosts();

  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      // Use the post's own date so re-publishing does not churn every entry.
      lastModified: post.date ? new Date(post.date) : lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...getAllTags().map((entry) => ({
      url: `${SITE_URL}/blog/tag/${entry.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...getAllContentPages().map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
