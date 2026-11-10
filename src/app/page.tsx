"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProfileFields, useProfile } from "@/components/ProfileForm";
import { Button, Card, Logo } from "@/components/ui";
import { createRoom, joinRoom, saveToken } from "@/lib/client";
import { errorText, LanguageSwitcher, useI18n } from "@/lib/i18n";

const TICKER = ["ticker1", "ticker2", "ticker3", "ticker4", "ticker5", "ticker6"] as const;
const STEPS = [
  ["🃏", "step1"],
  ["⏱️", "step2"],
  ["🔄", "step3"],
] as const;

export default function Home() {
  const router = useRouter();
  const { t } = useI18n();
  const profile = useProfile();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = profile.name.trim().length > 0;

  async function run(fn: () => Promise<{ code: string; token: string }>) {
    if (!ready) return setError(t("needName"));
    setBusy(true);
    setError(null);
    try {
      profile.persist();
      const res = await fn();
      saveToken(res.code, res.token);
      router.push(`/room/${res.code}`);
    } catch (e) {
      setError(errorText(t, (e as Error).message));
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="overflow-hidden border-b-3 border-ink bg-ink py-2 text-cream">
        <div className="marquee flex w-max gap-10 whitespace-nowrap text-sm font-bold">
          {[...TICKER, ...TICKER].map((k, i) => (
            <span key={i}>{t(k)}</span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl justify-end px-4 pt-4">
        <LanguageSwitcher />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-4 py-6 sm:py-10">
        <div className="pop-in text-center">
          <Logo />
          <p className="mt-4 text-lg font-semibold sm:text-xl">{t("tagline")}</p>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-[1.2fr_1fr]">
          <Card className="pop-in -rotate-1 [animation-delay:80ms]">
            <ProfileFields profile={profile} />
          </Card>

          <div className="flex flex-col gap-6">
            <Card color="pink" className="pop-in rotate-1 [animation-delay:160ms]">
              <h2 className="text-2xl font-black">{t("newGame")}</h2>
              <p className="mb-4 font-semibold">{t("newGameText")}</p>
              <Button color="lemon" className="w-full" disabled={busy} onClick={() => run(() => createRoom(profile.name, profile.avatar))}>
                {t("createRoom")}
              </Button>
            </Card>

            <Card color="sky" className="pop-in -rotate-1 [animation-delay:240ms]">
              <h2 className="text-2xl font-black">{t("join")}</h2>
              <p className="mb-4 font-semibold">{t("joinText")}</p>
              <form
                className="flex gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => joinRoom(code, profile.name, profile.avatar));
                }}
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4))}
                  placeholder="ABCD"
                  className="brut-sm w-full min-w-0 bg-white px-3 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] outline-none"
                />
                <Button color="mint" disabled={busy || code.length !== 4}>
                  {t("go")}
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {error && <div className="brut-sm shake bg-tomato px-4 py-2 font-bold text-white">{error}</div>}

        <section className="grid w-full gap-4 sm:grid-cols-3">
          {STEPS.map(([e, k], i) => (
            <div key={k} className="brut-sm flex items-start gap-3 bg-white p-4">
              <span className="text-3xl">{e}</span>
              <p className="font-semibold">
                <span className="font-black">{t("step", { n: i + 1 })}</span> {t(k)}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
