// next-i18next.config.js
// This file configures how i18n works in your Next.js app

module.exports = {
  // Step 1: Define supported languages
  // 'en' = English (default), 'ur' = Urdu
  i18n: {
    defaultLocale: 'en',  // Fallback language if user's language not available
    locales: ['en', 'ur'], // All languages your app supports
    
    // Locale detection: How app determines user's language
    localeDetection: true, // Auto-detect from browser settings
  },
  
  // Step 2: Configure i18next behavior
  react: {
    useSuspense: false, // Don't use React Suspense (better for Next.js App Router)
  },
  
  // Step 3: Backend configuration for fetching translations
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  
  // Step 4: Namespaces - Organize translations by feature
  ns: ['common', 'auth', 'dashboard', 'worker', 'customer'],
  defaultNS: 'common', // Default namespace if not specified
  
  // Step 5: Debugging (helpful during development)
  debug: false,
  
  // Step 6: Interpolation settings
  interpolation: {
    escapeValue: false, // React already escapes values (prevents XSS)
  },
  
  // Step 7: Fallback behavior
  fallbackLng: 'en', // Use English if translation missing
  
  // Step 8: Load translations on demand (performance optimization)
  load: 'languageOnly', // Load 'en' not 'en-US', 'en-GB' etc.
};
