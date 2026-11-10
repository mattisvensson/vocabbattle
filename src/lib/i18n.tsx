"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "de" | "en" | "es";
export const LOCALES: { id: Locale; flag: string; label: string }[] = [
  { id: "de", flag: "DE", label: "Deutsch" },
  { id: "en", flag: "EN", label: "English" },
  { id: "es", flag: "ES", label: "Español" },
];

const de = {
  // home
  tagline: "Das Vokabel-Duell für zwei. Du stellst die Fragen, dein Gegenüber schwitzt. 💦",
  ticker1: "🌮 la tortuga = turtle",
  ticker2: "🔥 3er-Streak = Bonuspunkt",
  ticker3: "😈 Trash-Talk erlaubt",
  ticker4: "🦙 el perro ≠ la perra (Vorsicht!)",
  ticker5: "⏰ 20 Sekunden pro Wort",
  ticker6: "🌶️ Scharfe Wörter = mehr Punkte",
  newGame: "Neues Spiel 🎤",
  newGameText: "Mach einen Raum auf und schick den Code rum.",
  createRoom: "Raum erstellen →",
  join: "Beitreten 🚪",
  joinText: "Hast du einen Code bekommen?",
  go: "Go!",
  needName: "Erst mal einen Namen eingeben 😉",
  step: "Schritt {n}:",
  step1: "Der Quizmaster zieht 3 Karten und wählt die fieseste aus.",
  step2: "Der Rater hat 20 Sekunden. Der Quizmaster sieht live mit, was getippt wird.",
  step3: "Richtig = Punkte für den Rater, falsch = Punkt für den Quizmaster. Dann Rollentausch!",
  // profile
  yourName: "Dein Name",
  namePlaceholder: "z. B. Señor Vokabel",
  yourAvatar: "Dein Avatar",
  // room shell
  backHome: "Zur Startseite",
  you: "(du)",
  offline: "offline",
  quizmaster: "🎤 Quizmaster",
  guesser: "🧠 Rater",
  challenged: "Du wurdest herausgefordert! ⚔️",
  roomWaiting: "Raum {code} wartet auf dich.",
  accept: "Ich nehme an! 💪",
  difficulty: "Schwierigkeit {n}",
  // lobby
  roomCode: "Raum-Code",
  copied: "Kopiert! ✅",
  copyInvite: "🔗 Einladungslink kopieren",
  waiting: "Wartet…",
  host: "👑 Host",
  myDirection: "Was willst du lernen?",
  myDirectionHint: "Jede:r wählt selbst – du bekommst deine Vokabeln in dieser Richtung.",
  mix: "🎲 Gemischt",
  rules: "Spielregeln",
  hostDecides: "(legt der Host fest)",
  category: "Kategorie",
  all: "🌍 Alles",
  cat_food: "Essen & Trinken",
  cat_animals: "Tiere",
  cat_travel: "Reisen",
  cat_daily: "Alltag",
  cat_party: "Party & Gefühle",
  cat_body: "Körper & Gesundheit",
  answers: "Antworten",
  modeType: "⌨️ Eintippen (Profi)",
  modeChoice: "🅰️ Multiple Choice (−1 Pkt)",
  playTo: "Spielen bis",
  nPoints: "{n} Punkte",
  start: "Los geht's! 🚀",
  waitingOpponent: "Warte auf Gegner:in…",
  waitHost: "Warte, bis der Host startet… ⏳",
  // picking
  picking: "{name} sucht gerade eine fiese Vokabel aus…",
  getReady: "Mach dich bereit. Finger an die Tastatur. 🫣",
  youAreQuizmaster: "Du bist der Quizmaster! 🎤",
  pickFor: "Wähl eine Karte für {name}. Mehr 🌶️ = mehr Punkte, wenn richtig geraten.",
  translates: "{name} übersetzt",
  upTo: "bis zu {n} Pkt",
  trashTalk: "Optional: ein bisschen Trash-Talk 😈",
  taunt1: "Das schaffst du NIE 😈",
  taunt2: "Easy peasy… oder? 🍋",
  taunt3: "Sogar meine Oma kann das 👵",
  taunt4: "Ich glaub an dich! (nicht) 🙃",
  taunt5: "Viel Glück, du wirst es brauchen 🍀",
  taunt6: "Hehe. 😏",
  // answering
  solution: "Lösung:",
  hintWasUsed: "💡 Tipp wurde benutzt!",
  typesLive: "{name} tippt live:",
  thinking: "{name} überlegt…",
  sitBack: "Lehn dich zurück und genieß das Schwitzen. 🍿",
  inLang: "Auf {lang}…",
  submit: "Abschicken ✨",
  buyHint: "💡 Tipp kaufen (−1 Pkt)",
  tolerance: "Akzente egal, Artikel optional, 1 Tippfehler wird verziehen.",
  lang_en: "Englisch",
  lang_es: "Spanisch",
  // reveal
  v_correct: "¡Olé! Richtig!",
  v_close: "Knapp, aber zählt!",
  v_wrong: "Autsch! Daneben.",
  v_timeout: "Zeit abgelaufen!",
  youTyped: "Du hast:",
  theyTyped: "Getippt wurde:",
  youGet: "Du bekommst +{n}",
  theyGet: "{name} bekommt +{n}",
  point: "Punkt",
  points: "Punkte",
  streakBonus: "(🔥 Streak-Bonus!)",
  meanQuestion: "für die fiese Frage 😈",
  next: "Weiter ({n}) →",
  swap: "Rollentausch! 🔄",
  // finished
  youWon: "Du hast gewonnen!",
  champWins: "{name} gewinnt!",
  legend: "Vokabel-Legende. Absolute Bestie. 👑",
  nextTime: "Nächstes Mal! Eine Revanche ist nur einen Klick entfernt. 💪",
  rematch: "Revanche! 🔁",
  // server errors
  err_needName: "Bitte gib einen Namen ein.",
  err_roomNotFound: "Diesen Raum gibt es nicht (mehr). 🕳️",
  err_notInRoom: "Du bist nicht in diesem Raum.",
  err_roomFull: "Der Raum ist schon voll. Zwei sind eine Party, drei sind Chaos. 🙅",
  err_hostOnly: "Nur der Host kann das.",
  err_waitOpponent: "Warte auf deine:n Gegner:in!",
  err_notYourTurn: "Du bist gerade nicht dran.",
  err_notYourCard: "Diese Karte hast du nicht.",
  err_unknown: "Ups, da ist was schiefgelaufen.",
};

export type MsgKey = keyof typeof de;

const en: Record<MsgKey, string> = {
  tagline: "The vocab duel for two. You ask the questions, your opponent sweats. 💦",
  ticker1: "🌮 la tortuga = turtle",
  ticker2: "🔥 3-streak = bonus point",
  ticker3: "😈 Trash talk allowed",
  ticker4: "🦙 el perro ≠ la perra (careful!)",
  ticker5: "⏰ 20 seconds per word",
  ticker6: "🌶️ Spicy words = more points",
  newGame: "New game 🎤",
  newGameText: "Open a room and send the code around.",
  createRoom: "Create room →",
  join: "Join 🚪",
  joinText: "Got a code?",
  go: "Go!",
  needName: "Enter a name first 😉",
  step: "Step {n}:",
  step1: "The quizmaster draws 3 cards and picks the meanest one.",
  step2: "The guesser has 20 seconds. The quizmaster watches every keystroke live.",
  step3: "Right = points for the guesser, wrong = a point for the quizmaster. Then swap roles!",
  yourName: "Your name",
  namePlaceholder: "e.g. Señor Vocab",
  yourAvatar: "Your avatar",
  backHome: "Back to start",
  you: "(you)",
  offline: "offline",
  quizmaster: "🎤 Quizmaster",
  guesser: "🧠 Guesser",
  challenged: "You've been challenged! ⚔️",
  roomWaiting: "Room {code} is waiting for you.",
  accept: "Challenge accepted! 💪",
  difficulty: "Difficulty {n}",
  roomCode: "Room code",
  copied: "Copied! ✅",
  copyInvite: "🔗 Copy invite link",
  waiting: "Waiting…",
  host: "👑 Host",
  myDirection: "What do you want to learn?",
  myDirectionHint: "Everyone picks their own – you'll get your words in this direction.",
  mix: "🎲 Mixed",
  rules: "Game rules",
  hostDecides: "(set by the host)",
  category: "Category",
  all: "🌍 Everything",
  cat_food: "Food & drinks",
  cat_animals: "Animals",
  cat_travel: "Travel",
  cat_daily: "Everyday life",
  cat_party: "Party & feelings",
  cat_body: "Body & health",
  answers: "Answers",
  modeType: "⌨️ Type it (pro)",
  modeChoice: "🅰️ Multiple choice (−1 pt)",
  playTo: "Play to",
  nPoints: "{n} points",
  start: "Let's go! 🚀",
  waitingOpponent: "Waiting for opponent…",
  waitHost: "Waiting for the host to start… ⏳",
  picking: "{name} is picking a nasty word…",
  getReady: "Get ready. Fingers on the keyboard. 🫣",
  youAreQuizmaster: "You're the quizmaster! 🎤",
  pickFor: "Pick a card for {name}. More 🌶️ = more points if they get it right.",
  translates: "{name} translates",
  upTo: "up to {n} pts",
  trashTalk: "Optional: a little trash talk 😈",
  taunt1: "You'll NEVER get this 😈",
  taunt2: "Easy peasy… right? 🍋",
  taunt3: "Even my grandma knows this one 👵",
  taunt4: "I believe in you! (not) 🙃",
  taunt5: "Good luck, you'll need it 🍀",
  taunt6: "Hehe. 😏",
  solution: "Answer:",
  hintWasUsed: "💡 Hint was used!",
  typesLive: "{name} is typing live:",
  thinking: "{name} is thinking…",
  sitBack: "Sit back and enjoy the sweating. 🍿",
  inLang: "In {lang}…",
  submit: "Submit ✨",
  buyHint: "💡 Buy a hint (−1 pt)",
  tolerance: "Accents don't matter, articles optional, 1 typo forgiven.",
  lang_en: "English",
  lang_es: "Spanish",
  v_correct: "¡Olé! Correct!",
  v_close: "Close enough, counts!",
  v_wrong: "Ouch! Wrong.",
  v_timeout: "Time's up!",
  youTyped: "You typed:",
  theyTyped: "They typed:",
  youGet: "You get +{n}",
  theyGet: "{name} gets +{n}",
  point: "point",
  points: "points",
  streakBonus: "(🔥 streak bonus!)",
  meanQuestion: "for the nasty question 😈",
  next: "Next ({n}) →",
  swap: "Swap roles! 🔄",
  youWon: "You won!",
  champWins: "{name} wins!",
  legend: "Vocab legend. Absolute icon. 👑",
  nextTime: "Next time! A rematch is just one click away. 💪",
  rematch: "Rematch! 🔁",
  err_needName: "Please enter a name.",
  err_roomNotFound: "This room doesn't exist (anymore). 🕳️",
  err_notInRoom: "You're not in this room.",
  err_roomFull: "This room is full. Two's a party, three's chaos. 🙅",
  err_hostOnly: "Only the host can do that.",
  err_waitOpponent: "Wait for your opponent!",
  err_notYourTurn: "It's not your turn.",
  err_notYourCard: "You don't have that card.",
  err_unknown: "Oops, something went wrong.",
};

const es: Record<MsgKey, string> = {
  tagline: "El duelo de vocabulario para dos. Tú haces las preguntas, tu rival suda. 💦",
  ticker1: "🌮 turtle = la tortuga",
  ticker2: "🔥 Racha de 3 = punto extra",
  ticker3: "😈 Se permite picar al rival",
  ticker4: "🦙 el perro ≠ la perra (¡ojo!)",
  ticker5: "⏰ 20 segundos por palabra",
  ticker6: "🌶️ Palabras picantes = más puntos",
  newGame: "Nueva partida 🎤",
  newGameText: "Abre una sala y comparte el código.",
  createRoom: "Crear sala →",
  join: "Unirse 🚪",
  joinText: "¿Te han pasado un código?",
  go: "¡Vamos!",
  needName: "Primero escribe un nombre 😉",
  step: "Paso {n}:",
  step1: "El quizmaster saca 3 cartas y elige la más malvada.",
  step2: "El adivino tiene 20 segundos. El quizmaster ve en directo lo que escribe.",
  step3: "Acierto = puntos para el adivino, fallo = un punto para el quizmaster. ¡Luego se cambian los papeles!",
  yourName: "Tu nombre",
  namePlaceholder: "p. ej. Mister Vocab",
  yourAvatar: "Tu avatar",
  backHome: "Volver al inicio",
  you: "(tú)",
  offline: "desconectado",
  quizmaster: "🎤 Quizmaster",
  guesser: "🧠 Adivino",
  challenged: "¡Te han retado! ⚔️",
  roomWaiting: "La sala {code} te está esperando.",
  accept: "¡Acepto el reto! 💪",
  difficulty: "Dificultad {n}",
  roomCode: "Código de sala",
  copied: "¡Copiado! ✅",
  copyInvite: "🔗 Copiar enlace de invitación",
  waiting: "Esperando…",
  host: "👑 Anfitrión",
  myDirection: "¿Qué quieres aprender?",
  myDirectionHint: "Cada uno elige lo suyo: recibirás tus palabras en esta dirección.",
  mix: "🎲 Mezclado",
  rules: "Reglas",
  hostDecides: "(las decide el anfitrión)",
  category: "Categoría",
  all: "🌍 Todo",
  cat_food: "Comida y bebida",
  cat_animals: "Animales",
  cat_travel: "Viajes",
  cat_daily: "Día a día",
  cat_party: "Fiesta y emociones",
  cat_body: "Cuerpo y salud",
  answers: "Respuestas",
  modeType: "⌨️ Escribir (pro)",
  modeChoice: "🅰️ Opción múltiple (−1 pt)",
  playTo: "Jugar hasta",
  nPoints: "{n} puntos",
  start: "¡A jugar! 🚀",
  waitingOpponent: "Esperando al rival…",
  waitHost: "Esperando a que el anfitrión empiece… ⏳",
  picking: "{name} está eligiendo una palabra malvada…",
  getReady: "Prepárate. Dedos al teclado. 🫣",
  youAreQuizmaster: "¡Eres el quizmaster! 🎤",
  pickFor: "Elige una carta para {name}. Más 🌶️ = más puntos si acierta.",
  translates: "{name} traduce",
  upTo: "hasta {n} pts",
  trashTalk: "Opcional: un poco de pique 😈",
  taunt1: "Esto NO lo sacas 😈",
  taunt2: "Pan comido… ¿o no? 🍋",
  taunt3: "Hasta mi abuela se la sabe 👵",
  taunt4: "¡Confío en ti! (no) 🙃",
  taunt5: "Suerte, la vas a necesitar 🍀",
  taunt6: "Jeje. 😏",
  solution: "Solución:",
  hintWasUsed: "💡 ¡Ha usado una pista!",
  typesLive: "{name} escribe en directo:",
  thinking: "{name} está pensando…",
  sitBack: "Relájate y disfruta del sufrimiento. 🍿",
  inLang: "En {lang}…",
  submit: "Enviar ✨",
  buyHint: "💡 Comprar pista (−1 pt)",
  tolerance: "Tildes da igual, artículo opcional, se perdona 1 errata.",
  lang_en: "inglés",
  lang_es: "español",
  v_correct: "¡Olé! ¡Correcto!",
  v_close: "¡Por los pelos, pero vale!",
  v_wrong: "¡Ay! Fallo.",
  v_timeout: "¡Se acabó el tiempo!",
  youTyped: "Escribiste:",
  theyTyped: "Escribió:",
  youGet: "Ganas +{n}",
  theyGet: "{name} gana +{n}",
  point: "punto",
  points: "puntos",
  streakBonus: "(🔥 ¡bonus por racha!)",
  meanQuestion: "por la pregunta malvada 😈",
  next: "Siguiente ({n}) →",
  swap: "¡Cambio de papeles! 🔄",
  youWon: "¡Has ganado!",
  champWins: "¡Gana {name}!",
  legend: "Leyenda del vocabulario. Un crack. 👑",
  nextTime: "¡La próxima vez! La revancha está a un clic. 💪",
  rematch: "¡Revancha! 🔁",
  err_needName: "Escribe un nombre, por favor.",
  err_roomNotFound: "Esta sala no existe (ya). 🕳️",
  err_notInRoom: "No estás en esta sala.",
  err_roomFull: "La sala está llena. Dos son fiesta, tres son caos. 🙅",
  err_hostOnly: "Solo el anfitrión puede hacer eso.",
  err_waitOpponent: "¡Espera a tu rival!",
  err_notYourTurn: "Ahora no te toca.",
  err_notYourCard: "No tienes esa carta.",
  err_unknown: "Uy, algo salió mal.",
};

const DICTS: Record<Locale, Record<MsgKey, string>> = { de, en, es };

export type T = (key: MsgKey, vars?: Record<string, string | number>) => string;

type I18n = { locale: Locale; setLocale: (l: Locale) => void; t: T };

const I18nContext = createContext<I18n | null>(null);
const STORAGE_KEY = "vokabattle-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("de");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const browser = navigator.language.slice(0, 2) as Locale;
    const initial = saved && saved in DICTS ? saved : browser in DICTS ? browser : "de";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const t = useCallback<T>(
    (key, vars) => {
      let s = DICTS[locale][key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Translate a server error code, falling back to the generic message. */
export function errorText(t: T, code: string) {
  const key = `err_${code}` as MsgKey;
  return key in de ? t(key) : t("err_unknown");
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="brut-sm flex overflow-hidden bg-white">
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          title={l.label}
          aria-label={l.label}
          aria-pressed={locale === l.id}
          className={`px-2.5 py-1 font-black transition-colors ${locale === l.id ? "bg-lemon" : "hover:bg-cream"}`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
