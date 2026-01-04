import { APP_CONFIG } from "@/config/app";

export interface SEOMeta {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  keywords?: string[];
}

class SEOManager {
  updateMeta(meta: SEOMeta): void {
    if (meta.title) {
      document.title = `${meta.title} | ${APP_CONFIG.APP_NAME}`;
    }

    this.setMetaTag(
      "description",
      meta.description || APP_CONFIG.APP_DESCRIPTION
    );
    this.setMetaTag("og:title", meta.title || APP_CONFIG.APP_NAME);
    this.setMetaTag(
      "og:description",
      meta.description || APP_CONFIG.APP_DESCRIPTION
    );

    if (meta.image) {
      this.setMetaTag("og:image", meta.image);
    }

    if (meta.url) {
      this.setMetaTag("og:url", meta.url);
    }

    if (meta.type) {
      this.setMetaTag("og:type", meta.type);
    }

    if (meta.keywords?.length) {
      this.setMetaTag("keywords", meta.keywords.join(", "));
    }

    this.setMetaTag("twitter:card", "summary_large_image");
    this.setMetaTag("twitter:title", meta.title || APP_CONFIG.APP_NAME);
    this.setMetaTag(
      "twitter:description",
      meta.description || APP_CONFIG.APP_DESCRIPTION
    );
    if (meta.image) {
      this.setMetaTag("twitter:image", meta.image);
    }
  }

  setCanonical(url: string): void {
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = url;
  }

  addStructuredData(data: unknown): void {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  addWebsiteSchema(): void {
    this.addStructuredData({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: APP_CONFIG.APP_NAME,
      description: APP_CONFIG.APP_DESCRIPTION,
      url: typeof window !== "undefined" ? window.location.origin : "",
    });
  }

  addSurahSchema(surah: {
    nomor: number;
    namaLatin: string;
    arti: string;
    jumlahAyat: number;
  }): void {
    this.addStructuredData({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${surah.namaLatin} - ${surah.arti}`,
      description: `Baca Surah ${surah.namaLatin} (${surah.arti}) dengan ${surah.jumlahAyat} ayat`,
      author: {
        "@type": "Organization",
        name: APP_CONFIG.APP_NAME,
      },
    });
  }

  private setMetaTag(name: string, content: string): void {
    let tag = (document.querySelector(`meta[name="${name}"]`) ||
      document.querySelector(
        `meta[property="${name}"]`
      )) as HTMLMetaElement | null;

    if (!tag) {
      tag = document.createElement("meta") as HTMLMetaElement;
      const isProperty = name.startsWith("og:") || name.startsWith("twitter:");
      if (isProperty) {
        tag.setAttribute("property", name);
      } else {
        tag.setAttribute("name", name);
      }
      document.head.appendChild(tag);
    }

    tag.content = content;
  }
}

export const seoManager = new SEOManager();

if (typeof window !== "undefined") {
  seoManager.addWebsiteSchema();
}
