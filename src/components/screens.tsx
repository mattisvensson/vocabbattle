"use client";

import { useEffect, useRef, useState } from "react";
import type { Direction, Settings } from "@/lib/game";
import { ROUND_MS, TAUNTS, type TauntId } from "@/lib/constants";
import { useI18n, type T } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/vocab";
import type { Ctx } from "./Room";
import { Button, Card, Chilis, Confetti, FLAG } from "./ui";

function useNow(serverNow: () => number, active = true) {
  const [t, setT] = useState(serverNow);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setT(serverNow()), 100);
    return () => clearInterval(id);
  }, [serverNow, active]);
  return t;
}

function names(view: Ctx["view"]) {
  const me = view.players.find((p) => p.id === view.meId)!;
  const other = view.players.find((p) => p.id !== view.meId);
  return { me, other };
}

function directionLabel(t: T, d: Direction) {
  if (d === "en-es") return "EN → ES";
  if (d === "es-en") return "ES → EN";
  return t("mix");
}

// ---------------------------------------------------------------- Lobby

function Segmented<V extends string | number>({
  label,
  hint,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-extrabold uppercase tracking-wider">{label}</div>
      {hint && <p className="-mt-1 mb-2 text-sm font-semibold opacity-60">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`brut-sm px-3 py-1.5 font-bold transition-transform ${
              value === o.value ? "bg-lemon -rotate-2" : "bg-white enabled:hover:-translate-y-0.5"
            } disabled:cursor-default`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Lobby({ view, send }: Ctx) {
  const { t } = useI18n();
  const { me } = names(view);
  const isHost = view.meId === view.hostId;
  const full = view.players.length === 2;
  const [copied, setCopied] = useState(false);
  const set = (s: Partial<Settings>) => send({ type: "settings", settings: s });

  return (
    <div className="flex flex-col gap-5">
      <Card color="lemon" className="pop-in text-center">
        <div className="text-sm font-extrabold uppercase tracking-widest">{t("roomCode")}</div>
        <div className="my-1 font-mono text-6xl font-black tracking-[0.3em] sm:text-7xl">{view.code}</div>
        <Button
          color="white"
          className="text-base"
          onClick={async () => {
            await navigator.clipboard.writeText(`${location.origin}/room/${view.code}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? t("copied") : t("copyInvite")}
        </Button>
      </Card>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {[0, 1].map((i) => {
          const p = view.players[i];
          return (
            <div key={i} className={`brut flex flex-col items-center p-4 ${i === 1 ? "order-3" : ""} ${p ? "bg-white pop-in" : "bg-white/50 border-dashed"}`}>
              <span className={`text-6xl ${p ? "bob" : "opacity-30"}`} style={{ animationDelay: `${i * -1}s` }}>
                {p?.avatar ?? "❔"}
              </span>
              <span className="mt-2 truncate text-lg font-black">{p?.name ?? t("waiting")}</span>
              {p && <span className="brut-sm mt-1 bg-cream px-2 text-sm font-bold">{directionLabel(t, p.direction)}</span>}
              {p?.id === view.hostId && <span className="mt-1 text-xs font-bold uppercase opacity-60">{t("host")}</span>}
            </div>
          );
        })}
        <span className="order-2 text-4xl font-black wiggle">VS</span>
      </div>

      <Card color="sky">
        <Segmented
          label={t("myDirection")}
          hint={t("myDirectionHint")}
          value={me.direction}
          disabled={false}
          onChange={(direction) => send({ type: "direction", direction })}
          options={(["en-es", "es-en", "mix"] as const).map((d) => ({ value: d, label: directionLabel(t, d) }))}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-black">
          {t("rules")} {!isHost && <span className="text-sm font-bold opacity-60">{t("hostDecides")}</span>}
        </h2>
        <Segmented
          label={t("category")}
          value={view.settings.category}
          disabled={!isHost}
          onChange={(category) => set({ category })}
          options={[{ value: "all", label: t("all") }, ...CATEGORIES.map((c) => ({ value: c.id, label: `${c.emoji} ${t(`cat_${c.id}`)}` }))]}
        />
        <Segmented
          label={t("answers")}
          value={view.settings.mode}
          disabled={!isHost}
          onChange={(mode) => set({ mode })}
          options={[
            { value: "type", label: t("modeType") },
            { value: "choice", label: t("modeChoice") },
          ]}
        />
        <Segmented
          label={t("playTo")}
          value={view.settings.target}
          disabled={!isHost}
          onChange={(target) => set({ target })}
          options={[
            { value: 5, label: `${t("nPoints", { n: 5 })} ⚡` },
            { value: 10, label: t("nPoints", { n: 10 }) },
            { value: 20, label: `${t("nPoints", { n: 20 })} 🏃` },
          ]}
        />
      </Card>

      {isHost ? (
        <Button color="pink" className="py-4 text-2xl" disabled={!full} onClick={() => send({ type: "start" })}>
          {full ? t("start") : t("waitingOpponent")}
        </Button>
      ) : (
        <div className="brut-sm bg-white p-4 text-center font-bold">{t("waitHost")}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Picking

export function Picking({ view, send }: Ctx) {
  const { t } = useI18n();
  const { other } = names(view);
  const amAsker = view.meId === view.askerId;
  const [taunt, setTaunt] = useState<TauntId | null>(null);

  if (!amAsker) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="relative h-40 w-64">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="brut shuffle absolute left-1/2 top-0 flex h-40 w-28 -translate-x-1/2 items-center justify-center bg-grape text-5xl"
              style={{ "--x": `${(i - 1) * 60}px`, "--r": `${(i - 1) * 8}deg`, animationDelay: `${i * 120}ms`, marginLeft: -56 } as React.CSSProperties}
            >
              ❓
            </div>
          ))}
        </div>
        <p className="text-2xl font-black">{t("picking", { name: `${other?.avatar} ${other?.name}` })}</p>
        <p className="font-semibold opacity-70">{t("getReady")}</p>
      </div>
    );
  }

  const colors = ["bg-mint", "bg-sky", "bg-pink"] as const;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-3xl font-black">{t("youAreQuizmaster")}</h2>
        <p className="font-semibold">{t("pickFor", { name: `${other?.avatar} ${other?.name}` })}</p>
        {other && (
          <p className="brut-sm mt-2 inline-block bg-white px-3 py-1 font-bold">
            {t("translates", { name: other.name })} {directionLabel(t, other.direction)}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {view.hand.map((v, i) => (
          <button
            key={v.id}
            onClick={() => send({ type: "pick", vocabId: v.id, taunt })}
            className={`brut pop-in group flex flex-col items-center gap-2 p-5 text-center transition-transform hover:-translate-y-2 hover:rotate-0 ${colors[i % 3]} ${
              ["-rotate-3", "rotate-1", "rotate-3"][i % 3]
            }`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className="text-6xl transition-transform group-hover:scale-125">{v.emoji}</span>
            <span className="text-xl font-black">
              {FLAG.en} {v.en}
            </span>
            <span className="text-xl font-black">
              {FLAG.es} {v.es}
            </span>
            <Chilis level={v.level} />
            <span className="brut-sm mt-1 bg-white px-2 text-sm font-extrabold">{t("upTo", { n: v.level })}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="mb-2 text-center text-sm font-extrabold uppercase tracking-wider">{t("trashTalk")}</div>
        <div className="flex flex-wrap justify-center gap-2">
          {TAUNTS.map((id) => (
            <button
              key={id}
              onClick={() => setTaunt(taunt === id ? null : id)}
              className={`brut-sm px-3 py-1 text-sm font-bold ${taunt === id ? "bg-lemon -rotate-2" : "bg-white"}`}
            >
              {t(id)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Answering

function TimerBar({ deadline, now }: { deadline: number; now: number }) {
  const left = Math.max(0, deadline - now);
  const pct = (left / ROUND_MS) * 100;
  const danger = left < 5000;
  return (
    <div className="brut-sm relative h-8 overflow-hidden bg-white">
      <div
        className={`h-full transition-[width] duration-100 ease-linear ${danger ? "bg-tomato" : left < 10000 ? "bg-lemon" : "bg-mint"}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`absolute inset-0 flex items-center justify-center font-mono font-black ${danger ? "wiggle" : ""}`}>
        ⏱️ {Math.ceil(left / 1000)}s
      </span>
    </div>
  );
}

function PromptCard({ round }: { round: NonNullable<Ctx["view"]["round"]> }) {
  const { t } = useI18n();
  return (
    <Card color="grape" className="pop-in relative text-center">
      <div className="text-sm font-extrabold uppercase tracking-widest text-white">
        {FLAG[round.from]} {t(`lang_${round.from}`)} → {FLAG[round.to]} {t(`lang_${round.to}`)}
      </div>
      <div className="my-3 break-words text-5xl font-black text-white [text-shadow:3px_3px_0_var(--color-ink)] sm:text-6xl">
        {round.prompt}
      </div>
      <Chilis level={round.level} />
      {round.taunt && (
        <div className="brut-sm absolute -right-2 -top-5 rotate-6 bg-lemon px-3 py-1 text-sm font-black">„{t(round.taunt)}“</div>
      )}
    </Card>
  );
}

export function Answering({ view, send, serverNow }: Ctx) {
  const { t } = useI18n();
  const now = useNow(serverNow);
  const round = view.round!;
  const amAsker = view.meId === view.askerId;
  const { other } = names(view);

  if (amAsker) {
    const who = `${other?.avatar} ${other?.name}`;
    return (
      <div className="flex flex-col gap-5">
        <TimerBar deadline={round.deadline} now={now} />
        <PromptCard round={round} />
        <div className="brut-sm bg-white p-3 text-center font-bold">
          {t("solution")} <span className="font-black text-grape">{round.answer}</span> {round.hint?.emoji}
          {round.hintUsed && <span className="ml-2 text-tomato">{t("hintWasUsed")}</span>}
        </div>
        <Card className="text-center">
          <div className="mb-2 text-sm font-extrabold uppercase tracking-wider">
            {round.choices ? t("thinking", { name: who }) : t("typesLive", { name: who })}
          </div>
          {!round.choices && (
            <div className="min-h-14 break-words font-mono text-4xl font-black">
              {round.draft || <span className="opacity-30">…</span>}
              <span className="caret">▍</span>
            </div>
          )}
          {round.choices && <div className="bob text-5xl">🤔</div>}
        </Card>
        <p className="text-center font-semibold opacity-70">{t("sitBack")}</p>
      </div>
    );
  }

  return <AnswerInput key={view.turn} {...{ view, send, now }} />;
}

function AnswerInput({ view, send, now }: Pick<Ctx, "view" | "send"> & { now: number }) {
  const { t } = useI18n();
  const round = view.round!;
  const [text, setText] = useState("");
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const onChange = (v: string) => {
    setText(v);
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => send({ type: "draft", text: v }), 150);
  };

  const submit = (answer: string) => {
    clearTimeout(draftTimer.current);
    send({ type: "answer", text: answer });
  };

  return (
    <div className="flex flex-col gap-5">
      <TimerBar deadline={round.deadline} now={now} />
      <PromptCard round={round} />

      {round.choices ? (
        <div className="grid grid-cols-2 gap-3">
          {round.choices.map((c, i) => (
            <Button key={c} color={(["mint", "sky", "pink", "lemon"] as const)[i % 4]} className="py-5 text-xl" onClick={() => submit(c)}>
              {c}
            </Button>
          ))}
        </div>
      ) : (
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("inLang", { lang: t(`lang_${round.to}`) })}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="brut-sm min-w-0 flex-1 bg-white px-4 py-4 text-2xl font-bold outline-none focus:bg-lemon/20"
          />
          <Button color="mint" className="text-xl" disabled={!text.trim()}>
            {t("submit")}
          </Button>
        </form>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {round.hint ? (
          <div className="brut-sm pop-in bg-lemon px-4 py-2 text-lg font-black">
            💡 {round.hint.emoji} <span className="font-mono tracking-widest">{round.hint.mask}</span>
          </div>
        ) : (
          <Button color="white" className="text-base" onClick={() => send({ type: "hint" })}>
            {t("buyHint")}
          </Button>
        )}
        {!round.choices && <span className="text-sm font-semibold opacity-60">{t("tolerance")}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Reveal

const VERDICT = {
  correct: { emoji: "🎉", color: "bg-mint" },
  close: { emoji: "😅", color: "bg-lemon" },
  wrong: { emoji: "💥", color: "bg-tomato" },
  timeout: { emoji: "⏰", color: "bg-tomato" },
} as const;

export function Reveal({ view, send, serverNow }: Ctx) {
  const { t } = useI18n();
  const now = useNow(serverNow);
  const r = view.result!;
  const v = VERDICT[r.verdict];
  const iWon = r.winnerId === view.meId;
  const iAnswered = r.answererId === view.meId;
  const winner = view.players.find((p) => p.id === r.winnerId)!;
  const left = Math.max(0, view.revealUntil - now);
  const pts = t(r.points === 1 ? "point" : "points");

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {iWon && <Confetti count={r.verdict === "correct" ? 70 : 35} />}
      <div className={`brut pop-in w-full p-6 text-center ${v.color} ${!iWon ? "shake" : ""}`}>
        <div className="text-7xl">{v.emoji}</div>
        <h2 className="mt-2 text-4xl font-black">{t(`v_${r.verdict}`)}</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-2xl font-black">
          <span className="brut-sm bg-white px-3 py-1">{r.prompt}</span>
          <span>=</span>
          <span className="brut-sm bg-white px-3 py-1">
            {r.emoji} {r.expected}
          </span>
        </div>
        {r.verdict !== "correct" && r.given && (
          <p className="mt-3 font-bold">
            {iAnswered ? t("youTyped") : t("theyTyped")} <span className="font-mono">„{r.given}“</span>
          </p>
        )}
      </div>

      <div className="brut-sm pop-in bg-white px-5 py-3 text-xl font-black [animation-delay:200ms]">
        {winner.avatar} {iWon ? t("youGet", { n: r.points }) : t("theyGet", { name: winner.name, n: r.points })} {pts}
        {r.bonus && ` ${t("streakBonus")}`}
        {r.verdict !== "correct" && r.verdict !== "close" && ` ${t("meanQuestion")}`}
      </div>

      <Button color="pink" onClick={() => send({ type: "next" })}>
        {t("next", { n: Math.ceil(left / 1000) })}
      </Button>
      <p className="text-sm font-semibold opacity-60">{t("swap")}</p>
    </div>
  );
}

// ---------------------------------------------------------------- Finished

export function Finished({ view, send }: Ctx) {
  const { t } = useI18n();
  const sorted = [...view.players].sort((a, b) => b.score - a.score);
  const champ = sorted[0];
  const iWon = champ.id === view.meId;

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {iWon && <Confetti count={140} />}
      <div className="bob text-9xl">{iWon ? "🏆" : "🥲"}</div>
      <h2 className="pop-in text-5xl font-black">{iWon ? t("youWon") : t("champWins", { name: champ.name })}</h2>
      <p className="text-xl font-semibold">{iWon ? t("legend") : t("nextTime")}</p>
      <div className="flex gap-4">
        {sorted.map((p, i) => (
          <Card key={p.id} color={i === 0 ? "lemon" : "white"} className={`pop-in ${i === 0 ? "-rotate-3" : "rotate-3"}`}>
            <div className="text-5xl">{p.avatar}</div>
            <div className="font-black">{p.name}</div>
            <div className="text-4xl font-black">{p.score}</div>
          </Card>
        ))}
      </div>
      <Button color="pink" className="py-4 text-2xl" onClick={() => send({ type: "rematch" })}>
        {t("rematch")}
      </Button>
    </div>
  );
}
