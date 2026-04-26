/**
 * Translation Utility Helper
 * 
 * This file contains helper functions to work with translations
 * Use these in your components for consistent translation handling
 */

/**
 * Get translation with fallback
 * @param {Function} t - Translation function from useTranslation
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if translation missing
 * @returns {string} Translated text or fallback
 */
export const tWithFallback = (t, key, fallback) => {
  const translation = t(key);
  return translation === key ? fallback : translation;
};

/**
 * Get pluralized translation
 * @param {Function} t - Translation function
 * @param {string} key - Translation key
 * @param {number} count - Count for pluralization
 * @returns {string} Pluralized translation
 */
export const tPlural = (t, key, count) => {
  return t(key, { count });
};

/**
 * Get translation with interpolation
 * @param {Function} t - Translation function
 * @param {string} key - Translation key
 * @param {Object} values - Values to interpolate
 * @returns {string} Interpolated translation
 */
export const tInterpolate = (t, key, values) => {
  return t(key, values);
};

/**
 * Check if current language is RTL
 * @param {string} language - Current language code
 * @returns {boolean} True if RTL language
 */
export const isRTL = (language) => {
  const rtlLanguages = ['ur', 'ar', 'he', 'fa'];
  return rtlLanguages.includes(language);
};

/**
 * Get direction for current language
 * @param {string} language - Current language code
 * @returns {string} 'rtl' or 'ltr'
 */
export const getDirection = (language) => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

/**
 * Format number based on locale
 * @param {number} number - Number to format
 * @param {string} language - Language code
 * @returns {string} Formatted number
 */
export const formatNumber = (number, language) => {
  return new Intl.NumberFormat(language === 'ur' ? 'ur-PK' : 'en-US').format(number);
};

/**
 * Format currency based on locale
 * @param {number} amount - Amount to format
 * @param {string} language - Language code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, language) => {
  return new Intl.NumberFormat(language === 'ur' ? 'ur-PK' : 'en-US', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
};

/**
 * Format date based on locale
 * @param {Date|string} date - Date to format
 * @param {string} language - Language code
 * @returns {string} Formatted date
 */
export const formatDate = (date, language) => {
  return new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Get skill translation
 * Skills are stored in English in DB, this maps them to translations
 */
export const SKILL_TRANSLATIONS = {
  en: {
    Plumber: 'Plumber',
    Electrician: 'Electrician',
    Carpenter: 'Carpenter',
    Tailor: 'Tailor',
    Painter: 'Painter',
    Cleaner: 'Cleaner',
    Mechanic: 'Mechanic',
    Cook: 'Cook',
    Driver: 'Driver',
    'AC Repair': 'AC Repair',
  },
  ur: {
    Plumber: 'پلمبر',
    Electrician: 'الیکٹریشن',
    Carpenter: 'بڑھئی',
    Tailor: 'درزی',
    Painter: 'پینٹر',
    Cleaner: 'صفائی کرنے والا',
    Mechanic: 'مکینک',
    Cook: 'باورچی',
    Driver: 'ڈرائیور',
    'AC Repair': 'اے سی مرمت',
  },
};

/**
 * Get city translation
 * Cities are stored in English in DB, this maps them to translations
 */
export const CITY_TRANSLATIONS = {
  en: {
    Karachi: 'Karachi',
    Lahore: 'Lahore',
    Islamabad: 'Islamabad',
    Rawalpindi: 'Rawalpindi',
    Faisalabad: 'Faisalabad',
    Multan: 'Multan',
    Peshawar: 'Peshawar',
    Quetta: 'Quetta',
    Sialkot: 'Sialkot',
    Gujranwala: 'Gujranwala',
  },
  ur: {
    Karachi: 'کراچی',
    Lahore: 'لاہور',
    Islamabad: 'اسلام آباد',
    Rawalpindi: 'راولپنڈی',
    Faisalabad: 'فیصل آباد',
    Multan: 'ملتان',
    Peshawar: 'پشاور',
    Quetta: 'کوئٹہ',
    Sialkot: 'سیالکوٹ',
    Gujranwala: 'گوجرانوالہ',
  },
};

/**
 * Translate skill name
 * @param {string} skill - Skill name in English
 * @param {string} language - Target language
 * @returns {string} Translated skill name
 */
export const translateSkill = (skill, language) => {
  return SKILL_TRANSLATIONS[language]?.[skill] || skill;
};

/**
 * Translate city name
 * @param {string} city - City name in English
 * @param {string} language - Target language
 * @returns {string} Translated city name
 */
export const translateCity = (city, language) => {
  return CITY_TRANSLATIONS[language]?.[city] || city;
};

/**
 * Example usage in a component:
 * 
 * import { useTranslation } from 'react-i18next';
 * import { useLanguage } from '@/lib/i18nProvider';
 * import { translateSkill, formatCurrency, isRTL } from '@/lib/translationUtils';
 * 
 * export default function MyComponent() {
 *   const { t } = useTranslation('common');
 *   const { language } = useLanguage();
 *   
 *   const skill = 'Plumber';
 *   const price = 5000;
 *   
 *   return (
 *     <div dir={isRTL(language) ? 'rtl' : 'ltr'}>
 *       <h1>{translateSkill(skill, language)}</h1>
 *       <p>{formatCurrency(price, language)}</p>
 *       <button>{t('bookNow')}</button>
 *     </div>
 *   );
 * }
 */

export default {
  tWithFallback,
  tPlural,
  tInterpolate,
  isRTL,
  getDirection,
  formatNumber,
  formatCurrency,
  formatDate,
  translateSkill,
  translateCity,
  SKILL_TRANSLATIONS,
  CITY_TRANSLATIONS,
};
