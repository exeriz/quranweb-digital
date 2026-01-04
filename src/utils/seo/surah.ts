import type { MetaTagsOptions, StructuredData } from "./types";
import { SEO_CONFIG } from "./config";
import { updateMetaTags } from "./meta-tags";

export function createSurahMetaTags(
  surahNumber: number,
  surahName: string,
  surahNameLatin: string,
  surahDescription: string,
  ayatCount: number
): MetaTagsOptions {
  const title = `Surat ${surahNameLatin} (${surahName}) - Al-Qur'an Digital | ${ayatCount} Ayat`;
  const description = `Baca Surat ${surahNameLatin} dengan ${ayatCount} ayat. ${surahDescription} Lengkap dengan terjemahan Indonesia dan tafsir.`;
  const url = `${SEO_CONFIG.site.url}/surah/${surahNumber}`;

  return {
    title,
    description,
    keywords: [
      `Surat ${surahNameLatin}`,
      surahName,
      "Qur'an",
      "tafsir",
      "terjemahan",
      `ayat ${ayatCount}`,
    ],
    image: SEO_CONFIG.site.image,
    url,
    type: "article",
  };
}

export function generateSurahStructuredData(
  surahNumber: number,
  surahNameLatin: string,
  surahDescription: string,
  ayatCount: number,
  tempatTurun: "Mekah" | "Madinah"
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Surat ${surahNameLatin}`,
    description: surahDescription,
    image: SEO_CONFIG.site.image,
    author: {
      "@type": "Organization",
      name: SEO_CONFIG.site.name,
      url: SEO_CONFIG.site.url,
    },
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.site.name,
      logo: {
        "@type": "ImageObject",
        url: SEO_CONFIG.site.image,
      },
    },
    datePublished: new Date().toISOString(),
    mainEntity: {
      "@type": "CreativeWork",
      name: `Surat ${surahNameLatin}`,
      author: "Allah",
      dateCreated: "610-632",
      description: `Surat ke-${surahNumber} dalam Al-Qur'an dengan ${ayatCount} ayat. Diturunkan di ${tempatTurun}.`,
    },
  };
}

export function setSurahPageMeta(
  surahNumber: number,
  surahName: string,
  surahNameLatin: string,
  surahDescription: string,
  ayatCount: number
): void {
  const metaTags = createSurahMetaTags(
    surahNumber,
    surahName,
    surahNameLatin,
    surahDescription,
    ayatCount
  );
  updateMetaTags(metaTags);
}

export function getSurahPageUrl(surahNumber: number): string {
  return `${SEO_CONFIG.site.url}/surah/${surahNumber}`;
}
