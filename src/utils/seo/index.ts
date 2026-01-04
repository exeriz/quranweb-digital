export type {
  MetaTagsOptions,
  StructuredData,
  PageSEOConfig,
  SiteConfig,
} from "./types";

export { SEO_CONFIG, getSiteConfig, getHomePageConfig } from "./config";

export {
  updateMetaTags,
  setCanonical,
  getMetaTags,
  removeMetaTag,
  clearMetaTags,
} from "./meta-tags";

export {
  createSurahMetaTags,
  generateSurahStructuredData,
  setSurahPageMeta,
  getSurahPageUrl,
} from "./surah";

export {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData,
  generateArticleStructuredData,
  addStructuredData,
  clearStructuredData,
} from "./structured-data";

import { updateMetaTags } from "./meta-tags";
import { SEO_CONFIG, getHomePageConfig } from "./config";

export function resetMetaTags(): void {
  const homeConfig = getHomePageConfig();
  updateMetaTags({
    title: `${SEO_CONFIG.site.name} - ${homeConfig.title}`,
    description: homeConfig.description,
    keywords: SEO_CONFIG.site.keywords,
    image: SEO_CONFIG.site.image,
    url: SEO_CONFIG.site.url,
  });
}

export const useSEOMeta = updateMetaTags;
