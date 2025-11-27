"use server"

import { promises as fs } from "fs"
import path from "path"
import { type Settings, type QuoteLike, serverDefaultSettings } from "@/lib/settings"

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json")

export async function loadSettings(): Promise<Omit<Settings, "adminPassword">> {
  try {
    const dataDir = path.dirname(SETTINGS_FILE)
    await fs.mkdir(dataDir, { recursive: true })

    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // S'assurer que les likes existent
    if (!settings.likes) {
      settings.likes = []
    }

    // Retourner les settings SANS le mot de passe
    const { adminPassword, ...publicSettings } = settings
    return publicSettings
  } catch (error) {
    // Si le fichier n'existe pas, créer avec les paramètres par défaut
    await saveSettings(serverDefaultSettings)
    const { adminPassword, ...publicSettings } = serverDefaultSettings
    return publicSettings
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    // S'assurer que les likes existent avant de sauvegarder
    if (!settings.likes) {
      settings.likes = []
    }

    const dataDir = path.dirname(SETTINGS_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error)
    throw new Error("Impossible de sauvegarder les paramètres")
  }
}

export async function generateEmptyQuotes(reunionDate: string): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Calculer le nombre de jours jusqu'aux retrouvailles
    const now = new Date()
    const reunion = new Date(reunionDate)
    const daysUntilReunion = Math.ceil((reunion.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilReunion <= 0) {
      throw new Error("La date de retrouvailles doit être dans le futur")
    }

    // Créer les citations vides
    const emptyQuotes = []
    for (let i = 1; i <= daysUntilReunion; i++) {
      emptyQuotes.push({
        id: i,
        text: "",
        author: "",
        order: i,
      })
    }

    // Remplacer toutes les citations par les nouvelles citations vides
    settings.quotes = emptyQuotes
    settings.reunionDate = reunionDate

    await saveSettings(settings)
  } catch (error) {
    console.error("Erreur lors de la génération des citations:", error)
    throw new Error("Impossible de générer les citations")
  }
}

export async function updateQuote(id: number, text: string, author: string, image?: string): Promise<void> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    const quoteIndex = settings.quotes.findIndex((q) => q.id === id)
    if (quoteIndex >= 0) {
      settings.quotes[quoteIndex] = {
        ...settings.quotes[quoteIndex],
        text,
        author,
        image: image || undefined,
      }
      await saveSettings(settings)
    } else {
      throw new Error("Citation non trouvée")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la citation:", error)
    throw new Error("Impossible de mettre à jour la citation")
  }
}

export async function toggleQuoteLike(quoteId: number): Promise<QuoteLike> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    // Chercher si le like existe déjà
    const existingLikeIndex = settings.likes.findIndex((like) => like.quoteId === quoteId)

    if (existingLikeIndex >= 0) {
      // Toggle le like existant
      settings.likes[existingLikeIndex].liked = !settings.likes[existingLikeIndex].liked
      settings.likes[existingLikeIndex].likedAt = new Date().toISOString()
    } else {
      // Créer un nouveau like
      settings.likes.push({
        quoteId,
        liked: true,
        likedAt: new Date().toISOString(),
      })
    }

    await saveSettings(settings)
    return settings.likes.find((like) => like.quoteId === quoteId)!
  } catch (error) {
    console.error("Erreur lors du toggle like:", error)
    throw new Error("Impossible de sauvegarder le like")
  }
}

export async function authenticateAdmin(password: string): Promise<boolean> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)
    return settings.adminPassword === password
  } catch (error) {
    // Si le fichier n'existe pas, utiliser le mot de passe par défaut
    return password === serverDefaultSettings.adminPassword
  }
}

export async function updateAdminPassword(oldPassword: string, newPassword: string): Promise<boolean> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings: Settings = JSON.parse(data)

    if (settings.adminPassword !== oldPassword) {
      return false
    }

    settings.adminPassword = newPassword
    await saveSettings(settings)
    return true
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error)
    return false
  }
}
