"use client";

import { useMemo, type ButtonHTMLAttributes, type ReactNode } from "react";

import { AVATARS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

const COLORS = {
  pink: "bg-pink",
  lemon: "bg-lemon",
  mint: "bg-mint",
  sky: "bg-sky",
  grape: "bg-grape",
  tomato: "bg-tomato",
  white: "bg-white",
} as const;

export type Color = keyof typeof COLORS;

export function Button({
  color = "lemon",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { color?: Color }) {
  return <button {...props} className={`btn ${COLORS[color]} px-5 py-3 text-lg ${className}`} />;
}

export function Card({ color = "white", className = "", children }: { color?: Color; className?: string; children: ReactNode }) {
  return <div className={`brut ${COLORS[color]} p-5 ${className}`}>{children}</div>;
}

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-2 font-black tracking-tight ${small ? "text-2xl" : "text-5xl sm:text-7xl"}`}>
      <span className={`brut-sm wiggle inline-block bg-sky px-1.5 ${small ? "text-sm" : "text-2xl sm:text-3xl"}`}>EN</span>
      <span>
        Voka<span className="text-pink [-webkit-text-stroke:2px_var(--color-ink)]">battle</span>
      </span>
      <span className={`brut-sm wiggle inline-block bg-lemon px-1.5 [animation-delay:-0.7s] ${small ? "text-sm" : "text-2xl sm:text-3xl"}`}>
        ES
      </span>
    </div>
  );
}

export function AvatarPicker({ value, onChange }: { value: string; onChange: (a: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onChange(a)}
          className={`brut-sm aspect-square text-2xl sm:text-3xl transition-transform ${
            value === a ? "bg-lemon scale-110 -rotate-6" : "bg-white hover:-rotate-3"
          }`}
          aria-label={`Avatar ${a}`}
        >
          {a}
        </button>
      ))}
    </div>
  );
}

export const DEFAULT_AVATAR = AVATARS[0];

/** Deterministic pseudo-random in [0, 1) – keeps render pure. */
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(i, 1) * 100,
        delay: rand(i, 2) * 1.2,
        dur: 2.4 + rand(i, 3) * 2,
        drift: (rand(i, 4) - 0.5) * 200,
        spin: (rand(i, 5) - 0.5) * 1440,
        char: ["🎉", "✨", "⭐", "🌮", "🎊", "💥", "🟨", "🟪", "🟩"][i % 9],
        size: 16 + rand(i, 6) * 18,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              fontSize: p.size,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

export function Chilis({ level }: { level: number }) {
  const { t } = useI18n();
  return (
    <span aria-label={t("difficulty", { n: level })}>
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} className={i < level ? "" : "opacity-20 grayscale"}>
          🌶️
        </span>
      ))}
    </span>
  );
}

export const FLAG = { en: "EN", es: "ES" } as const;
