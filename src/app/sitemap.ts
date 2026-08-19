import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/swap-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
