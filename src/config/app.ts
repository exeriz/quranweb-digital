export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "https://equran.id/api/v2",
  API_TIMEOUT: 10000,

  CACHE_MAX_SIZE: 100,
  CACHE_DEFAULT_TTL: 5 * 60 * 1000,
  CACHE_TTL: {
    SURAHS: 10 * 60 * 1000,
    SURAH_DETAIL: 15 * 60 * 1000,
    TAFSIR: 30 * 60 * 1000,
  },

  RETRY_MAX_ATTEMPTS: 3,
  RETRY_INITIAL_DELAY: 1000,
  RETRY_MAX_DELAY: 10000,

  SEARCH_DEBOUNCE_DELAY: 300,
  SEARCH_MAX_RESULTS: 20,

  APP_NAME: "Digital Al-Quran",
  APP_DESCRIPTION: "Baca, dengarkan, dan pelajari Al-Quran dengan mudah",
  APP_VERSION: "1.0.0",

  ENABLE_ANALYTICS: !import.meta.env.DEV,
  ENABLE_ERROR_TRACKING: !import.meta.env.DEV,
  ENABLE_PERFORMANCE_MONITORING: !import.meta.env.DEV,

  ROUTES: {
    HOME: "/",
    SURAH: (id: number) => `/surat/${id}`,
  } as const,

  TOTAL_SURAHS: 114,

  LONG_TASK_THRESHOLD: 50,
  LCP_THRESHOLD: 2500,
  FID_THRESHOLD: 100,
  CLS_THRESHOLD: 0.1,
} as const;

export default APP_CONFIG;
