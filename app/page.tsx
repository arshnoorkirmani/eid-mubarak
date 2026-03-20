"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as htmlToImage from "html-to-image";

type Mode = "professional" | "friendly" | "family";
type Screen = "loader" | "wish" | "custom" | "result";

const QUOTES = [
  { text: "Taqabbal Allahu minna wa minkum — May Allah accept from us and from you.", author: "— Traditional Eid Du'a" },
  { text: "Eid is a time to refresh our souls, strengthen our bonds, and renew our gratitude to Allah.", author: "— Eid Reflection" },
  { text: "May this blessed occasion bring peace, joy, and countless blessings to you and your loved ones.", author: "— Eid Wishes" },
  { text: "On this sacred day, may your heart be filled with love, your home with laughter, and your life with barakah.", author: "— Eid Mubarak" },
  { text: "After a month of fasting, reflection, and prayer — may your Eid be a celebration of your devotion.", author: "— Eid ul-Fitr" },
];

const MSGS: Record<Mode, (n: string) => string> = {
  professional: () =>
    `Wishing you and your family a blessed and joyous Eid al-Fitr.\nMay this auspicious occasion bring peace, prosperity, and happiness to your life.\n\n🌙 Eid Mubarak!`,
  friendly: () =>
    `May Allah's choicest blessings be with you and your loved ones today and always!\nWishing you a day full of joy, love, and beautiful memories. 💛\n\n🎉 Eid Mubarak!`,
  family: (n) =>
    `Pyare ${n || "aap"},\n\nAllah aapki tamam duaen qabool kare aur aapki zindagi mein khushiyon ki barsaat ho.\nIs Eid mein dil ki har tammana poori ho. Ameen!\n\n🌙 Eid Mubarak! ❤`,
};

const BADGES: Record<Mode, string> = {
  professional: "🏢 Professional Greetings",
  friendly: "🌸 With Love & Warmth",
  family: "🏠 From Our Family",
};

const THEMES = [
  "linear-gradient(155deg,#0c3035 0%,#0f3e42 45%,#07252a 100%)",
  "linear-gradient(155deg,#1a0a2e 0%,#2d1454 45%,#12062a 100%)",
  "linear-gradient(155deg,#1a0a00 0%,#3b1800 45%,#120600 100%)",
  "linear-gradient(155deg,#001a0d 0%,#003a1a 45%,#001208 100%)",
  "linear-gradient(155deg,#0a0a1a 0%,#1a1a35 45%,#050512 100%)",
];

const FONT_OPTIONS = [
  { label: "Nunito (modern)", value: "var(--font-nunito)" },
  { label: "Amiri (calligraphy)", value: "var(--font-amiri)" },
  { label: "Cinzel Decorative", value: "var(--font-cinzel)" },
];

type Star = {
  id: string;
  style: React.CSSProperties;
};

type LanternData = {
  id: string;
  left: number;
  ft: number;
  delay: number;
  dx: number;
  dx2: number;
  color: string;
};

type Confetti = {
  id: string;
  style: React.CSSProperties;
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function Home() {
  const hijriYear = new Date().getFullYear() - 579;
  const router = useRouter();

  const getModeFromParam = (value: string | null): Mode => {
    if (value === "friendly" || value === "family" || value === "professional") return value;
    return "professional";
  };

  const getThemeFromParam = (value: string | null) => {
    const idx = Number(value);
    return Number.isFinite(idx) && idx >= 0 && idx < THEMES.length ? idx : 0;
  };

  const getInitialState = <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(key);
    return (value ?? "") ? (value as unknown as T) : fallback;
  };

  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window === "undefined") return "loader";
    const params = new URLSearchParams(window.location.search);
    return params.get("screen") === "result" ? "result" : "loader";
  });
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [mode, setMode] = useState<Mode>(() => getModeFromParam(getInitialState("mode", "professional")));
  const [themeIdx, setThemeIdx] = useState(() => getThemeFromParam(getInitialState("theme", "0")));
  const [recipient, setRecipient] = useState(() => getInitialState("to", ""));
  const [sender, setSender] = useState(() => getInitialState("from", ""));
  const [customMessage, setCustomMessage] = useState(() => getInitialState("msg", ""));
  const [fontFamily, setFontFamily] = useState("var(--font-nunito)");
  const [toast, setToast] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  const showToast = useCallback(
    (message: string) => {
      if (isMobile !== false) return;
      setToast(message);
    },
    [isMobile],
  );


  const [stars, setStars] = useState<Star[]>([]);
  const [lanterns, setLanterns] = useState<LanternData[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 130 }).map((_, i) => {
        const size = randomBetween(0.4, 2.8);
        return {
          id: `star-${i}`,
          style: {
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '--d': `${randomBetween(2, 6)}s`,
            '--dl': `${Math.random() * 6}s`,
            '--b': `${randomBetween(0.4, 1)}`,
          } as React.CSSProperties,
        };
      }),
    );

    const colors = ["#D4AF37", "#E05C5C", "#5BB8E0", "#7ED37E", "#E0975C", "#C97CE0"];
    setLanterns(
      [6, 22, 38, 54, 70, 87].map((left, i) => ({
        id: `lantern-${i}`,
        left,
        ft: 13 + i * 2.5,
        delay: i * 2.2,
        dx: (Math.random() - 0.5) * 55,
        dx2: (Math.random() - 0.5) * 55,
        color: colors[i % colors.length],
      })),
    );
  }, []);

  useEffect(() => {
    if (screen !== "loader") return;

    const delay = isMobile ? 600 : 3300;
    const timer = window.setTimeout(() => setScreen("wish"), delay);
    return () => window.clearTimeout(timer);
  }, [screen, isMobile]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (screen !== "wish" || toast || isMobile !== false) return;
    const quote = QUOTES[quoteIdx]?.text;
    if (!quote) return;
    showToast(quote);
  }, [quoteIdx, screen, toast, isMobile, showToast]);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font", fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  const screenVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const launchConfetti = useCallback(() => {
    const colors = ["#D4AF37", "#F2D675", "#2A8A92", "#E85D5D", "#5DB8E8", "#FFFFFF", "#A07820"];

    const newPieces: Confetti[] = Array.from({ length: 80 }).map((_, i) => {
      const circle = Math.random() > 0.5;
      return {
        id: `confetti-${Date.now()}-${i}`,
        style: {
          left: `${Math.random() * 100}%`,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: circle ? "50%" : "3px",
          width: `${randomBetween(5, 14)}px`,
          height: `${randomBetween(5, 14)}px`,
          '--cd': `${randomBetween(2.5, 5.5)}s`,
          '--cdl': `${Math.random() * 0.4}s`,
        } as React.CSSProperties,
      };
    });

    setConfetti(newPieces);
    const timer = window.setTimeout(() => setConfetti([]), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (screen === "wish" || screen === "result") {
      return launchConfetti();
    }

    return undefined;
  }, [screen, launchConfetti]);

  function buildText(forResult: boolean) {
    if (forResult) {
      const greeting = recipient ? `Dear ${recipient},\n\n` : "";
      const msg = customMessage.trim() || MSGS[mode](recipient);
      return `عيد مبارك 🌙\nEid Mubarak!\n\n${greeting}${msg}`;
    }

    return `عيد مبارك 🌙\nEid Mubarak!\n\nWishing you and your family a blessed and joyous Eid al-Fitr.\nMay this occasion bring peace, prosperity, and happiness to your life.\n\n${QUOTES[quoteIdx].text}`;
  }

  function normalizeText(text: string) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }

  function buildShareText(forResult: boolean) {
    const quoteText = QUOTES[quoteIdx]?.text;
    const quoteAuthor = QUOTES[quoteIdx]?.author;
    const message = buildText(forResult);
    const link = buildShareUrl(forResult ? "result" : "wish");

    const lines = [
      "🌙 *Eid Mubarak!*",
      quoteText ? `“${quoteText}”` : null,
      quoteAuthor || null,
      message,
      "May Allah accept our prayers and bless you with peace, joy, and togetherness.",
      `Share this card: ${link}`,
    ].filter(Boolean) as string[];

    return normalizeText(lines.join("\n\n"));
  }

  async function copyCard() {
    const text = buildShareText(true);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard not supported");
      }
      showToast("✨ Message copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("✨ Message copied!");
    }
  }

  function shareWA(forResult: boolean) {
    const text = buildShareText(forResult);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  const buildShareUrl = useCallback(
    (forScreen: Screen) => {
      if (typeof window === "undefined") return "";

      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const params = new URLSearchParams();
      params.set("screen", forScreen);
      params.set("mode", mode);
      params.set("theme", String(themeIdx));
      if (recipient.trim()) params.set("to", recipient.trim());
      if (sender.trim()) params.set("from", sender.trim());
      if (customMessage.trim()) params.set("msg", customMessage.trim());

      return `${origin}${pathname}?${params.toString()}`;
    },
    [mode, themeIdx, recipient, sender, customMessage],
  );

  const resultShareUrl = useMemo(() => buildShareUrl("result"), [buildShareUrl]);

  const copyLink = useCallback(() => {
    const url = resultShareUrl;
    if (!url) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast("🔗 Link copied!"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("🔗 Link copied!");
    }
  }, [resultShareUrl, showToast]);

  const updateShareLink = useCallback(
    (forScreen: Screen) => {
      const url = buildShareUrl(forScreen);
      if (!url) return;
      router.replace(url);
    },
    [buildShareUrl, router],
  );

  function copyShareLink() {
    const url = buildShareUrl("result");
    if (!url) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast("🔗 Link copied!"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("🔗 Link copied!");
    }
  }

  useEffect(() => {
    if (screen !== "result") return;
    updateShareLink("result");
  }, [screen, mode, themeIdx, recipient, sender, customMessage, updateShareLink]);

  function handleGenerate() {
    setScreen("result");
  }

  const downloadCard = async (elementId: string) => {
    const cardElement = document.getElementById(elementId);
    if (!cardElement) return;
    
    // Temporarily remove border radius for download to avoid corner artifacts
    const originalRadius = cardElement.style.borderRadius;
    cardElement.style.borderRadius = "0px";

    try {
      const dataUrl = await htmlToImage.toPng(cardElement, {
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      link.download = `Eid-Mubarak-Card-${recipient || "Wish"}.png`;
      link.href = dataUrl;
      link.click();
      showToast("✨ Card downloaded!");
    } catch (err) {
      showToast("❌ Failed to download");
    } finally {
      cardElement.style.borderRadius = originalRadius;
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden overflow-y-auto scroll-smooth">
      <div id="sky" />

      {stars.map((star) => (
        <div key={star.id} className="star" style={star.style} />
      ))}

      {lanterns.map((lantern) => (
        <div
          key={lantern.id}
          className="lantern"
          style={
            {
              left: `${lantern.left}%`,
              "--ft": `${lantern.ft}s`,
              "--fd": `${lantern.delay}s`,
              "--dx": `${lantern.dx}px`,
              "--dx2": `${lantern.dx2}px`,
            } as React.CSSProperties
          }
        >
          <svg width="22" height="34" viewBox="0 0 22 34" style={{ filter: `drop-shadow(0 0 7px ${lantern.color})` }}>
            <rect x="8" y="0" width="6" height="5" rx="2" fill={lantern.color} opacity=".88" />
            <ellipse cx="11" cy="19" rx="9" ry="13" fill={lantern.color} opacity=".7" />
            <ellipse cx="11" cy="12" rx="6" ry="4.5" fill={lantern.color} opacity=".4" />
            <ellipse cx="11" cy="19" rx="4.5" ry="8.5" fill="rgba(255,255,220,.25)" />
            <rect x="9" y="30" width="4" height="4" rx="1" fill={lantern.color} opacity=".55" />
          </svg>
        </div>
      ))}

      {confetti.map((c) => (
        <div key={c.id} className="cp" style={c.style} />
      ))}

      <div id="loader" className={screen !== "loader" ? "hidden" : ""}>
        <div className="loader-horizon" />
        <div className="loader-moon-wrap" style={{ position: "relative" }}>
          <div className="loader-moon" />
          <span className="loader-star" style={{ "--tx": "-60px", "--ty": "-50px", "--sd": ".8s", "--ss": "1.1s", "--sf": "18px", left: "50%", top: "50%" } as React.CSSProperties}>
            ✦
          </span>
          <span className="loader-star" style={{ "--tx": "65px", "--ty": "-45px", "--sd": "1s", "--ss": "1.2s", "--sf": "14px", left: "50%", top: "50%" } as React.CSSProperties}>
            ★
          </span>
          <span className="loader-star" style={{ "--tx": "-75px", "--ty": "10px", "--sd": "1.2s", "--ss": "1s", "--sf": "12px", left: "50%", top: "50%" } as React.CSSProperties}>
            ✧
          </span>
          <span className="loader-star" style={{ "--tx": "70px", "--ty": "20px", "--sd": ".9s", "--ss": "1.3s", "--sf": "10px", left: "50%", top: "50%" } as React.CSSProperties}>
            ✦
          </span>
          <span className="loader-star" style={{ "--tx": "-20px", "--ty": "-70px", "--sd": "1.1s", "--ss": "1.1s", "--sf": "16px", left: "50%", top: "50%" } as React.CSSProperties}>
            ☽
          </span>
          <span className="loader-star" style={{ "--tx": "30px", "--ty": "-72px", "--sd": "1.3s", "--ss": ".9s", "--sf": "11px", left: "50%", top: "50%" } as React.CSSProperties}>
            ✩
          </span>
        </div>

        <div className="loader-arabic">عيد مبارك</div>
        <div className="loader-eng">Eid Mubarak</div>

        <div className="loader-dots">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>

        <div className="loader-progress" />
      </div>

      <div id="app">
        <AnimatePresence mode="wait">
          {screen === "wish" && (
            <motion.div
              key="wish"
              className="screen"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={screenVariants}
            >
          <div className="wish-moon-area">
            <div className="wish-moon" />
            <div className="wish-stars">
              <span style={{ "--d": "2s", "--dl": "0s" } as React.CSSProperties}>✦</span>
              <span style={{ "--d": "3s", "--dl": ".5s" } as React.CSSProperties}>★</span>
              <span style={{ "--d": "2.5s", "--dl": "1s" } as React.CSSProperties}>✧</span>
              <span style={{ "--d": "3.5s", "--dl": ".3s" } as React.CSSProperties}>☽</span>
              <span style={{ "--d": "2.2s", "--dl": ".8s" } as React.CSSProperties}>✩</span>
              <span style={{ "--d": "4s", "--dl": ".1s" } as React.CSSProperties}>✦</span>
              <span style={{ "--d": "2.8s", "--dl": ".6s" } as React.CSSProperties}>★</span>
            </div>
            <div className="wish-arabic">عيد مبارك</div>
            <div className="wish-title">Eid Mubarak</div>
            <div className="wish-sub">{hijriYear} ه &nbsp;•&nbsp; Eid ul-Fitr</div>
          </div>

          <div className="gold-div" />

          <div className="wish-card" id="wishCard">
            <svg className="corner tl" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <path d="M4,48 Q22,4 66,4" stroke="#D4AF37" strokeWidth=".7" fill="none" opacity=".5" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
              <path d="M16,52 L16,34 L34,34" stroke="#D4AF37" strokeWidth=".7" fill="none" opacity=".4" />
            </svg>
            <svg className="corner tr" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
            </svg>
            <svg className="corner bl" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
            </svg>
            <svg className="corner br" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
            </svg>

            <span className="c-star" style={{ top: "12%", left: "7%", "--cs": "7s", "--csd": "0s" } as React.CSSProperties}>
              ✦
            </span>
            <span className="c-star" style={{ top: "10%", right: "8%", "--cs": "9s", "--csd": "1.5s" } as React.CSSProperties}>
              ✧
            </span>
            <span className="c-star" style={{ bottom: "12%", left: "9%", "--cs": "8s", "--csd": "2.5s" } as React.CSSProperties}>
              ★
            </span>
            <span className="c-star" style={{ bottom: "10%", right: "7%", "--cs": "6.5s", "--csd": ".8s" } as React.CSSProperties}>
              ✩
            </span>
            <span className="c-star" style={{ top: "50%", left: "3%", "--cs": "10s", "--csd": "1s" } as React.CSSProperties}>
              ☽
            </span>

            <div className="pulse" style={{ width: 200, height: 200, top: "50%", left: "50%", margin: "-100px 0 0 -100px", "--pd": "0s" } as React.CSSProperties} />
            <div className="pulse" style={{ width: 200, height: 200, top: "50%", left: "50%", margin: "-100px 0 0 -100px", "--pd": "1.5s" } as React.CSSProperties} />

            <div className="card-lanterns">
              <svg className="c-lantern" width="32" height="52" viewBox="0 0 32 52">
                <line x1="16" y1="0" x2="16" y2="6" stroke="#D4AF37" strokeWidth="1.3" />
                <rect x="5" y="6" width="22" height="4" rx="2" fill="#D4AF37" />
                <path d="M7,10 Q2,24 6,40 L26,40 Q30,24 25,10 Z" fill="#D4AF37" opacity=".1" />
                <path d="M7,10 Q2,24 6,40 L26,40 Q30,24 25,10 Z" stroke="#D4AF37" strokeWidth="1.2" fill="none" />
                <line x1="12" y1="10" x2="10" y2="40" stroke="#D4AF37" strokeWidth=".65" opacity=".45" />
                <line x1="16" y1="10" x2="16" y2="40" stroke="#D4AF37" strokeWidth=".65" opacity=".45" />
                <line x1="20" y1="10" x2="22" y2="40" stroke="#D4AF37" strokeWidth=".65" opacity=".45" />
                <rect x="5" y="38" width="22" height="4" rx="2" fill="#D4AF37" />
                <circle cx="16" cy="25" r="5" fill="#F2D675" opacity=".82" />
                <line x1="11" y1="42" x2="10" y2="49" stroke="#D4AF37" strokeWidth="1" />
                <line x1="20" y1="42" x2="21" y2="49" stroke="#D4AF37" strokeWidth="1" />
              </svg>
              <svg className="c-lantern" width="40" height="64" viewBox="0 0 40 64" style={{ animationDelay: "-.8s" }}>
                <line x1="20" y1="0" x2="20" y2="8" stroke="#F2D675" strokeWidth="1.5" />
                <rect x="7" y="8" width="26" height="5" rx="2.5" fill="#F2D675" />
                <path d="M10,13 Q4,30 8,50 L32,50 Q36,30 30,13 Z" fill="#F2D675" opacity=".12" />
                <path d="M10,13 Q4,30 8,50 L32,50 Q36,30 30,13 Z" stroke="#F2D675" strokeWidth="1.4" fill="none" />
                <line x1="15" y1="13" x2="12" y2="50" stroke="#F2D675" strokeWidth=".65" opacity=".4" />
                <line x1="20" y1="13" x2="20" y2="50" stroke="#F2D675" strokeWidth=".65" opacity=".4" />
                <line x1="25" y1="13" x2="28" y2="50" stroke="#F2D675" strokeWidth=".65" opacity=".4" />
                <rect x="7" y="48" width="26" height="5" rx="2.5" fill="#F2D675" />
                <circle cx="20" cy="31" r="7" fill="#FFF9D6" opacity=".88" />
                <circle cx="20" cy="31" r="3" fill="white" opacity=".38" />
                <line x1="14" y1="53" x2="13" y2="61" stroke="#F2D675" strokeWidth="1.1" />
                <line x1="26" y1="53" x2="27" y2="61" stroke="#F2D675" strokeWidth="1.1" />
              </svg>
              <svg className="c-lantern" width="32" height="52" viewBox="0 0 32 52" style={{ animationDelay: "-1.6s" }}>
                <line x1="16" y1="0" x2="16" y2="6" stroke="#D4AF37" strokeWidth="1.3" />
                <rect x="5" y="6" width="22" height="4" rx="2" fill="#D4AF37" />
                <path d="M7,10 Q2,24 6,40 L26,40 Q30,24 25,10 Z" fill="#1A5C62" opacity=".25" />
                <path d="M7,10 Q2,24 6,40 L26,40 Q30,24 25,10 Z" stroke="#D4AF37" strokeWidth="1.2" fill="none" />
                <line x1="12" y1="10" x2="10" y2="40" stroke="#D4AF37" strokeWidth=".65" opacity=".45" />
                <line x1="16" y1="10" x2="16" y2="40" stroke="#D4AF37" strokeWidth=".65" opacity=".45" />
                <line x1="20" y1="10" x2="22" y2="40" stroke="#D4AF37" strokeWidth=".65" opacity=".45" />
                <rect x="5" y="38" width="22" height="4" rx="2" fill="#D4AF37" />
                <circle cx="16" cy="25" r="5" fill="#2A8A92" opacity=".82" />
                <line x1="11" y1="42" x2="10" y2="49" stroke="#D4AF37" strokeWidth="1" />
                <line x1="20" y1="42" x2="21" y2="49" stroke="#D4AF37" strokeWidth="1" />
              </svg>
            </div>

            <div className="wish-card-arabic">عيد مبارك</div>
            <div className="wish-card-title">Eid Mubarak</div>
            <div className="wish-card-sub">May Allah accept our prayers</div>
            <div className="wish-card-divider" />

            <div className="wish-badge">
              <span>🌙</span> Eid ul-Fitr {hijriYear} ه
            </div>

            <div className="wish-card-msg">
              Wishing you and your family a blessed
              and joyous Eid al-Fitr. May this auspicious
              occasion bring peace, prosperity, and
              happiness into your life. 💛
            </div>
          </div>

          <button className="btn-create-custom" onClick={() => setScreen("custom")}> 
            <div className="btn-icon-wrap">✏</div>
            Create Your Personalized Eid Card
            <span style={{ fontSize: 18 }}>→</span>
          </button>

          <button className="btn-share-quick" onClick={() => shareWA(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </button>

          <button className="btn-share-quick" onClick={() => downloadCard("wishCard")} style={{ marginTop: "12px", background: "rgba(255, 255, 255, 0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Card Image
          </button>

          <div className="share-note">
            <div>✨ Share this link and send the same Eid card to friends & family:</div>
            <a href={resultShareUrl} target="_blank" className="share-note-link">{resultShareUrl || "Generating your share link..."}</a>
            <button className="btn btn-copy" onClick={copyLink} disabled={!resultShareUrl}>
              Copy Link
            </button>
          </div>
        </motion.div>
      )}

      {screen === "custom" && (
        <motion.div
          key="custom"
          className="screen"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={screenVariants}
        >
          <button className="back-btn" onClick={() => { setScreen("wish"); updateShareLink("wish"); }}>← Back to Eid Page</button>
          <div className="custom-title">✨ Create Your Card</div>
          <div className="custom-subtitle">Personalize • Choose Style • Share</div>

          <div className="creator-card">
            <label className="lbl">👤 Recipient Name</label>
            <input
              className="inp"
              id="recName"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Ahmad, Team, Sir Kashif, Family..."
              maxLength={45}
            />

            <label className="lbl">✍️ From (Your Name)</label>
            <input
              className="inp"
              id="senderName"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. Ali, The Kirmani Family..."
              maxLength={45}
            />

            <div className="mode-label">📋 Message Style</div>
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === "professional" ? "on" : ""}`} onClick={() => setMode("professional")}>🏢 Professional</button>
              <button className={`mode-btn ${mode === "friendly" ? "on" : ""}`} onClick={() => setMode("friendly")}>🌸 Friendly</button>
              <button className={`mode-btn ${mode === "family" ? "on" : ""}`} onClick={() => setMode("family")}>🏠 Family</button>
            </div>

            <label className="lbl">
              💬 Custom Message <span style={{ opacity: 0.4, fontSize: ".7rem", textTransform: "lowercase", letterSpacing: "1px" }}>(optional)</span>
            </label>
            <textarea
              className="inp"
              id="customMsg"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your own heartfelt message... (leave blank for auto)"
            />

            <div className="mode-label" style={{ marginBottom: 12 }}>
              🎨 Card Theme
            </div>
            <div className="theme-picker" id="themePicker">
              {THEMES.map((theme, idx) => (
                <div
                  key={idx}
                  className={`theme-swatch ${themeIdx === idx ? "sel" : ""}`}
                  data-theme={idx}
                  title={["Deep Teal", "Royal Purple", "Deep Maroon", "Forest Green", "Midnight Blue"][idx]}
                  style={{ background: theme }}
                  onClick={() => setThemeIdx(idx)}
                />
              ))}
            </div>

            <div className="mode-label" style={{ marginBottom: 12 }}>
              🖋️ Font Family
            </div>
            <select
              className="inp"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-gen" onClick={handleGenerate}>
            🌙 &nbsp; Generate My Eid Card &nbsp; ✨
          </button>
        </motion.div>
      )}

      {screen === "result" && (
        <motion.div
          key="result"
          className="screen"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={screenVariants}
        >
          <button className="back-btn" onClick={() => { setScreen("custom"); updateShareLink("custom"); }}>← Edit Card</button>

          <div className="result-card" id="resultCard" style={{ background: THEMES[themeIdx] }}>
            <svg className="corner tl" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <path d="M4,48 Q22,4 66,4" stroke="#D4AF37" strokeWidth=".7" fill="none" opacity=".5" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
              <path d="M16,52 L16,34 L34,34" stroke="#D4AF37" strokeWidth=".7" fill="none" opacity=".4" />
            </svg>
            <svg className="corner tr" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
            </svg>
            <svg className="corner bl" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
            </svg>
            <svg className="corner br" viewBox="0 0 70 70" fill="none">
              <path d="M4,66 Q4,4 66,4" stroke="#D4AF37" strokeWidth="1.4" fill="none" />
              <circle cx="4" cy="66" r="3" fill="#D4AF37" />
              <circle cx="66" cy="4" r="3" fill="#D4AF37" />
            </svg>

            <span className="c-star" style={{ top: "11%", left: "6%", "--cs": "7s", "--csd": "0s" } as React.CSSProperties}>
              ✦
            </span>
            <span className="c-star" style={{ top: "9%", right: "7%", "--cs": "9s", "--csd": "1.5s" } as React.CSSProperties}>
              ✧
            </span>
            <span className="c-star" style={{ bottom: "11%", left: "8%", "--cs": "8s", "--csd": "2.5s" } as React.CSSProperties}>
              ★
            </span>
            <span className="c-star" style={{ bottom: "9%", right: "6%", "--cs": "6.5s", "--csd": ".8s" } as React.CSSProperties}>
              ✩
            </span>

            <div className="pulse" style={{ width: 180, height: 180, top: "50%", left: "50%", margin: "-90px 0 0 -90px", "--pd": "0s" } as React.CSSProperties} />
            <div className="pulse" style={{ width: 180, height: 180, top: "50%", left: "50%", margin: "-90px 0 0 -90px", "--pd": "1.8s" } as React.CSSProperties} />

            <div className="result-arabic">عيد مبارك</div>
            <div className="result-title">Eid Mubarak</div>
            <div className="result-sub">Eid ul-Fitr {hijriYear} ه</div>
            <div className="result-divider" />
            <div className="result-badge">{BADGES[mode]}</div>
            <div className="result-to">
              {recipient ? (
                <>
                  To Dear <span>{recipient}</span>
                </>
              ) : (
                "To All Our Beloved Ones"
              )}
            </div>
            <div className="result-msg">{customMessage.trim() || MSGS[mode](recipient)}</div>
            {sender.trim() && (
              <div className="result-footer">From: {sender.trim()}</div>
            )}
          </div>

          <div className="action-grid">
            <button className="btn btn-wa" onClick={() => shareWA(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button className="btn btn-dl" onClick={() => downloadCard("resultCard")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Image
            </button>
            <button className="btn btn-copy" onClick={copyCard}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy Message
            </button>
            <button className="btn btn-copy" onClick={copyShareLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1 0 7.07 5 5 0 0 1-7.07 0l-1.41-1.41" />
                <path d="M14 11a5 5 0 0 1-7.07 0L5.52 9.59a5 5 0 0 1 0-7.07 5 5 0 0 1 7.07 0L14 4" />
              </svg>
              Copy Share Link
            </button>
          </div>

          <button className="btn-back2" onClick={() => { setScreen("wish"); updateShareLink("wish"); }}>🏠 &nbsp; Back to Main Eid Page</button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  <div className="footer">Create Your Personalized Eid Card • Developed by Arshnoor Kirmani</div>

  {!isMobile && <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>}
</div>
  );
}
