import type { StructuredData } from "./types";
import { SEO_CONFIG } from "./config";

export function generateWebsiteStructuredData(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.site.name,
    description: SEO_CONFIG.site.description,
    url: SEO_CONFIG.site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.site.url}/search?q={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
  };
}

export function generateOrganizationStructuredData(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.site.name,
    description: SEO_CONFIG.site.description,
    url: SEO_CONFIG.site.url,
    logo: {
      "@type": "ImageObject",
      url: SEO_CONFIG.site.image,
    },
    author: {
      "@type": "Person",
      name: SEO_CONFIG.site.author,
    },
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): StructuredData {
  const itemListElement = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

export function generateArticleStructuredData(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image || SEO_CONFIG.site.image,
    datePublished: article.datePublished || new Date().toISOString(),
    dateModified: article.dateModified || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: article.author || SEO_CONFIG.site.name,
    },
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.site.name,
      logo: {
        "@type": "ImageObject",
        url: SEO_CONFIG.site.image,
      },
    },
  };
}

export function addStructuredData(data: StructuredData): void {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function clearStructuredData(): void {
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => {
      script.remove();
    });
}
