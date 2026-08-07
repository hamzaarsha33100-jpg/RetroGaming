"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/i18n";

interface LanguageState {
  language: string;
  setLanguage: (code: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (code) => set({ language: code }),
    }),
    {
      name: "retro-language",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { LANGUAGES, DEFAULT_LANGUAGE };
