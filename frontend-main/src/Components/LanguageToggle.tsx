import React from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, type Lang } from "../i18n/config";

/**
 * EN / اردو language toggle. Replaces the old Google Translate widget with a
 * proper react-i18next switch that also flips the layout to RTL for Urdu.
 */
const LanguageToggle: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { i18n } = useTranslation();
  const current = (i18n.language?.startsWith("ur") ? "ur" : "en") as Lang;

  const toggle = () => setLanguage(current === "en" ? "ur" : "en");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={current === "en" ? "Switch to Urdu" : "Switch to English"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        border: "1px solid #11998e",
        background: "transparent",
        color: "#11998e",
        borderRadius: "9999px",
        padding: compact ? "3px 10px" : "5px 14px",
        fontSize: compact ? "0.8rem" : "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
      }}
    >
      <span aria-hidden>🌐</span>
      {current === "en" ? "اردو" : "English"}
    </button>
  );
};

export default LanguageToggle;
