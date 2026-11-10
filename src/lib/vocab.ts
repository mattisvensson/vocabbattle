export type Vocab = {
  id: string;
  en: string;
  es: string;
  emoji: string;
  /** 1 = easy, 2 = medium, 3 = spicy */
  level: 1 | 2 | 3;
  category: CategoryId;
};

export type CategoryId = "food" | "animals" | "travel" | "daily" | "party" | "body";

/** Labels are translated in i18n (`cat_<id>`). */
export const CATEGORIES: { id: CategoryId; emoji: string }[] = [
  { id: "food", emoji: "🌮" },
  { id: "animals", emoji: "🦙" },
  { id: "travel", emoji: "✈️" },
  { id: "daily", emoji: "🏠" },
  { id: "party", emoji: "🎉" },
  { id: "body", emoji: "💪" },
];

type Raw = [en: string, es: string, emoji: string, level: 1 | 2 | 3];

const RAW: Record<CategoryId, Raw[]> = {
  food: [
    ["apple", "la manzana", "🍎", 1],
    ["bread", "el pan", "🍞", 1],
    ["water", "el agua", "💧", 1],
    ["cheese", "el queso", "🧀", 1],
    ["egg", "el huevo", "🥚", 1],
    ["milk", "la leche", "🥛", 1],
    ["chicken", "el pollo", "🍗", 2],
    ["strawberry", "la fresa", "🍓", 2],
    ["onion", "la cebolla", "🧅", 2],
    ["garlic", "el ajo", "🧄", 2],
    ["breakfast", "el desayuno", "🥞", 2],
    ["spoon", "la cuchara", "🥄", 2],
    ["mushroom", "el champiñón", "🍄", 3],
    ["pineapple", "la piña", "🍍", 3],
    ["corn", "el maíz", "🌽", 3],
    ["shrimp", "la gamba", "🦐", 3],
    ["to be hungry", "tener hambre", "😋", 3],
  ],
  animals: [
    ["dog", "el perro", "🐶", 1],
    ["cat", "el gato", "🐱", 1],
    ["fish", "el pez", "🐟", 1],
    ["bird", "el pájaro", "🐦", 1],
    ["horse", "el caballo", "🐴", 1],
    ["cow", "la vaca", "🐮", 1],
    ["pig", "el cerdo", "🐷", 2],
    ["rabbit", "el conejo", "🐰", 2],
    ["monkey", "el mono", "🐵", 2],
    ["turtle", "la tortuga", "🐢", 2],
    ["bee", "la abeja", "🐝", 2],
    ["snake", "la serpiente", "🐍", 2],
    ["squirrel", "la ardilla", "🐿️", 3],
    ["owl", "el búho", "🦉", 3],
    ["snail", "el caracol", "🐌", 3],
    ["bat", "el murciélago", "🦇", 3],
    ["jellyfish", "la medusa", "🪼", 3],
  ],
  travel: [
    ["beach", "la playa", "🏖️", 1],
    ["car", "el coche", "🚗", 1],
    ["hotel", "el hotel", "🏨", 1],
    ["train", "el tren", "🚆", 1],
    ["street", "la calle", "🛣️", 1],
    ["airport", "el aeropuerto", "🛫", 2],
    ["suitcase", "la maleta", "🧳", 2],
    ["ticket", "el billete", "🎫", 2],
    ["map", "el mapa", "🗺️", 2],
    ["mountain", "la montaña", "⛰️", 2],
    ["island", "la isla", "🏝️", 2],
    ["passport", "el pasaporte", "🛂", 2],
    ["sunscreen", "el protector solar", "🧴", 3],
    ["delay", "el retraso", "⏳", 3],
    ["lighthouse", "el faro", "🗼", 3],
    ["to get lost", "perderse", "🤷", 3],
  ],
  daily: [
    ["house", "la casa", "🏠", 1],
    ["book", "el libro", "📖", 1],
    ["friend", "el amigo", "🧑‍🤝‍🧑", 1],
    ["door", "la puerta", "🚪", 1],
    ["bed", "la cama", "🛏️", 1],
    ["money", "el dinero", "💸", 1],
    ["key", "la llave", "🔑", 2],
    ["window", "la ventana", "🪟", 2],
    ["chair", "la silla", "🪑", 2],
    ["clock", "el reloj", "⏰", 2],
    ["umbrella", "el paraguas", "☂️", 2],
    ["mirror", "el espejo", "🪞", 3],
    ["washing machine", "la lavadora", "🧺", 3],
    ["to wake up", "despertarse", "🥱", 3],
    ["broom", "la escoba", "🧹", 3],
    ["neighbour", "el vecino", "🏘️", 3],
  ],
  party: [
    ["happy", "feliz", "😄", 1],
    ["sad", "triste", "😢", 1],
    ["music", "la música", "🎵", 1],
    ["to dance", "bailar", "💃", 1],
    ["party", "la fiesta", "🎉", 1],
    ["love", "el amor", "❤️", 1],
    ["gift", "el regalo", "🎁", 2],
    ["tired", "cansado", "😴", 2],
    ["angry", "enfadado", "😠", 2],
    ["birthday", "el cumpleaños", "🎂", 2],
    ["to laugh", "reír", "😂", 2],
    ["hangover", "la resaca", "🤕", 3],
    ["embarrassed", "avergonzado", "😳", 3],
    ["fireworks", "los fuegos artificiales", "🎆", 3],
    ["to get bored", "aburrirse", "🥱", 3],
    ["cheers!", "¡salud!", "🥂", 2],
  ],
  body: [
    ["hand", "la mano", "✋", 1],
    ["eye", "el ojo", "👁️", 1],
    ["head", "la cabeza", "🧠", 1],
    ["nose", "la nariz", "👃", 1],
    ["mouth", "la boca", "👄", 1],
    ["foot", "el pie", "🦶", 2],
    ["tooth", "el diente", "🦷", 2],
    ["ear", "la oreja", "👂", 2],
    ["heart", "el corazón", "🫀", 2],
    ["doctor", "el médico", "🧑‍⚕️", 2],
    ["knee", "la rodilla", "🦵", 3],
    ["elbow", "el codo", "💪", 3],
    ["to sneeze", "estornudar", "🤧", 3],
    ["eyebrow", "la ceja", "🤨", 3],
    ["fever", "la fiebre", "🤒", 3],
  ],
};

export const VOCAB: Vocab[] = (Object.keys(RAW) as CategoryId[]).flatMap((category) =>
  RAW[category].map(([en, es, emoji, level], i) => ({
    id: `${category}-${i}`,
    en,
    es,
    emoji,
    level,
    category,
  })),
);

export const VOCAB_BY_ID = new Map(VOCAB.map((v) => [v.id, v]));
