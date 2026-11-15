
import { useEffect, useRef, useState, type ReactNode } from "react";

import logo from "../assets/logo.png";
import background from "../assets/background.jpg";
import introMusic from "../assets/ObservingTheStar.ogg";

import "./WelcomeScreen.css";

type Language = "en" | "ru" | "zh";
type Theme = "dark" | "light";
type VisionMode =
  | "standard"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia";

interface WelcomeScreenProps {
  loginContent: ReactNode;
}

const translations = {
  en: {
    subtitle: "Your health. Your mission.",
    description: "Personal health monitoring for missions beyond Earth.",
    enter: "ENTER ASTRA",
    musicOn: "Play music",
    musicOff: "Pause music",
    settings: "Display & accessibility",
    login: "Astronaut Login",
    close: "Close",
    theme: "Appearance",
    dark: "Dark",
    light: "Light",
    vision: "Color vision",
    standard: "Standard",
    protanopia: "Protanopia",
    deuteranopia: "Deuteranopia",
    tritanopia: "Tritanopia",
    largeText: "Large text",
    highContrast: "High contrast",
    reducedMotion: "Reduced motion",
    credits: "sudo revive_astronaut team · NASA Space Apps Challenge",
  },
  ru: {
    subtitle: "Ваше здоровье. Ваша миссия.",
    description:
      "Персональный мониторинг здоровья для миссий за пределами Земли.",
    enter: "ВОЙТИ В ASTRA",
    musicOn: "Включить музыку",
    musicOff: "Выключить музыку",
    settings: "Экран и доступность",
    login: "Вход астронавта",
    close: "Закрыть",
    theme: "Оформление",
    dark: "Тёмная",
    light: "Светлая",
    vision: "Цветовое зрение",
    standard: "Стандартное",
    protanopia: "Протанопия",
    deuteranopia: "Дейтеранопия",
    tritanopia: "Тританопия",
    largeText: "Крупный текст",
    highContrast: "Высокая контрастность",
    reducedMotion: "Уменьшить анимацию",
    credits: "Команда sudo_revive_astronaut · NASA Space Apps Challenge",
  },
  zh: {
    subtitle: "您的健康，您的使命。",
    description: "为地球以外的长期太空任务提供个人健康监测。",
    enter: "进入 ASTRA",
    musicOn: "播放音乐",
    musicOff: "暂停音乐",
    settings: "显示与无障碍设置",
    login: "宇航员登录",
    close: "关闭",
    theme: "外观",
    dark: "深色",
    light: "浅色",
    vision: "色觉模式",
    standard: "标准",
    protanopia: "红色盲",
    deuteranopia: "绿色盲",
    tritanopia: "蓝黄色盲",
    largeText: "大字体",
    highContrast: "高对比度",
    reducedMotion: "减少动画",
    credits: "sudo_revive_astronaut 团队 · NASA Space Apps Challenge",
  },
};

export default function WelcomeScreen({
  loginContent,
}: WelcomeScreenProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("astra-language") as Language) || "en"
  );

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("astra-theme") as Theme) || "dark"
  );

  const [vision, setVision] = useState<VisionMode>("standard");
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const t = translations[language];

  // Persist language and theme preferences.
  useEffect(() => {
    localStorage.setItem("astra-language", language);
    localStorage.setItem("astra-theme", theme);
  }, [language, theme]);

  // Update document language.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Attempt automatic background music playback.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.35;

    const playMusic = async () => {
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        // Browser blocked autoplay.
        // The user can start playback using the music button.
        setMusicPlaying(false);
      }
    };

    void playMusic();

    return () => {
      audio.pause();
    };
  }, []);

  // Close open panels and modal using Escape.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLoginOpen(false);
        setSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Manual Play/Pause fallback.
  async function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) return;

    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    }
  }

  return (
    <main
      className={[
        "astra-welcome",
        `theme-${theme}`,
        `vision-${vision}`,
        largeText ? "large-text" : "",
        highContrast ? "high-contrast" : "",
        reducedMotion ? "reduced-motion" : "",
      ].join(" ")}
      style={{ backgroundImage: `url(${background})` }}
    >
      <audio
        ref={audioRef}
        src={introMusic}
        loop
        preload="auto"
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
      />

      <div className="astra-overlay" />

      {/* Top navigation */}
      <header className="welcome-toolbar">
        <div className="toolbar-left">
          <label
            className="visually-hidden"
            htmlFor="astra-language"
          >
            Language
          </label>

          <select
            id="astra-language"
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as Language)
            }
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
          </select>

          <button
            className="toolbar-button"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle light and dark mode"
          >
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        <button
          className="toolbar-button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-expanded={settingsOpen}
        >
          ⚙ {t.settings}
        </button>
      </header>

      {/* Accessibility settings */}
      {settingsOpen && (
        <section
          className="accessibility-panel"
          aria-label={t.settings}
        >
          <div className="panel-heading">
            <h2>{t.settings}</h2>

            <button
              onClick={() => setSettingsOpen(false)}
              aria-label={t.close}
            >
              ×
            </button>
          </div>

          <label>
            {t.theme}
            <select
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as Theme)
              }
            >
              <option value="dark">{t.dark}</option>
              <option value="light">{t.light}</option>
            </select>
          </label>

          <label>
            {t.vision}
            <select
              value={vision}
              onChange={(e) =>
                setVision(e.target.value as VisionMode)
              }
            >
              <option value="standard">{t.standard}</option>
              <option value="protanopia">{t.protanopia}</option>
              <option value="deuteranopia">{t.deuteranopia}</option>
              <option value="tritanopia">{t.tritanopia}</option>
            </select>
          </label>

          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={largeText}
              onChange={(e) =>
                setLargeText(e.target.checked)
              }
            />
            {t.largeText}
          </label>

          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) =>
                setHighContrast(e.target.checked)
              }
            />
            {t.highContrast}
          </label>

          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) =>
                setReducedMotion(e.target.checked)
              }
            />
            {t.reducedMotion}
          </label>
        </section>
      )}

      {/* Main welcome content */}
      <section className="welcome-content">
        <img
          className="astra-logo"
          src={logo}
          alt="ASTRA logo"
        />

        <h1>ASTRA</h1>

        <h2>{t.subtitle}</h2>

        <p>{t.description}</p>

        <div className="welcome-status">
          <span className="status-dot" />
          SYSTEMS READY
        </div>

        <button
          className="enter-button"
          onClick={() => setLoginOpen(true)}
        >
          {t.enter} <span aria-hidden="true">→</span>
        </button>

        <button
          className="music-button"
          onClick={toggleMusic}
          aria-pressed={musicPlaying}
          aria-label={musicPlaying ? t.musicOff : t.musicOn}
        >
          {musicPlaying ? "Ⅱ" : "♫"}{" "}
          {musicPlaying ? t.musicOff : t.musicOn}
        </button>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        {t.credits}
      </footer>

      {/* Login modal */}
      {loginOpen && (
        <div
          className="login-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setLoginOpen(false);
            }
          }}
        >
          <section
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="astra-login-title"
          >
            <button
              className="modal-close"
              onClick={() => setLoginOpen(false)}
              aria-label={t.close}
            >
              ×
            </button>

            <h2 id="astra-login-title">{t.login}</h2>

            {loginContent}
          </section>
        </div>
      )}
    </main>
  );
}
