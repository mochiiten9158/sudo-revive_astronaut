import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  translate,
  type Language,
  type TranslationKey,
} from "../i18n/translations";

export type Theme = "dark" | "light";

export type TextSize = "standard" | "large" | "extra-large";

export type VisionMode =
  | "standard"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia";

interface PreferencesContextType {
  language: Language;
  setLanguage: (language: Language) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  textSize: TextSize;
  setTextSize: (size: TextSize) => void;

  vision: VisionMode;
  setVision: (vision: VisionMode) => void;

  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;

  enhancedFocus: boolean;
  setEnhancedFocus: (enabled: boolean) => void;

  t: (key: TranslationKey) => string;
  resetPreferences: () => void;
}

const PreferencesContext =
  createContext<PreferencesContextType | undefined>(undefined);

function readStoredValue<T extends string>(
  key: string,
  allowedValues: readonly T[],
  fallback: T,
): T {
  const stored = localStorage.getItem(key);

  if (stored && allowedValues.includes(stored as T)) {
    return stored as T;
  }

  return fallback;
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
  const stored = localStorage.getItem(key);

  if (stored === "true") return true;
  if (stored === "false") return false;

  return fallback;
}

const defaultPreferences = {
  language: "en" as Language,
  theme: "dark" as Theme,
  textSize: "standard" as TextSize,
  vision: "standard" as VisionMode,
  highContrast: false,
  reducedMotion: false,
  enhancedFocus: false,
};

export function PreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(() =>
    readStoredValue("astra-language", ["en", "ru", "zh"], "en"),
  );

  const [theme, setTheme] = useState<Theme>(() =>
    readStoredValue("astra-theme", ["dark", "light"], "dark"),
  );

  const [textSize, setTextSize] = useState<TextSize>(() =>
    readStoredValue(
      "astra-text-size",
      ["standard", "large", "extra-large"],
      "standard",
    ),
  );

  const [vision, setVision] = useState<VisionMode>(() =>
    readStoredValue(
      "astra-vision",
      ["standard", "protanopia", "deuteranopia", "tritanopia"],
      "standard",
    ),
  );

  const [highContrast, setHighContrast] = useState(() =>
    readStoredBoolean("astra-high-contrast", false),
  );

  const [reducedMotion, setReducedMotion] = useState(() =>
    readStoredBoolean("astra-reduced-motion", false),
  );

  const [enhancedFocus, setEnhancedFocus] = useState(() =>
    readStoredBoolean("astra-enhanced-focus", false),
  );

  // Persist preferences and apply them to the entire document.
  useEffect(() => {
    const root = document.documentElement;

    root.lang = language;
    root.dataset.theme = theme;
    root.dataset.textSize = textSize;
    root.dataset.vision = vision;
    root.dataset.highContrast = String(highContrast);
    root.dataset.reducedMotion = String(reducedMotion);
    root.dataset.enhancedFocus = String(enhancedFocus);

    localStorage.setItem("astra-language", language);
    localStorage.setItem("astra-theme", theme);
    localStorage.setItem("astra-text-size", textSize);
    localStorage.setItem("astra-vision", vision);
    localStorage.setItem("astra-high-contrast", String(highContrast));
    localStorage.setItem("astra-reduced-motion", String(reducedMotion));
    localStorage.setItem("astra-enhanced-focus", String(enhancedFocus));
  }, [
    language,
    theme,
    textSize,
    vision,
    highContrast,
    reducedMotion,
    enhancedFocus,
  ]);

  const t = useCallback(
    (key: TranslationKey) => translate(language, key),
    [language],
  );

  const resetPreferences = useCallback(() => {
    setLanguage(defaultPreferences.language);
    setTheme(defaultPreferences.theme);
    setTextSize(defaultPreferences.textSize);
    setVision(defaultPreferences.vision);
    setHighContrast(defaultPreferences.highContrast);
    setReducedMotion(defaultPreferences.reducedMotion);
    setEnhancedFocus(defaultPreferences.enhancedFocus);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      textSize,
      setTextSize,
      vision,
      setVision,
      highContrast,
      setHighContrast,
      reducedMotion,
      setReducedMotion,
      enhancedFocus,
      setEnhancedFocus,
      t,
      resetPreferences,
    }),
    [
      language,
      theme,
      textSize,
      vision,
      highContrast,
      reducedMotion,
      enhancedFocus,
      t,
      resetPreferences,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider",
    );
  }

  return context;
}