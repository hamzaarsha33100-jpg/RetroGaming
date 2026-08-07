"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { setActiveLanguage, getLanguage } from "@/lib/i18n";

export default function LanguageSync({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useLanguageStore((s) => s.language);

  setActiveLanguage(language);

  useEffect(() => {
    const lang = getLanguage(language);
    document.documentElement.setAttribute("lang", lang.code);
    document.documentElement.setAttribute("dir", lang.rtl ? "rtl" : "ltr");
  }, [language]);

  return <>{children}</>;
}
