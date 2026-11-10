/** Taunt ids – the text is translated on each client (see `taunt*` keys in i18n). */
export const TAUNTS = ["taunt1", "taunt2", "taunt3", "taunt4", "taunt5", "taunt6"] as const;
export type TauntId = (typeof TAUNTS)[number];

export const REACTIONS = ["😂", "🔥", "😱", "👏", "🤡", "💀", "🫶", "🌶️"];

export const AVATARS = ["🦙", "🐸", "🦊", "🐙", "🦖", "🐼", "🦄", "🐧", "🌵", "🌮", "👽", "🤠"];

export const ROUND_MS = 20_000;
