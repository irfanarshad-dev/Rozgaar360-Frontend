'use client';

import { useEffect, useRef } from 'react';
import i18n from 'i18next';

const NAMESPACES = ['common', 'auth', 'dashboard', 'worker', 'customer', 'home', 'recommendations'];

const EXTRA_EN_UR = {
  'Login': 'لاگ ان',
  'Sign Up': 'سائن اپ',
  'Open menu': 'مینو کھولیں',
  'Close menu': 'مینو بند کریں',
  'Toggle Language': 'زبان تبدیل کریں',
  'Switch to English': 'انگریزی پر تبدیل کریں',
  'Switch to اردو': 'اردو پر تبدیل کریں',
};

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function flattenStrings(value, out = []) {
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => flattenStrings(item, out));
    return out;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => flattenStrings(item, out));
  }

  return out;
}

function translateWithPunctuation(text, map) {
  if (!text || typeof text !== 'string') return text;

  const leadingWhitespace = text.match(/^\s*/)?.[0] || '';
  const trailingWhitespace = text.match(/\s*$/)?.[0] || '';
  const trimmed = text.trim();

  if (!trimmed) return text;

  const exact = map.get(normalize(trimmed));
  if (exact) return `${leadingWhitespace}${exact}${trailingWhitespace}`;

  const punctMatch = trimmed.match(/^(.+?)([.!?:;,]+)$/);
  if (punctMatch) {
    const base = punctMatch[1].trim();
    const punct = punctMatch[2];
    const translatedBase = map.get(normalize(base));
    if (translatedBase) {
      return `${leadingWhitespace}${translatedBase}${punct}${trailingWhitespace}`;
    }
  }

  return text;
}

function hasEnglishSourceMatch(text, map) {
  if (!text || typeof text !== 'string') return false;

  const trimmed = text.trim();
  if (!trimmed) return false;

  if (map.has(normalize(trimmed))) return true;

  const punctMatch = trimmed.match(/^(.+?)([.!?:;,]+)$/);
  if (punctMatch) {
    return map.has(normalize(punctMatch[1].trim()));
  }

  return false;
}

function isSkippableTextNode(node) {
  const parentTag = node.parentElement?.tagName;
  if (!parentTag) return true;

  if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA'].includes(parentTag)) {
    return true;
  }

  if (node.parentElement?.isContentEditable) {
    return true;
  }

  const content = node.textContent || '';
  if (!content.trim()) return true;

  return false;
}

export default function AutoTranslateHardcodedText() {
  const dictionariesRef = useRef({
    enToUr: new Map(),
    urToEn: new Map(),
  });
  const textNodeOriginalRef = useRef(new WeakMap());
  const attrOriginalRef = useRef(new WeakMap());

  useEffect(() => {
    let mounted = true;

    const buildDictionaries = async () => {
      const pairs = [];

      for (const ns of NAMESPACES) {
        try {
          const [enRes, urRes] = await Promise.all([
            fetch(`/locales/en/${ns}.json`, { cache: 'no-store' }),
            fetch(`/locales/ur/${ns}.json`, { cache: 'no-store' }),
          ]);

          if (!enRes.ok || !urRes.ok) continue;

          const [enJson, urJson] = await Promise.all([enRes.json(), urRes.json()]);
          const enStrings = flattenStrings(enJson);
          const urStrings = flattenStrings(urJson);

          const limit = Math.min(enStrings.length, urStrings.length);
          for (let i = 0; i < limit; i += 1) {
            const en = enStrings[i];
            const ur = urStrings[i];
            if (typeof en === 'string' && typeof ur === 'string') {
              pairs.push([en, ur]);
            }
          }
        } catch {
          // Ignore a namespace fetch failure and keep the rest.
        }
      }

      Object.entries(EXTRA_EN_UR).forEach(([en, ur]) => pairs.push([en, ur]));

      const enToUr = new Map();
      const urToEn = new Map();

      pairs.forEach(([en, ur]) => {
        const enKey = normalize(en);
        const urKey = normalize(ur);

        if (enKey && urKey) {
          if (!enToUr.has(enKey)) enToUr.set(enKey, ur);
          if (!urToEn.has(urKey)) urToEn.set(urKey, en);
        }
      });

      if (!mounted) return;

      dictionariesRef.current = { enToUr, urToEn };
      window.dispatchEvent(new CustomEvent('hardcodedTranslationReady'));
    };

    buildDictionaries();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let raf = null;

    const applyTranslation = () => {
      const language = i18n.language || localStorage.getItem('language') || 'en';
      const toUrdu = language === 'ur';
      const { enToUr } = dictionariesRef.current;

      if (!enToUr.size) return;

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const textNodes = [];

      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (isSkippableTextNode(node)) continue;
        textNodes.push(node);
      }

      textNodes.forEach((node) => {
        const originalMap = textNodeOriginalRef.current;
        const currentText = node.textContent || '';

        if (toUrdu) {
          const sourceText = originalMap.has(node) ? originalMap.get(node) : currentText;
          if (!hasEnglishSourceMatch(sourceText, enToUr)) return;

          if (!originalMap.has(node)) {
            originalMap.set(node, currentText);
          }

          const translated = translateWithPunctuation(sourceText, enToUr);
          if (translated !== currentText) {
            node.textContent = translated;
          }
          return;
        }

        if (originalMap.has(node)) {
          const original = originalMap.get(node);
          if (typeof original === 'string' && original !== currentText) {
            node.textContent = original;
          }
          originalMap.delete(node);
          return;
          }

        // For English mode, avoid transforming text that was not translated by this component.
        // i18next-driven text should render naturally.
        if (!hasEnglishSourceMatch(currentText, enToUr)) {
          return;
        }

        // Keep text as-is in English mode.
        if (hasEnglishSourceMatch(currentText, enToUr)) {
          return;
        }
      });

      const translatableAttrs = ['placeholder', 'title', 'aria-label', 'alt', 'value'];
      const elements = document.querySelectorAll('input, textarea, button, a, img, [title], [aria-label]');

      elements.forEach((el) => {
        let originalAttrs = attrOriginalRef.current.get(el);
        if (!originalAttrs) {
          originalAttrs = {};
          attrOriginalRef.current.set(el, originalAttrs);
        }

        translatableAttrs.forEach((attr) => {
          const currentVal = el.getAttribute(attr);
          if (!currentVal) return;

          if (toUrdu) {
            const sourceVal = Object.prototype.hasOwnProperty.call(originalAttrs, attr)
              ? originalAttrs[attr]
              : currentVal;

            if (!hasEnglishSourceMatch(sourceVal, enToUr)) return;

            if (!Object.prototype.hasOwnProperty.call(originalAttrs, attr)) {
              originalAttrs[attr] = currentVal;
            }

            const translated = translateWithPunctuation(sourceVal, enToUr);
            if (translated !== currentVal) {
              el.setAttribute(attr, translated);
            }
            return;
          }

          if (Object.prototype.hasOwnProperty.call(originalAttrs, attr)) {
            const original = originalAttrs[attr];
            if (original && original !== currentVal) {
              el.setAttribute(attr, original);
            }
            delete originalAttrs[attr];
            return;
          }

          // In English mode do not reverse-translate attributes.
        });
      });
    };

    const scheduleApply = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyTranslation);
    };

    scheduleApply();

    const observer = new MutationObserver(() => {
      scheduleApply();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'alt', 'value'],
    });

    const onStorage = (e) => {
      if (e.key === 'language') scheduleApply();
    };

    const onI18nLanguageChanged = () => scheduleApply();
    const onDictionaryReady = () => scheduleApply();

    window.addEventListener('storage', onStorage);
    window.addEventListener('hardcodedTranslationReady', onDictionaryReady);
    i18n.on('languageChanged', onI18nLanguageChanged);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('hardcodedTranslationReady', onDictionaryReady);
      i18n.off('languageChanged', onI18nLanguageChanged);
    };
  }, []);

  return null;
}
