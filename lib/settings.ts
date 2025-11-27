export interface Quote {
  id: number
  text: string
  author: string
  image?: string
  order: number
}

export interface QuoteLike {
  quoteId: number
  liked: boolean
  likedAt: string
}

export interface Settings {
  reunionDate: string
  quotes: Quote[]
  finalMessage: string
  adminPassword: string
  likes: QuoteLike[]
}

// Settings par défaut SANS le mot de passe (sécurité côté client)
export const defaultSettings: Omit<Settings, "adminPassword"> = {
  reunionDate: "2025-02-14T18:00:00",
  quotes: [
    {
      id: 1,
      text: "L'amour, c'est quand on se rencontre et qu'on se reconnaît.",
      author: "Françoise Sagan",
      order: 1,
    },
    {
      id: 2,
      text: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.",
      author: "Antoine de Saint-Exupéry",
      order: 2,
    },
    {
      id: 3,
      text: "Il n'y a qu'un bonheur dans la vie, c'est d'aimer et d'être aimé.",
      author: "George Sand",
      order: 3,
    },
  ],
  finalMessage:
    "Après tous ces jours d'attente, nous voilà enfin réunis. Tu es ma plus belle récompense. Je t'aime infiniment. 💖",
  likes: [],
}

// Settings complets UNIQUEMENT côté serveur
export const serverDefaultSettings: Settings = {
  ...defaultSettings,
  adminPassword: "admin123", // Seulement côté serveur
}
