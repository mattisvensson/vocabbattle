import { AVATARS, REACTIONS, ROUND_MS, TAUNTS, type TauntId } from "./constants";
import { CATEGORIES, VOCAB, VOCAB_BY_ID, type CategoryId, type Vocab } from "./vocab";

export type Direction = "en-es" | "es-en" | "mix";
export type AnswerMode = "type" | "choice";
export type Phase = "lobby" | "picking" | "answering" | "reveal" | "finished";

export type Settings = {
  category: CategoryId | "all";
  target: number;
  mode: AnswerMode;
};

type Player = {
  id: string;
  token: string;
  name: string;
  avatar: string;
  direction: Direction;
  score: number;
  streak: number;
  lastSeen: number;
};

type Round = {
  vocabId: string;
  from: "en" | "es";
  taunt: TauntId | null;
  deadline: number;
  hintUsed: boolean;
  draft: string;
  choices: string[] | null;
};

export type RoundResult = {
  verdict: "correct" | "close" | "wrong" | "timeout";
  given: string;
  expected: string;
  prompt: string;
  emoji: string;
  points: number;
  winnerId: string;
  answererId: string;
  bonus: boolean;
};

type Reaction = { id: number; from: string; emoji: string; at: number };

type Room = {
  code: string;
  createdAt: number;
  updatedAt: number;
  hostId: string;
  players: Player[];
  settings: Settings;
  phase: Phase;
  askerId: string | null;
  hand: string[];
  round: Round | null;
  result: RoundResult | null;
  revealUntil: number;
  used: string[];
  turn: number;
  reactions: Reaction[];
  reactionSeq: number;
};

const REVEAL_MS = 7_000;
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const HAND_SIZE = 3;

// Survive dev hot reloads and keep a single store across route bundles.
const g = globalThis as unknown as { __vocabRooms?: Map<string, Room> };
const rooms: Map<string, Room> = (g.__vocabRooms ??= new Map());

/** `message` is an error code the client translates (see `err_*` keys in i18n). */
export class GameError extends Error {
  constructor(
    message:
      | "needName"
      | "roomNotFound"
      | "notInRoom"
      | "roomFull"
      | "hostOnly"
      | "waitOpponent"
      | "notYourTurn"
      | "notYourCard"
      | "unknown",
    public status = 400,
  ) {
    super(message);
  }
}

function now() {
  return Date.now();
}

function randomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  return code;
}

function cleanup() {
  const t = now();
  for (const [code, room] of rooms) {
    if (t - room.updatedAt > ROOM_TTL_MS) rooms.delete(code);
  }
}

function sanitizeName(name: unknown) {
  const n = typeof name === "string" ? name.trim().slice(0, 16) : "";
  if (!n) throw new GameError("needName");
  return n;
}

function sanitizeAvatar(avatar: unknown) {
  return typeof avatar === "string" && AVATARS.includes(avatar) ? avatar : AVATARS[0];
}

function newPlayer(name: unknown, avatar: unknown): Player {
  return {
    id: crypto.randomUUID().slice(0, 8),
    token: crypto.randomUUID(),
    name: sanitizeName(name),
    avatar: sanitizeAvatar(avatar),
    direction: "mix",
    score: 0,
    streak: 0,
    lastSeen: now(),
  };
}

export function createRoom(name: unknown, avatar: unknown) {
  cleanup();
  let code = randomCode();
  while (rooms.has(code)) code = randomCode();
  const host = newPlayer(name, avatar);
  const room: Room = {
    code,
    createdAt: now(),
    updatedAt: now(),
    hostId: host.id,
    players: [host],
    settings: { category: "all", target: 10, mode: "type" },
    phase: "lobby",
    askerId: null,
    hand: [],
    round: null,
    result: null,
    revealUntil: 0,
    used: [],
    turn: 0,
    reactions: [],
    reactionSeq: 0,
  };
  rooms.set(code, room);
  return { code, token: host.token };
}

function getRoom(code: string) {
  const room = rooms.get(code.toUpperCase());
  if (!room) throw new GameError("roomNotFound", 404);
  return room;
}

function getPlayer(room: Room, token: unknown) {
  const p = room.players.find((pl) => pl.token === token);
  if (!p) throw new GameError("notInRoom", 403);
  return p;
}

// ---------- answer checking ----------

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¡!¿?.,'"]/g, "")
    .replace(/^(el|la|los|las|un|una|the|a|an|to)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

function check(given: string, expected: string): "correct" | "close" | "wrong" {
  const a = normalize(given);
  const b = normalize(expected);
  if (!a) return "wrong";
  if (a === b) return "correct";
  if (b.length >= 5 && levenshtein(a, b) <= 1) return "close";
  return "wrong";
}

/** "la manzana" -> "la m______" */
function mask(word: string) {
  const m = word.match(/^((?:el|la|los|las|the|to)\s+)?(.*)$/i)!;
  const rest = m[2].replace(/[\p{L}]/gu, (ch, i: number) => (i === 0 || m[2][i - 1] === " " ? ch : "_"));
  return (m[1] ?? "") + rest;
}

// ---------- game flow ----------

function pool(room: Room) {
  const { category } = room.settings;
  return VOCAB.filter((v) => category === "all" || v.category === category);
}

function drawHand(room: Room) {
  let available = pool(room).filter((v) => !room.used.includes(v.id));
  if (available.length < HAND_SIZE) {
    room.used = [];
    available = pool(room);
  }
  // Try to offer one card of each level for a juicy choice.
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const hand: Vocab[] = [];
  for (const level of [1, 2, 3] as const) {
    const pick = shuffled.find((v) => v.level === level && !hand.includes(v));
    if (pick) hand.push(pick);
  }
  for (const v of shuffled) {
    if (hand.length >= HAND_SIZE) break;
    if (!hand.includes(v)) hand.push(v);
  }
  room.hand = hand.map((v) => v.id);
}

function startTurn(room: Room) {
  room.phase = "picking";
  room.round = null;
  room.result = null;
  room.turn += 1;
  drawHand(room);
}

function answererOf(room: Room) {
  return room.players.find((p) => p.id !== room.askerId)!;
}

function sideOf(v: Vocab, lang: "en" | "es") {
  return lang === "en" ? v.en : v.es;
}

function finishRound(room: Room, given: string, timeout: boolean) {
  const round = room.round!;
  const vocab = VOCAB_BY_ID.get(round.vocabId)!;
  const to = round.from === "en" ? "es" : "en";
  const expected = sideOf(vocab, to);
  const answerer = answererOf(room);
  const asker = room.players.find((p) => p.id === room.askerId)!;

  const verdict = timeout ? "timeout" : check(given, expected);
  let points: number;
  let winner: Player;
  let bonus = false;

  if (verdict === "correct" || verdict === "close") {
    answerer.streak += 1;
    points = vocab.level;
    if (room.settings.mode === "choice") points = Math.max(1, points - 1);
    if (round.hintUsed) points = Math.max(1, points - 1);
    if (answerer.streak >= 3) {
      points += 1;
      bonus = true;
    }
    winner = answerer;
  } else {
    answerer.streak = 0;
    points = 1;
    winner = asker;
  }
  winner.score += points;

  room.result = {
    verdict,
    given,
    expected,
    prompt: sideOf(vocab, round.from),
    emoji: vocab.emoji,
    points,
    winnerId: winner.id,
    answererId: answerer.id,
    bonus,
  };
  room.round = null;
  room.phase = "reveal";
  room.revealUntil = now() + REVEAL_MS;
}

function advanceAfterReveal(room: Room) {
  const leader = room.players.find((p) => p.score >= room.settings.target);
  if (leader) {
    room.phase = "finished";
    return;
  }
  room.askerId = answererOf(room).id; // swap roles
  startTurn(room);
}

/** Apply time-based transitions (timeouts, auto-advance). */
function tick(room: Room) {
  const t = now();
  if (room.phase === "answering" && room.round && t > room.round.deadline) {
    finishRound(room, room.round.draft, true);
  }
  if (room.phase === "reveal" && t > room.revealUntil) {
    advanceAfterReveal(room);
  }
}

function buildChoices(vocab: Vocab, to: "en" | "es") {
  const correct = sideOf(vocab, to);
  const sameCat = VOCAB.filter((v) => v.id !== vocab.id && v.category === vocab.category);
  const others = [...sameCat].sort(() => Math.random() - 0.5).slice(0, 3).map((v) => sideOf(v, to));
  return [correct, ...others].sort(() => Math.random() - 0.5);
}

// ---------- public API ----------

export function joinRoom(code: string, name: unknown, avatar: unknown) {
  const room = getRoom(code);
  if (room.players.length >= 2) throw new GameError("roomFull");
  const p = newPlayer(name, avatar);
  room.players.push(p);
  room.updatedAt = now();
  return { code: room.code, token: p.token };
}

export type Action =
  | { type: "settings"; settings: Partial<Settings> }
  | { type: "direction"; direction: Direction }
  | { type: "start" }
  | { type: "pick"; vocabId: string; taunt?: string | null }
  | { type: "draft"; text: string }
  | { type: "hint" }
  | { type: "answer"; text: string }
  | { type: "next" }
  | { type: "react"; emoji: string }
  | { type: "rematch" };

export function act(code: string, token: unknown, action: Action) {
  const room = getRoom(code);
  const me = getPlayer(room, token);
  me.lastSeen = now();
  tick(room);
  room.updatedAt = now();

  const isHost = me.id === room.hostId;

  switch (action.type) {
    case "settings": {
      if (!isHost || room.phase !== "lobby") throw new GameError("hostOnly");
      const s = action.settings;
      if (s.mode && ["type", "choice"].includes(s.mode)) room.settings.mode = s.mode;
      if (s.category && (s.category === "all" || CATEGORIES.some((c) => c.id === s.category)))
        room.settings.category = s.category;
      if (typeof s.target === "number" && [5, 10, 20].includes(s.target)) room.settings.target = s.target;
      break;
    }
    case "direction": {
      // Each player picks the direction *they* want to practise.
      if (["en-es", "es-en", "mix"].includes(action.direction)) me.direction = action.direction;
      break;
    }
    case "start": {
      if (!isHost || room.phase !== "lobby") throw new GameError("hostOnly");
      if (room.players.length < 2) throw new GameError("waitOpponent");
      room.players.forEach((p) => {
        p.score = 0;
        p.streak = 0;
      });
      room.used = [];
      room.turn = 0;
      // Guest asks first – host gets the first question.
      room.askerId = room.players[1].id;
      startTurn(room);
      break;
    }
    case "pick": {
      if (room.phase !== "picking" || me.id !== room.askerId) throw new GameError("notYourTurn");
      if (!room.hand.includes(action.vocabId)) throw new GameError("notYourCard");
      const vocab = VOCAB_BY_ID.get(action.vocabId)!;
      // The answerer's own learning direction decides which way the word is asked.
      const dir = answererOf(room).direction;
      const from = dir === "en-es" ? "en" : dir === "es-en" ? "es" : Math.random() < 0.5 ? "en" : "es";
      const to = from === "en" ? "es" : "en";
      room.used.push(vocab.id);
      room.round = {
        vocabId: vocab.id,
        from,
        taunt: TAUNTS.find((id) => id === action.taunt) ?? null,
        deadline: now() + ROUND_MS,
        hintUsed: false,
        draft: "",
        choices: room.settings.mode === "choice" ? buildChoices(vocab, to) : null,
      };
      room.hand = [];
      room.phase = "answering";
      break;
    }
    case "draft": {
      if (room.phase === "answering" && room.round && me.id !== room.askerId) {
        room.round.draft = String(action.text ?? "").slice(0, 40);
      }
      break;
    }
    case "hint": {
      if (room.phase !== "answering" || !room.round || me.id === room.askerId) throw new GameError("notYourTurn");
      room.round.hintUsed = true;
      break;
    }
    case "answer": {
      if (room.phase !== "answering" || !room.round || me.id === room.askerId) throw new GameError("notYourTurn");
      finishRound(room, String(action.text ?? "").slice(0, 40), false);
      break;
    }
    case "next": {
      if (room.phase === "reveal") advanceAfterReveal(room);
      break;
    }
    case "react": {
      if (!REACTIONS.includes(action.emoji)) break;
      room.reactions.push({ id: ++room.reactionSeq, from: me.id, emoji: action.emoji, at: now() });
      room.reactions = room.reactions.filter((r) => now() - r.at < 4000).slice(-20);
      break;
    }
    case "rematch": {
      if (room.phase !== "finished") break;
      room.phase = "lobby";
      room.askerId = null;
      room.result = null;
      room.players.forEach((p) => {
        p.score = 0;
        p.streak = 0;
      });
      break;
    }
    default:
      throw new GameError("unknown");
  }
  return view(room, me);
}

export function getView(code: string, token: unknown) {
  const room = getRoom(code);
  const me = getPlayer(room, token);
  me.lastSeen = now();
  tick(room);
  return view(room, me);
}

/** Per-player view – never leaks the answer to the answerer. */
function view(room: Room, me: Player) {
  const t = now();
  const round = room.round;
  const vocab = round ? VOCAB_BY_ID.get(round.vocabId)! : null;
  const amAsker = me.id === room.askerId;
  const to: "en" | "es" = round?.from === "en" ? "es" : "en";

  return {
    now: t,
    code: room.code,
    meId: me.id,
    hostId: room.hostId,
    phase: room.phase,
    settings: room.settings,
    askerId: room.askerId,
    turn: room.turn,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      direction: p.direction,
      score: p.score,
      streak: p.streak,
      online: t - p.lastSeen < 6000,
    })),
    hand: amAsker ? room.hand.map((id) => VOCAB_BY_ID.get(id)!) : [],
    round:
      round && vocab
        ? {
            prompt: sideOf(vocab, round.from),
            from: round.from,
            to,
            level: vocab.level,
            category: vocab.category,
            taunt: round.taunt,
            deadline: round.deadline,
            hintUsed: round.hintUsed,
            choices: round.choices,
            // the asker sees everything, the answerer only gets the hint once requested
            draft: amAsker ? round.draft : null,
            answer: amAsker ? sideOf(vocab, to) : null,
            hint: amAsker || round.hintUsed ? { emoji: vocab.emoji, mask: mask(sideOf(vocab, to)) } : null,
          }
        : null,
    result: room.result,
    revealUntil: room.revealUntil,
    reactions: room.reactions.filter((r) => t - r.at < 4000),
  };
}

export type GameView = ReturnType<typeof view>;
