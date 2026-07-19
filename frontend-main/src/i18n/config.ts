import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import ur from "./locales/ur";

export const LANGS = ["en", "ur"] as const;
export type Lang = (typeof LANGS)[number];

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "ur") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

const initialLang = getInitialLang();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

/**
 * Apply document-level side effects for a language: text direction (RTL for
 * Urdu), the `lang` attribute, and the Urdu Nastaliq font class.
 */
export function applyLangSideEffects(lang: Lang) {
  if (typeof document === "undefined") return;
  const isUrdu = lang === "ur";
  document.documentElement.lang = lang;
  document.documentElement.dir = isUrdu ? "rtl" : "ltr";
  document.body.classList.toggle("urdu-font", isUrdu);
}

export function setLanguage(lang: Lang) {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem("lang", lang);
  } catch {
    /* ignore */
  }
  applyLangSideEffects(lang);
}

// Apply on initial load.
applyLangSideEffects(initialLang);

export default i18n;
