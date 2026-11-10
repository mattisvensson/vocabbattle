"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Action, GameView } from "@/lib/game";
import { fetchView, getToken, joinRoom, saveToken, sendAction } from "@/lib/client";
import { REACTIONS } from "@/lib/constants";
import { errorText, LanguageSwitcher, useI18n } from "@/lib/i18n";
import { ProfileFields, useProfile } from "./ProfileForm";
import { Answering, Finished, Lobby, Picking, Reveal } from "./screens";
import { Button, Card, Logo } from "./ui";

export type Ctx = {
  view: GameView;
  send: (a: Action) => Promise<void>;
  /** server-synced clock */
  serverNow: () => number;
};

export function Room({ code }: { code: string }) {
  const { t } = useI18n();
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const offset = useRef(0);
  const latest = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read token from localStorage after mount
    setToken(getToken(code));
  }, [code]);

  const apply = useCallback((v: GameView) => {
    if (v.now < latest.current) return; // ignore stale responses
    latest.current = v.now;
    offset.current = v.now - Date.now();
    setView(v);
  }, []);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    const poll = async () => {
      try {
        const v = await fetchView(code, token);
        if (alive) apply(v);
      } catch (e) {
        const status = (e as { status?: number }).status;
        if (alive && (status === 404 || status === 403)) setFatal((e as Error).message);
      }
    };
    poll();
    const id = setInterval(poll, 800);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [code, token, apply]);

  const send = useCallback(
    async (a: Action) => {
      if (!token) return;
      try {
        setError(null);
        apply(await sendAction(code, token, a));
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [code, token, apply],
  );

  const serverNow = useCallback(() => Date.now() + offset.current, []);

  if (fatal) {
    return (
      <Center>
        <Card color="tomato" className="pop-in max-w-md text-center text-white">
          <div className="text-6xl">🕳️</div>
          <p className="mt-2 text-xl font-black">{errorText(t, fatal)}</p>
          <Link href="/" className="btn mt-4 inline-block bg-lemon px-5 py-3 text-ink">
            {t("backHome")}
          </Link>
        </Card>
      </Center>
    );
  }

  if (token === undefined) return <Center><Loading /></Center>;
  if (token === null) return <JoinHere code={code} onJoined={setToken} />;
  if (!view) return <Center><Loading /></Center>;

  const ctx: Ctx = { view, send, serverNow };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-5">
      <header className="flex items-center justify-between gap-3">
        <Link href="/">
          <Logo small />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <span className="brut-sm bg-white px-3 py-1 font-mono text-lg font-black tracking-widest">{view.code}</span>
        </div>
      </header>

      {view.phase !== "lobby" && <Scoreboard view={view} />}

      <div className="flex-1">
        {view.phase === "lobby" && <Lobby {...ctx} />}
        {view.phase === "picking" && <Picking {...ctx} />}
        {view.phase === "answering" && <Answering {...ctx} />}
        {view.phase === "reveal" && <Reveal {...ctx} />}
        {view.phase === "finished" && <Finished {...ctx} />}
      </div>

      {error && (
        <div className="brut-sm shake fixed bottom-24 left-1/2 z-40 -translate-x-1/2 bg-tomato px-4 py-2 font-bold text-white">
          {errorText(t, error)}
        </div>
      )}

      <Reactions view={view} send={send} />
    </main>
  );
}

function Scoreboard({ view }: { view: GameView }) {
  const { t } = useI18n();
  const { target } = view.settings;
  return (
    <div className="grid grid-cols-2 gap-3">
      {view.players.map((p) => {
        const asker = p.id === view.askerId;
        const pct = Math.min(100, (p.score / target) * 100);
        return (
          <div key={p.id} className={`brut-sm relative overflow-hidden p-3 ${p.id === view.meId ? "bg-white" : "bg-cream"}`}>
            <div className="absolute inset-y-0 left-0 bg-mint/50 transition-all duration-700" style={{ width: `${pct}%` }} />
            <div className="relative flex items-center gap-3">
              <span className={`text-4xl ${asker ? "wiggle" : ""}`}>{p.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 truncate font-black">
                  {p.name}
                  {p.id === view.meId && <span className="text-xs font-bold opacity-60">{t("you")}</span>}
                  {!p.online && <span title={t("offline")}>💤</span>}
                </div>
                <div className="text-xs font-extrabold uppercase tracking-wider opacity-70">
                  {view.phase === "finished" ? "" : asker ? t("quizmaster") : t("guesser")}
                  {p.streak >= 2 && <span className="ml-1 text-tomato">🔥×{p.streak}</span>}
                </div>
              </div>
              <div className="text-3xl font-black tabular-nums">
                {p.score}
                <span className="text-base opacity-50">/{target}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Reactions({ view, send }: { view: GameView; send: Ctx["send"] }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 h-0">
        {view.reactions.map((r) => {
          const mine = r.from === view.meId;
          // deterministic per-reaction jitter
          const jitter = ((r.id * 37) % 30) - 15;
          return (
            <span
              key={r.id}
              className="float-up absolute text-5xl"
              style={{ left: `${(mine ? 30 : 70) + jitter}%`, "--rot": `${jitter}deg` } as React.CSSProperties}
            >
              {r.emoji}
            </span>
          );
        })}
      </div>
      <div className="sticky bottom-3 z-30 mx-auto flex w-fit gap-1 rounded-full border-3 border-ink bg-white px-2 py-1.5 shadow-[4px_4px_0_var(--color-ink)]">
        {REACTIONS.map((e) => (
          <button
            key={e}
            onClick={() => send({ type: "react", emoji: e })}
            className="rounded-full px-1.5 text-2xl transition-transform hover:-translate-y-1 hover:scale-125 active:scale-90"
            aria-label={`Reaktion ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
    </>
  );
}

function JoinHere({ code, onJoined }: { code: string; onJoined: (t: string) => void }) {
  const { t } = useI18n();
  const profile = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Center>
      <Card className="pop-in w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LanguageSwitcher />
        </div>
        <h1 className="mb-1 text-3xl font-black">{t("challenged")}</h1>
        <p className="mb-4 font-semibold">{t("roomWaiting", { code })}</p>
        <ProfileFields profile={profile} />
        {error && <p className="mt-3 font-bold text-tomato">{errorText(t, error)}</p>}
        <Button
          color="mint"
          className="mt-5 w-full"
          disabled={busy || !profile.name.trim()}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              profile.persist();
              const res = await joinRoom(code, profile.name, profile.avatar);
              saveToken(res.code, res.token);
              onJoined(res.token);
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          {t("accept")}
        </Button>
      </Card>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 items-center justify-center p-4">{children}</main>;
}

function Loading() {
  return <div className="bob text-6xl">🦙</div>;
}
