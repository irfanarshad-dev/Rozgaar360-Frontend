'use client';
// This component initializes i18n for the entire app

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Initialize i18next
// This runs once when app starts
if (!i18n.isInitialized) {
  i18n
    // Step 1: Add HTTP backend to fetch translations from i18nexus
    .use(HttpBackend)
    
    // Step 2: Add React bindings
    .use(initReactI18next)
    
    // Step 3: Initialize with configuration
    .init({
      // Fallback language if translation missing
      fallbackLng: 'en',
      
      // Default language
      lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
      
      // Enable debug mode in development
      debug: false,
      
      // Namespaces for organizing translations
      ns: ['common', 'auth', 'dashboard', 'worker', 'customer'],
      defaultNS: 'common',
      
      // React-specific settings
      react: {
        useSuspense: false, // Don't use Suspense (better for Next.js)
      },
      
      // Backend configuration for local files
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      
      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes
      },
    });
}

/**
 * I18nProvider Component
 * 
 * Purpose: Wraps entire app to provide i18n functionality
 * 
 * How it works:
 * 1. Initializes i18next on mount
 * 2. Provides translation context to all child components
 * 3. Handles language switching
 * 4. Persists language preference in localStorage
 */
export function I18nProvider({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);
  
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

/**
 * Custom hook for language switching
 * 
 * Usage in components:
 * const { language, changeLanguage } = useLanguage();
 * 
 * changeLanguage('ur'); // Switch to Urdu
 */
export function useLanguage() {
  const router = useRouter();
  
  const changeLanguage = async (newLanguage) => {
    // Step 1: Change language in i18next
    await i18n.changeLanguage(newLanguage);
    
    // Step 2: Save preference in localStorage
    localStorage.setItem('language', newLanguage);
    
    // Step 3: Update HTML dir attribute for RTL
    document.documentElement.dir = newLanguage === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
    
    // Step 4: Refresh page to apply changes
    router.refresh();
  };
  
  return {
    language: i18n.language,
    changeLanguage,
    t: i18n.t.bind(i18n), // Translation function
  };
}
