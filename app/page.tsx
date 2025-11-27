"use client"

import { useState, useEffect } from "react"
import { Heart, Calendar, ThumbsUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { loadSettings, toggleQuoteLike } from "./actions"
import { type Quote, type QuoteLike, defaultSettings } from "@/lib/settings"

type PublicSettings = typeof defaultSettings

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings)
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)
  const [currentLike, setCurrentLike] = useState<QuoteLike | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)

  // Charger les paramètres au démarrage
  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const loadedSettings = await loadSettings()
        setSettings(loadedSettings)
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
        // Fallback vers localStorage
        const savedSettings = localStorage.getItem("countdown-settings")
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          // Supprimer le mot de passe s'il existe dans localStorage
          const { adminPassword, ...publicSettings } = parsed
          setSettings(publicSettings)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialSettings()
  }, [])

  // Calculer le compte à rebours
  useEffect(() => {
    if (isLoading) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const reunionDate = new Date(settings.reunionDate).getTime()
      const distance = reunionDate - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [settings.reunionDate, isLoading])

  // Calculer la citation du jour (logique inversée)
  useEffect(() => {
    if (isLoading) return

    const now = new Date()
    const reunionDate = new Date(settings.reunionDate)
    const sortedQuotes = [...settings.quotes].sort((a, b) => a.order - b.order)

    // Calculer combien de jours il reste
    const daysUntilReunion = Math.ceil((reunionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilReunion > 0 && daysUntilReunion <= sortedQuotes.length) {
      // Afficher la citation correspondant au nombre de jours restants
      // Jour 1 = dernier jour avant retrouvailles, Jour 2 = avant-dernier, etc.
      const quoteIndex = daysUntilReunion - 1
      const quote = sortedQuotes[quoteIndex]
      setCurrentQuote(quote)

      // Chercher le like correspondant
      const like = (settings.likes || []).find((l) => l.quoteId === quote.id)
      setCurrentLike(like || null)
    } else if (daysUntilReunion > sortedQuotes.length) {
      // Si on est trop loin, afficher la dernière citation (la plus éloignée)
      const quote = sortedQuotes[sortedQuotes.length - 1]
      setCurrentQuote(quote)
      const like = (settings.likes || []).find((l) => l.quoteId === quote.id)
      setCurrentLike(like || null)
    } else {
      // Si c'est le jour J ou après
      setCurrentQuote(null)
      setCurrentLike(null)
    }
  }, [settings, timeLeft, isLoading])

  const handleLike = async () => {
    if (!currentQuote || isLiking) return

    setIsLiking(true)
    try {
      const updatedLike = await toggleQuoteLike(currentQuote.id)
      setCurrentLike(updatedLike)

      // Mettre à jour les settings locaux
      const updatedSettings = { ...settings }
      if (!updatedSettings.likes) {
        updatedSettings.likes = []
      }
      const existingLikeIndex = updatedSettings.likes.findIndex((l) => l.quoteId === currentQuote.id)

      if (existingLikeIndex >= 0) {
        updatedSettings.likes[existingLikeIndex] = updatedLike
      } else {
        updatedSettings.likes.push(updatedLike)
      }

      setSettings(updatedSettings)
    } catch (error) {
      console.error("Erreur lors du like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const isReunionDay =
    !isLoading &&
    timeLeft.days <= 0 &&
    timeLeft.hours <= 0 &&
    timeLeft.minutes <= 0 &&
    timeLeft.seconds <= 0 &&
    new Date().getTime() >= new Date(settings.reunionDate).getTime()

  // Vérifier si la citation actuelle est vide
  const isCurrentQuoteEmpty = currentQuote && (!currentQuote.text.trim() || !currentQuote.author.trim())

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-8 h-8 text-red-400 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-400 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Nos Retrouvailles
            </h1>
            <Heart className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
          <p className="text-gray-400 text-lg">Quelques jours encore...</p>
        </div>

        {/* Countdown */}
        <Card className="mb-12 bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
          <CardContent className="p-8">
            {!isReunionDay ? (
              <>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Calendar className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-semibold text-white">Il nous reste</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                    <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.days}</div>
                    <div className="text-sm text-gray-300 mt-2">jours</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                    <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.hours}</div>
                    <div className="text-sm text-gray-300 mt-2">heures</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                    <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.minutes}</div>
                    <div className="text-sm text-gray-300 mt-2">minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 text-white p-6 rounded-xl">
                    <div className="text-4xl md:text-5xl font-bold text-red-400">{timeLeft.seconds}</div>
                    <div className="text-sm text-gray-300 mt-2">secondes</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-6">✨</div>
                <h2 className="text-4xl font-bold text-red-400 mb-6">Enfin réunis</h2>
                <p className="text-xl text-gray-300 mb-8">Le moment tant attendu est arrivé</p>
                <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600">
                  <p className="text-lg text-white">{settings.finalMessage}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Citation du jour */}
        {!isReunionDay && currentQuote && (
          <Card className="mb-8 bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-center mb-8 text-white">Pensée du jour</h3>
              <div className="text-center">
                {isCurrentQuoteEmpty ? (
                  // Message par défaut si la citation est vide
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💭</div>
                    <p className="text-xl text-gray-400 mb-4">Pas de citation aujourd'hui</p>
                    <p className="text-sm text-gray-500">Mais chaque jour qui passe nous rapproche un peu plus... 💕</p>
                  </div>
                ) : (
                  <>
                    <blockquote className="text-xl italic text-gray-300 mb-6 leading-relaxed">
                      "{currentQuote.text}"
                    </blockquote>
                    <cite className="text-red-400 font-medium text-lg">— {currentQuote.author}</cite>
                    {currentQuote.image && (
                      <div className="mt-8">
                        <img
                          src={currentQuote.image || "/placeholder.svg"}
                          alt="Image"
                          className="w-full max-w-2xl mx-auto rounded-xl shadow-lg object-contain max-h-96 border border-gray-600"
                        />
                      </div>
                    )}

                    {/* Bouton Like */}
                    <div className="mt-8 flex justify-center">
                      <Button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                          currentLike?.liked
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-5 h-5 transition-transform duration-300 ${
                            currentLike?.liked ? "scale-110" : ""
                          }`}
                        />
                        {isLiking ? "..." : currentLike?.liked ? "J'aime ♥" : "J'aime"}
                      </Button>
                    </div>

                    {currentLike?.liked && (
                      <p className="text-sm text-gray-400 mt-3">
                        Aimé le {new Date(currentLike.likedAt).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(currentLike.likedAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progression */}
        {!isReunionDay && currentQuote && timeLeft.days > 0 && (
          <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white mb-4">
                  {timeLeft.days === 1 ? "Dernier jour" : `J-${timeLeft.days}`}
                </h4>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-4">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, 100 - (timeLeft.days / settings.quotes.length) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  {settings.quotes.length - timeLeft.days + 1} / {settings.quotes.length}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-500">Fait avec</p>
            <Heart className="w-4 h-4 text-red-400" />
            <p className="text-gray-500">pour mon amour</p>
          </div>
        </div>
      </div>
    </div>
  )
}
