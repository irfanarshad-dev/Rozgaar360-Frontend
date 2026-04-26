'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * LanguageInitializer Component
 * 
 * This component ensures that the language preference is properly
 * applied on every page load and route change.
 * 
 * It should be included in the root layout to work across all routes.
 */
export default function LanguageInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    // Apply language attributes to HTML element
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === 'ur' ? 'rtl' : 'ltr';
    
    // Add language class to body for CSS targeting
    document.body.classList.remove('lang-en', 'lang-ur');
    document.body.classList.add(`lang-${savedLanguage}`);
    
    // Add direction class to body
    document.body.classList.remove('dir-ltr', 'dir-rtl');
    document.body.classList.add(`dir-${savedLanguage === 'ur' ? 'rtl' : 'ltr'}`);
  }, [pathname]); // Re-run on route change

  // This component doesn't render anything
  return null;
}
