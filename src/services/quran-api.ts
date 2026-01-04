import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Surah, SurahDetail, Tafsir } from "@/types";
import { cacheManager } from "@/utils/cache";
import { retryAsync } from "@/utils/retry";
import { logger, APIError } from "@/utils/logger";

const API_BASE_URL = "https://equran.id/api/v2";

const CACHE_KEYS = {
  ALL_SURAHS: "all_surahs",
  SURAH: (id: number) => `surah_${id}`,
  TAFSIR: (id: number) => `tafsir_${id}`,
} as const;

class QuranAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error("API Error", error.message, {
          url: error.config?.url,
          status: error.response?.status,
        });
        throw error;
      }
    );
  }

  async getAllSurahs(): Promise<Surah[]> {
    try {
      const cached = cacheManager.get<Surah[]>(CACHE_KEYS.ALL_SURAHS);
      if (cached) {
        logger.debug("Using cached all surahs");
        return cached;
      }

      const data = await retryAsync(
        async () => {
          const response = await this.client.get("/surat");
          return response.data.data || [];
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
        }
      );

      cacheManager.set(CACHE_KEYS.ALL_SURAHS, data, 10 * 60 * 1000);
      logger.info("Fetched all surahs successfully", { count: data.length });

      return data;
    } catch (error) {
      logger.error("Failed to fetch surahs", error);
      throw new APIError(
        "Failed to fetch surahs",
        500,
        "FETCH_SURAHS_ERROR",
        error
      );
    }
  }

  async getSurah(surahNumber: number): Promise<SurahDetail> {
    try {
      if (
        !Number.isInteger(surahNumber) ||
        surahNumber < 1 ||
        surahNumber > 114
      ) {
        throw new Error("Invalid surah number");
      }

      const cacheKey = CACHE_KEYS.SURAH(surahNumber);

      const cached = cacheManager.get<SurahDetail>(cacheKey);
      if (cached) {
        logger.debug(`Using cached surah ${surahNumber}`);
        return cached;
      }

      const data = await retryAsync(
        async () => {
          const response = await this.client.get(`/surat/${surahNumber}`);
          return response.data.data;
        },
        {
          maxRetries: 2,
          initialDelay: 800,
        }
      );

      cacheManager.set(cacheKey, data, 15 * 60 * 1000);
      logger.info(`Fetched surah ${surahNumber} successfully`);

      return data;
    } catch (error) {
      logger.error(`Failed to fetch surah ${surahNumber}`, error);
      throw new APIError(
        `Failed to fetch surah ${surahNumber}`,
        500,
        "FETCH_SURAH_ERROR",
        error
      );
    }
  }

  async searchSurahs(query: string): Promise<Surah[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const allSurahs = await this.getAllSurahs();
      const lowerQuery = query.toLowerCase().trim();
      const results = allSurahs.filter(
        (surah: Surah) =>
          surah.namaLatin.toLowerCase().includes(lowerQuery) ||
          surah.arti.toLowerCase().includes(lowerQuery) ||
          String(surah.nomor).includes(lowerQuery)
      );

      logger.debug("Search completed", { query, resultCount: results.length });
      return results;
    } catch (error) {
      logger.error("Failed to search surahs", error);
      throw new APIError(
        "Failed to search surahs",
        500,
        "SEARCH_SURAHS_ERROR",
        error
      );
    }
  }

  async getTafsir(ayahNumber: number): Promise<Tafsir> {
    try {
      if (!Number.isInteger(ayahNumber) || ayahNumber < 1) {
        throw new Error("Invalid ayah number");
      }

      const cacheKey = CACHE_KEYS.TAFSIR(ayahNumber);
      const cached = cacheManager.get<Tafsir>(cacheKey);
      if (cached) {
        logger.debug(`Using cached tafsir for ayah ${ayahNumber}`);
        return cached;
      }

      const data = await retryAsync(
        async () => {
          const response = await this.client.get(`/tafsir/${ayahNumber}`);
          return response.data.data;
        },
        {
          maxRetries: 2,
          initialDelay: 800,
        }
      );

      cacheManager.set(cacheKey, data, 30 * 60 * 1000);
      logger.info(`Fetched tafsir for ayah ${ayahNumber} successfully`);

      return data;
    } catch (error) {
      logger.error(`Failed to fetch tafsir for ayah ${ayahNumber}`, error);
      throw new APIError(
        `Failed to fetch tafsir for ayah ${ayahNumber}`,
        500,
        "FETCH_TAFSIR_ERROR",
        error
      );
    }
  }

  clearCache(): void {
    cacheManager.clear();
    logger.info("Cache cleared");
  }

  getCacheInfo() {
    return {
      size: cacheManager.size(),
      keys: cacheManager.keys(),
    };
  }
}

export const quranAPI = new QuranAPI();
