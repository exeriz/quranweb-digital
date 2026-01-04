import type { SiteConfig, PageSEOConfig } from "./types";

export const SEO_CONFIG = {
  site: {
    name: "Al-Qur'an Digital",
    description:
      "Baca Al-Qur'an digital lengkap dengan terjemahan Indonesia, tafsir, dan audio reciter berkualitas",
    url: "https://quranweb-digital.vercel.app",
    image: "https://quranweb-digital.vercel.app/logo.png",
    author: "Al-Qur'an Digital",
    keywords: [
      "Al-Qur'an digital",
      "baca Quran online",
      "tafsir Al-Qur'an",
      "audio Quran",
      "terjemahan Quran Indonesia",
      "Quran interaktif",
      "aplikasi Quran",
      "hafal Quran",
    ],
  } as SiteConfig,

  pages: {
    home: {
      title:
        "Al-Qur'an Digital - Baca & Dengarkan Quran Online Lengkap dengan Tafsir Indonesia",
      description:
        "Aplikasi Al-Qur'an digital interaktif dengan 114 surah, terjemahan Indonesia, tafsir lengkap, dan audio dari berbagai reciter profesional. Baca Quran kapan saja di perangkat Anda.",
      keywords: ["home", "beranda"],
    } as PageSEOConfig,
  },
} as const;

export function getSiteConfig() {
  return SEO_CONFIG.site;
}

export function getHomePageConfig(): PageSEOConfig {
  return SEO_CONFIG.pages.home;
}
