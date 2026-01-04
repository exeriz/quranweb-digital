export interface MetaTagsOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "book";
}

export interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords?: string[];
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  image: string;
  author: string;
  keywords: string[];
}
