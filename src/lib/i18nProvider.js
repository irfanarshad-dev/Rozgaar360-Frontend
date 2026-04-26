'use client';
// This component initializes i18n for the entire app

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Create a context for language state
const LanguageContext = createContext(null);

// Initialize i18next
// This runs once when app starts
if (!i18n.isInitialized) {
  i18n
    // Step 1: Add HTTP backend to fetch translations
    .use(HttpBackend)
    
    // Step 2: Add React bindings
    .use(initReactI18next)
    
    // Step 3: Initialize with configuration
    .init({
      // Fallback language if translation missing
      fallbackLng: 'en',
      
      // Keep first SSR and client render aligned; preferred language is applied after mount.
      lng: 'en',
      
      // Enable debug mode in development
      debug: false,
      
      // Namespaces for organizing translations
      ns: ['common', 'auth', 'dashboard', 'worker', 'customer', 'home', 'recommendations'],
      defaultNS: 'common',
      
      // React-specific settings
      react: {
        useSuspense: false, // Don't use Suspense (better for Next.js)
      },
      
      // Backend configuration for local files
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        // Add request options to prevent caching issues
        requestOptions: {
          cache: 'no-store',
        },
      },
      
      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes
      },
      
      // Load all namespaces on init
      preload: ['en', 'ur'],
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
 * 5. Applies RTL/LTR direction automatically
 */
export function I18nProvider({ children }) {
  const pathname = usePathname();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  
  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      // Load saved language preference from localStorage
      const savedLanguage = localStorage.getItem('language') || 'en';
      
      // Set language in i18next
      if (i18n.language !== savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
      }
      
      // Apply direction and lang attributes
      document.documentElement.dir = savedLanguage === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
      
      setCurrentLanguage(savedLanguage);
      setIsInitialized(true);
    };
    
    initLanguage();
  }, []);
  
  // Re-apply language settings on route change
  useEffect(() => {
    if (isInitialized) {
      const currentLang = localStorage.getItem('language') || 'en';
      document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;
    }
  }, [pathname, isInitialized]);
  
  // Listen for language changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'language' && e.newValue) {
        i18n.changeLanguage(e.newValue);
        document.documentElement.dir = e.newValue === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = e.newValue;
        setCurrentLanguage(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, isChangingLanguage, setIsChangingLanguage }}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
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
  const context = useContext(LanguageContext);
  
  const changeLanguage = async (newLanguage) => {
    try {
      if (context?.isChangingLanguage || newLanguage === i18n.language) {
        return;
      }

      if (context?.setIsChangingLanguage) {
        context.setIsChangingLanguage(true);
      }

      // Step 1: Change language in i18next
      await i18n.changeLanguage(newLanguage);
      
      // Step 2: Save preference in localStorage
      localStorage.setItem('language', newLanguage);
      
      // Step 3: Update HTML dir attribute for RTL
      document.documentElement.dir = newLanguage === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
      
      // Step 4: Update context state
      if (context?.setCurrentLanguage) {
        context.setCurrentLanguage(newLanguage);
      }

      // Step 5: Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLanguage } }));
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      if (context?.setIsChangingLanguage) {
        context.setIsChangingLanguage(false);
      }
    }
  };
  
  return {
    language: i18n.language,
    changeLanguage,
    t: i18n.t.bind(i18n), // Translation function
    isRTL: i18n.language === 'ur',
    isChangingLanguage: context?.isChangingLanguage || false,
  };
}

/**
 * Hook to listen for language changes
 * Useful for components that need to react to language changes
 */
export function useLanguageChange(callback) {
  useEffect(() => {
    const handleLanguageChange = (event) => {
      callback(event.detail.language);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, [callback]);
}
