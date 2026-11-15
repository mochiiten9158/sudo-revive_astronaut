
import { useEffect, useRef, useState, type ReactNode } from "react";

import logo from "../assets/logo.png";
import background from "../assets/background.jpg";
import introMusic from "../assets/ObservingTheStar.ogg";

import { usePreferences } from "../context/PreferencesContext";

import "./WelcomeScreen.css";

interface WelcomeScreenProps {
  loginContent: ReactNode;
}

export default function WelcomeScreen({
  loginContent,
}: WelcomeScreenProps) {
  const {
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
  } = usePreferences();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Background music
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
        setMusicPlaying(false);
      }
    };

    void playMusic();

    return () => {
      audio.pause();
    };
  }, []);

  // Escape key closes panels
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
        textSize !== "standard" ? "large-text" : "",
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
            {t("common.language")}
          </label>

          <select
            id="astra-language"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as "en" | "ru" | "zh")
            }
            aria-label={t("common.language")}
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <button
          className="toolbar-button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-expanded={settingsOpen}
          aria-controls="astra-accessibility-panel"
        >
          ⚙ {t("accessibility.title")}
        </button>
      </header>

      {/* Global accessibility settings */}
      {settingsOpen && (
        <section
          id="astra-accessibility-panel"
          className="accessibility-panel"
          aria-label={t("accessibility.title")}
        >
          <div className="panel-heading">
            <h2>{t("accessibility.title")}</h2>

            <button
              onClick={() => setSettingsOpen(false)}
              aria-label={t("accessibility.close")}
            >
              ×
            </button>
          </div>

          <label>
            {t("accessibility.appearance")}

            <select
              value={theme}
              onChange={(event) =>
                setTheme(event.target.value as "dark" | "light")
              }
            >
              <option value="dark">{t("accessibility.dark")}</option>
              <option value="light">{t("accessibility.light")}</option>
            </select>
          </label>

          <label>
            {t("accessibility.textSize")}

            <select
              value={textSize}
              onChange={(event) =>
                setTextSize(
                  event.target.value as
                    | "standard"
                    | "large"
                    | "extra-large"
                )
              }
            >
              <option value="standard">
                {t("accessibility.standard")}
              </option>
              <option value="large">
                {t("accessibility.large")}
              </option>
              <option value="extra-large">
                {t("accessibility.extraLarge")}
              </option>
            </select>
          </label>

          <label>
            {t("accessibility.colorVision")}

            <select
              value={vision}
              onChange={(event) =>
                setVision(
                  event.target.value as
                    | "standard"
                    | "protanopia"
                    | "deuteranopia"
                    | "tritanopia"
                )
              }
            >
              <option value="standard">
                {t("accessibility.standardVision")}
              </option>
              <option value="protanopia">
                {t("accessibility.protanopia")}
              </option>
              <option value="deuteranopia">
                {t("accessibility.deuteranopia")}
              </option>
              <option value="tritanopia">
                {t("accessibility.tritanopia")}
              </option>
            </select>
          </label>

          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) =>
                setHighContrast(event.target.checked)
              }
            />
            {t("accessibility.highContrast")}
          </label>

          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) =>
                setReducedMotion(event.target.checked)
              }
            />
            {t("accessibility.reducedMotion")}
          </label>

          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={enhancedFocus}
              onChange={(event) =>
                setEnhancedFocus(event.target.checked)
              }
            />
            {t("accessibility.keyboardFocus")}
          </label>
        </section>
      )}

      {/* Welcome content */}
      <section className="welcome-content">
        <img
          className="astra-logo"
          src={logo}
          alt="ASTRA logo"
        />

        <h1>ASTRA</h1>

        <h2>{t("welcome.subtitle")}</h2>

        <p>{t("welcome.description")}</p>

        <div className="welcome-status">
          <span className="status-dot" />
          {t("welcome.systemReady")}
        </div>

        <button
          className="enter-button"
          onClick={() => setLoginOpen(true)}
        >
          {t("welcome.enter")} <span aria-hidden="true">→</span>
        </button>

        <button
          className="music-button"
          onClick={toggleMusic}
          aria-pressed={musicPlaying}
          aria-label={
            musicPlaying
              ? t("welcome.musicOff")
              : t("welcome.musicOn")
          }
        >
          {musicPlaying ? "Ⅱ" : "♫"}{" "}
          {musicPlaying
            ? t("welcome.musicOff")
            : t("welcome.musicOn")}
        </button>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        {t("welcome.credits")}
      </footer>

      {/* Login modal */}
      {loginOpen && (
        <div
          className="login-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
              aria-label={t("accessibility.close")}
            >
              ×
            </button>

            <h2 id="astra-login-title">
              {t("auth.login")}
            </h2>

            {loginContent}
          </section>
        </div>
      )}
    </main>
  );
}