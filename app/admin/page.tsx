"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calendar,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Key,
  Info,
  Heart,
  ThumbsUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  saveSettings,
  loadSettings,
  authenticateAdmin,
  updateAdminPassword,
  generateEmptyQuotes,
  updateQuote,
} from "../actions"
import { type Settings, type Quote, defaultSettings } from "@/lib/settings"

type PublicSettings = typeof defaultSettings

interface AdminPanelProps {
  settings?: PublicSettings
  onSettingsUpdate?: (settings: PublicSettings) => void
  onClose?: () => void
}

export default function AdminPanel({ settings: propSettings, onSettingsUpdate, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [localSettings, setLocalSettings] = useState<PublicSettings>(propSettings || defaultSettings)
  const [newQuote, setNewQuote] = useState({ text: "", author: "", image: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [editingQuote, setEditingQuote] = useState<{ id: number; text: string; author: string; image: string } | null>(
    null,
  )
  const [isGenerating, setIsGenerating] = useState(false)

  // Calculer le nombre de jours jusqu'aux retrouvailles
  const daysUntilReunion = Math.ceil(
    (new Date(localSettings.reunionDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  // Charger les paramètres au démarrage
  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const loadedSettings = await loadSettings()
        setLocalSettings(loadedSettings)
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
      }
    }

    if (!propSettings) {
      loadInitialSettings()
    }
  }, [propSettings])

  const handleLogin = async () => {
    try {
      const isValid = await authenticateAdmin(password)
      if (isValid) {
        setIsAuthenticated(true)
      } else {
        alert("Mot de passe incorrect !")
      }
    } catch (error) {
      alert("Erreur lors de l'authentification !")
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !")
      return
    }

    if (newPassword.length < 4) {
      alert("Le mot de passe doit contenir au moins 4 caractères !")
      return
    }

    try {
      const success = await updateAdminPassword(password, newPassword)
      if (success) {
        alert("Mot de passe changé avec succès !")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert("Erreur lors du changement de mot de passe !")
      }
    } catch (error) {
      alert("Erreur lors du changement de mot de passe !")
    }
  }

  const handleGenerateQuotes = async () => {
    if (!localSettings.reunionDate) {
      alert("Veuillez d'abord définir une date de retrouvailles !")
      return
    }

    const confirmGenerate = confirm(
      "Cela va remplacer toutes les citations existantes par des citations vides. Êtes-vous sûr?",
    )

    if (!confirmGenerate) return

    setIsGenerating(true)
    try {
      await generateEmptyQuotes(localSettings.reunionDate)
      // Recharger les settings
      const updatedSettings = await loadSettings()
      setLocalSettings(updatedSettings)
      alert("Citations générées avec succès !")
    } catch (error) {
      alert("Erreur lors de la génération des citations !")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveEditedQuote = async () => {
    if (!editingQuote) return

    try {
      await updateQuote(editingQuote.id, editingQuote.text, editingQuote.author, editingQuote.image)

      // Mettre à jour les settings locaux
      const updatedQuotes = localSettings.quotes.map((quote) =>
        quote.id === editingQuote.id
          ? { ...quote, text: editingQuote.text, author: editingQuote.author, image: editingQuote.image || undefined }
          : quote,
      )

      setLocalSettings({ ...localSettings, quotes: updatedQuotes })
      setEditingQuote(null)
      alert("Citation mise à jour avec succès !")
    } catch (error) {
      alert("Erreur lors de la mise à jour !")
      console.error(error)
    }
  }

  const handleAddQuote = () => {
    if (newQuote.text && newQuote.author) {
      const maxOrder = Math.max(...localSettings.quotes.map((q) => q.order), 0)
      const quote: Quote = {
        id: Math.max(...localSettings.quotes.map((q) => q.id), 0) + 1,
        text: newQuote.text,
        author: newQuote.author,
        image: newQuote.image || undefined,
        order: maxOrder + 1,
      }

      setLocalSettings({
        ...localSettings,
        quotes: [...localSettings.quotes, quote],
      })

      setNewQuote({ text: "", author: "", image: "" })
    }
  }

  const handleDeleteQuote = (id: number) => {
    const updatedQuotes = localSettings.quotes.filter((q) => q.id !== id)
    // Réorganiser les ordres après suppression
    const reorderedQuotes = updatedQuotes.map((quote, index) => ({
      ...quote,
      order: index + 1,
    }))

    setLocalSettings({
      ...localSettings,
      quotes: reorderedQuotes,
    })
  }

  const handleMoveQuote = (id: number, direction: "up" | "down") => {
    const sortedQuotes = [...localSettings.quotes].sort((a, b) => a.order - b.order)
    const currentIndex = sortedQuotes.findIndex((q) => q.id === id)

    if (direction === "up" && currentIndex > 0) {
      // Échanger avec l'élément précédent
      const temp = sortedQuotes[currentIndex].order
      sortedQuotes[currentIndex].order = sortedQuotes[currentIndex - 1].order
      sortedQuotes[currentIndex - 1].order = temp
    } else if (direction === "down" && currentIndex < sortedQuotes.length - 1) {
      // Échanger avec l'élément suivant
      const temp = sortedQuotes[currentIndex].order
      sortedQuotes[currentIndex].order = sortedQuotes[currentIndex + 1].order
      sortedQuotes[currentIndex + 1].order = temp
    }

    setLocalSettings({
      ...localSettings,
      quotes: sortedQuotes,
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Reconstituer les settings complets avec le mot de passe actuel
      const fullSettings: Settings = {
        ...localSettings,
        adminPassword: password, // Utiliser le mot de passe de connexion actuel
      }

      await saveSettings(fullSettings)
      if (onSettingsUpdate) {
        onSettingsUpdate(localSettings)
      }
      alert("Paramètres sauvegardés avec succès !")
    } catch (error) {
      alert("Erreur lors de la sauvegarde !")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDateChange = (date: string) => {
    setLocalSettings({
      ...localSettings,
      reunionDate: date,
    })
  }

  const handleFinalMessageChange = (message: string) => {
    setLocalSettings({
      ...localSettings,
      finalMessage: message,
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">Panneau d'Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Entrez le mot de passe"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1 bg-red-600 hover:bg-red-700">
                Se connecter
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedQuotes = [...localSettings.quotes].sort((a, b) => a.order - b.order)
  const likedQuotes = (localSettings.likes || []).filter((like) => like.liked)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-white">Panneau d'Administration</h1>
          <Button onClick={handleSave} disabled={isSaving} className="ml-auto bg-red-600 hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>

        {/* Statistiques des likes */}
        <Card className="mb-6 bg-green-900/50 border-green-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-300 mb-1">Statistiques des likes</h4>
                <p className="text-sm text-green-200">
                  <strong>{likedQuotes.length}</strong> citation(s) aimée(s) sur{" "}
                  <strong>{localSettings.quotes.length}</strong> au total.
                  {likedQuotes.length > 0 && (
                    <>
                      <br />
                      Dernière activité :{" "}
                      {new Date(
                        Math.max(...likedQuotes.map((like) => new Date(like.likedAt).getTime())),
                      ).toLocaleDateString("fr-FR")}{" "}
                      à{" "}
                      {new Date(
                        Math.max(...likedQuotes.map((like) => new Date(like.likedAt).getTime())),
                      ).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info sur le calcul des jours */}
        <Card className="mb-6 bg-blue-900/50 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300 mb-1">Logique des citations</h4>
                <p className="text-sm text-blue-200">
                  <strong>Jour 1</strong> = dernier jour avant les retrouvailles, <strong>Jour 2</strong> =
                  avant-dernier jour, etc.
                  <br />
                  Il vous reste <strong>{daysUntilReunion > 0 ? daysUntilReunion : 0} jours</strong> jusqu'aux
                  retrouvailles.
                  {daysUntilReunion > 0 && (
                    <>
                      <br />
                      Vous pouvez créer jusqu'à <strong>{daysUntilReunion} citations</strong> (une par jour).
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration générale */}
          <div className="space-y-6">
            {/* Date de retrouvailles */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5" />
                  Date de Retrouvailles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="reunion-date" className="text-gray-300">
                    Date et heure
                  </Label>
                  <Input
                    id="reunion-date"
                    type="datetime-local"
                    value={localSettings.reunionDate.slice(0, 16)}
                    onChange={(e) => handleDateChange(e.target.value + ":00")}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    onClick={handleGenerateQuotes}
                    disabled={isGenerating}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? "Génération..." : "Générer citations automatiquement"}
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Crée une citation vide pour chaque jour jusqu'aux retrouvailles
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changer mot de passe */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Key className="w-5 h-5" />
                  Changer le mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-gray-300">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-gray-300">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button onClick={handlePasswordChange} className="w-full bg-red-600 hover:bg-red-700">
                  Changer le mot de passe
                </Button>
              </CardContent>
            </Card>

            {/* Message final */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5" />
                  Message du Jour J
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="final-message" className="text-gray-300">
                    Message spécial
                  </Label>
                  <Textarea
                    id="final-message"
                    value={localSettings.finalMessage}
                    onChange={(e) => handleFinalMessageChange(e.target.value)}
                    rows={4}
                    placeholder="Message qui s'affichera le jour des retrouvailles..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ajouter une citation */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5" />
                  Ajouter une Citation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quote-text" className="text-gray-300">
                    Texte de la citation
                  </Label>
                  <Textarea
                    id="quote-text"
                    value={newQuote.text}
                    onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                    placeholder="Entrez la citation..."
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="quote-author" className="text-gray-300">
                    Auteur
                  </Label>
                  <Input
                    id="quote-author"
                    value={newQuote.author}
                    onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                    placeholder="Nom de l'auteur"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="quote-image" className="text-gray-300">
                    URL de l'image (optionnel)
                  </Label>
                  <Input
                    id="quote-image"
                    value={newQuote.image}
                    onChange={(e) => setNewQuote({ ...newQuote, image: e.target.value })}
                    placeholder="https://..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button onClick={handleAddQuote} className="w-full bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la Citation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Liste des citations */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Citations ({localSettings.quotes.length})</CardTitle>
                <p className="text-sm text-gray-400">
                  <strong>Jour 1</strong> = dernier jour avant retrouvailles, <strong>Jour 2</strong> = avant-dernier
                  jour, etc.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sortedQuotes.map((quote, index) => {
                    const quoteLike = (localSettings.likes || []).find((like) => like.quoteId === quote.id)
                    const isLiked = quoteLike?.liked || false
                    const isEmpty = !quote.text.trim() || !quote.author.trim()
                    const isEditing = editingQuote?.id === quote.id

                    return (
                      <div
                        key={quote.id}
                        className={`p-4 border rounded-lg ${
                          isLiked
                            ? "bg-green-900/30 border-green-600"
                            : isEmpty
                              ? "bg-yellow-900/30 border-yellow-600"
                              : "bg-gray-700 border-gray-600"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-red-400">
                              Jour {quote.order} {quote.order === 1 && "(dernier jour)"}
                            </span>
                            {isEmpty && (
                              <span className="text-xs text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded">Vide</span>
                            )}
                            {isLiked && (
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-green-400">Aimé</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleMoveQuote(quote.id, "up")}
                              disabled={index === 0}
                              variant="outline"
                              size="sm"
                              className="p-1 h-8 w-8 border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleMoveQuote(quote.id, "down")}
                              disabled={index === sortedQuotes.length - 1}
                              variant="outline"
                              size="sm"
                              className="p-1 h-8 w-8 border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                setEditingQuote({
                                  id: quote.id,
                                  text: quote.text,
                                  author: quote.author,
                                  image: quote.image || "",
                                })
                              }
                              variant="outline"
                              size="sm"
                              className="p-1 h-8 w-8 border-gray-600 text-gray-300 hover:bg-gray-600"
                            >
                              ✏️
                            </Button>
                            <Button
                              onClick={() => handleDeleteQuote(quote.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-400 hover:text-red-300 border-gray-600 hover:bg-gray-600 p-1 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editingQuote.text}
                              onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                              placeholder="Texte de la citation..."
                              rows={3}
                              className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            />
                            <Input
                              value={editingQuote.author}
                              onChange={(e) => setEditingQuote({ ...editingQuote, author: e.target.value })}
                              placeholder="Auteur"
                              className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            />
                            <Input
                              value={editingQuote.image}
                              onChange={(e) => setEditingQuote({ ...editingQuote, image: e.target.value })}
                              placeholder="URL de l'image (optionnel)"
                              className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveEditedQuote}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Sauvegarder
                              </Button>
                              <Button
                                onClick={() => setEditingQuote(null)}
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300"
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isEmpty ? (
                              <p className="text-sm italic text-yellow-400">
                                Citation vide - Cliquez sur ✏️ pour éditer
                              </p>
                            ) : (
                              <>
                                <blockquote className="text-sm italic text-gray-300 mb-2">"{quote.text}"</blockquote>
                                <cite className="text-sm text-gray-400">— {quote.author}</cite>
                              </>
                            )}
                            {quoteLike?.liked && (
                              <p className="text-xs text-green-400 mt-2">
                                Aimé le {new Date(quoteLike.likedAt).toLocaleDateString("fr-FR")} à{" "}
                                {new Date(quoteLike.likedAt).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                            {quote.image && (
                              <div className="mt-2">
                                <img
                                  src={quote.image || "/placeholder.svg"}
                                  alt="Preview"
                                  className="w-full h-32 object-contain rounded border border-gray-600"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                  {localSettings.quotes.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Aucune citation ajoutée pour le moment.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
