# 💕 Countdown Love Website

Un site web romantique de compte à rebours jusqu'aux retrouvailles, avec citations quotidiennes et système de likes.

![Version](https://img.shields.io/badge/Version-1.0.1-red?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Fonctionnalités

### 💖 Interface Utilisateur
- **Compte à rebours en temps réel** jusqu'à la date de retrouvailles (jours, heures, minutes, secondes)
- **Citation quotidienne** avec logique inversée (J-1, J-2, etc.)
- **Système de likes** pour chaque citation avec horodatage
- **Message spécial** personnalisé le jour des retrouvailles
- **Barre de progression** visuelle du temps écoulé
- **Gestion des citations vides** avec message par défaut mignon
- **Design élégant** avec thème sombre et animations fluides
- **Responsive design** optimisé pour tous les appareils

### 🛠️ Panneau d'Administration
- **Authentification sécurisée** par mot de passe crypté
- **Génération automatique** de citations vides basée sur la date de retrouvailles
- **Édition inline** des citations existantes avec interface intuitive
- **Gestion complète** des citations (ajouter, modifier, supprimer, réorganiser)
- **Statistiques des likes** en temps réel avec dernière activité
- **Configuration** de la date de retrouvailles et du message final
- **Changement de mot de passe** administrateur sécurisé
- **Codes couleur** pour l'état des citations (aimée, vide, normale)

### 🔧 Fonctionnalités Techniques
- **Sauvegarde JSON** persistante de tous les paramètres
- **Server Actions** Next.js 15 pour la gestion des données côté serveur
- **Calcul intelligent** des jours basé sur les jours calendaires
- **Horodatage précis** des likes et activités utilisateur
- **Interface de debug** pour le développement
- **Gestion d'erreurs** robuste avec fallbacks

## 🚀 Installation

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**

### Étapes d'installation

1. **Cloner le repository**
```
git clone https://github.com/Aprilox/countdown-love.git
cd countdown-love
```

2. **Installer les dépendances**
```
npm install
# ou
yarn install
```

3. **Créer le dossier de données**
```
mkdir data
```

4. **Lancer en mode développement**
```
npm run dev
# ou
yarn dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
countdown-love/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Interface d'administration
│   ├── actions.ts                # Server Actions (CRUD, auth)
│   ├── globals.css               # Styles globaux Tailwind
│   ├── layout.tsx                # Layout principal avec metadata
│   └── page.tsx                  # Page d'accueil avec compte à rebours
├── components/
│   ├── ui/                       # Composants shadcn/ui réutilisables
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── theme-provider.tsx        # Provider de thème dark/light
├── data/
│   └── settings.json             # Base de données JSON (auto-générée)
├── lib/
│   ├── settings.ts               # Types TypeScript et configurations
│   └── utils.ts                  # Utilitaires (cn, etc.)
├── public/
│   └── favicon.ico               # Favicon personnalisé (cœur rouge)
├── package.json                  # Dépendances et scripts
├── tailwind.config.ts            # Configuration Tailwind CSS
├── tsconfig.json                 # Configuration TypeScript
└── README.md                     # Documentation du projet
```

## ⚙️ Configuration

### Première utilisation

1. **Accéder au panneau d'administration**
   - Aller sur `http://localhost:3000/admin`
   - Mot de passe par défaut : `admin123`

2. **Configurer le compte à rebours**
   - Définir la date de retrouvailles (format YYYY-MM-DDTHH:MM)
   - Personnaliser le message final
   - Générer les citations vides automatiquement

3. **Personnaliser les citations**
   - Cliquer sur chaque citation pour l'éditer
   - Ajouter texte, auteur et URL d'image
   - Sauvegarder les modifications

### Configuration avancée

#### Structure des données
```typescript
interface Settings {
  reunionDate: string           // Date de retrouvailles (ISO)
  quotes: Quote[]              // Liste des citations
  finalMessage: string         // Message de retrouvailles
  adminPassword: string        // Mot de passe admin
  likes: QuoteLike[]          // Likes des utilisateurs
}

interface Quote {
  id: number
  text: string
  author: string
  order: number
  image?: string
}
```

## 🎮 Utilisation

### Pour les Utilisateurs
1. **Consulter le compte à rebours** en temps réel jusqu'aux retrouvailles
2. **Découvrir la citation quotidienne** selon la logique inversée (J-1, J-2...)
3. **Liker les citations** préférées (persistance automatique)
4. **Suivre la progression** avec la barre de progression visuelle
5. **Profiter du message spécial** le jour des retrouvailles

### Pour les Administrateurs
1. **Se connecter** au panneau admin (`/admin`)
2. **Configurer** la date de retrouvailles et le message final
3. **Générer automatiquement** toutes les citations nécessaires
4. **Éditer chaque citation** individuellement avec prévisualisation
5. **Suivre les statistiques** de likes en temps réel
6. **Gérer les paramètres** de sécurité et mot de passe

## 🎨 Personnalisation

### Logique des Citations
| Situation | Citation Affichée | Exemple |
|-----------|-------------------|---------|
| J-1 | Dernière citation (ordre 1) | "Demain nous nous retrouvons..." |
| J-2 | Avant-dernière (ordre 2) | "Plus qu'un jour après aujourd'hui..." |
| J-N | Citation N | "Dans N jours nous serons réunis..." |

### Couleurs et Thème
```css
/* Palette romantique */
:root {
  --love-red: #dc2626, #b91c1c;
  --love-pink: #ec4899, #db2777;
  --dark-bg: #1f2937, #111827;
  --success-green: #10b981, #059669;
}
```

### Responsive Design
| Écran | Optimisation | Breakpoint |
|-------|--------------|------------|
| Mobile | Interface tactile, texte adapté | < 640px |
| Tablette | Équilibre taille/lisibilité | 640px - 1024px |
| Desktop | Affichage optimal complet | > 1024px |

## 🛡️ Sécurité

- **Authentification** par mot de passe hashé pour l'admin
- **Validation** stricte des données côté serveur avec Zod
- **Sanitisation** des entrées utilisateur (protection XSS)
- **Séparation** claire des données publiques/privées
- **TypeScript** strict pour éviter les erreurs de type
- **Server Actions** sécurisées avec Next.js 15

## 🔄 API / Actions Serveur

### Actions Principales (Public)
```typescript
loadSettings(): Promise<PublicSettings>           // Charger config publique
toggleQuoteLike(quoteId: number): Promise<void>   // Toggle like citation
```

### Actions Admin (Authentifiées)
```typescript
authenticateAdmin(password: string): Promise<boolean>
updateQuote(id: number, text: string, author: string, image?: string): Promise<void>
updateReunionDate(date: string): Promise<void>
updateFinalMessage(message: string): Promise<void>
generateEmptyQuotes(): Promise<void>
updateAdminPassword(oldPassword: string, newPassword: string): Promise<boolean>
```

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Build et déploiement
npm run build
npx vercel --prod

# Ou avec l'interface Vercel
# 1. Connecter le repository GitHub
# 2. Déployer automatiquement
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
```

### Variables d'environnement
```bash
# Production (optionnel)
NODE_ENV=production

# Personnalisation (optionnel)
NEXT_PUBLIC_APP_NAME="Mon Site d'Amour"
```

## 🧪 Tests et Développement

### Scripts disponibles
```bash
npm run dev      # Développement avec hot-reload
npm run build    # Build de production
npm run start    # Démarrage en production
npm run lint     # Vérification ESLint
```

### Mode Développement
- **Hot reload** automatique
- **Logs détaillés** des actions serveur
- **Validation TypeScript** en temps réel
- **Debug** du calcul des jours

## 🤝 Contribution

1. **Fork** le projet sur GitHub
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add: AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Merge Request

### Standards de code
- **TypeScript** strict activé
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage (optionnel)
- **Commits conventionnels** recommandés

## 📦 Technologies Utilisées

### Core Framework
- **Next.js** `15.2.4` - Framework React full-stack
- **React** `18.2.0` - Bibliothèque UI
- **TypeScript** `^5` - Typage statique
- **Tailwind CSS** `^3.4.17` - Framework CSS utility-first

### UI Components
- **Radix UI** `1.1.x - 2.2.x` - Composants accessibles headless
- **Lucide React** `^0.454.0` - Icônes SVG
- **next-themes** `^0.4.4` - Gestion des thèmes
- **class-variance-authority** `^0.7.1` - Variants de composants

### Form & Validation
- **react-hook-form** `^7.54.1` - Gestion des formulaires
- **@hookform/resolvers** `^3.9.1` - Résolveurs de validation
- **zod** `^3.24.1` - Validation de schémas

### Date & Time
- **date-fns** `3.6.0` - Manipulation des dates

### UI Enhancements
- **sonner** `^1.7.1` - Notifications toast
- **cmdk** `1.0.4` - Interface de commande
- **vaul** `^0.9.6` - Drawer mobile

### Utilities
- **clsx** `^2.1.1` - Utilitaire de classes conditionnelles
- **tailwind-merge** `^2.5.5` - Fusion intelligente de classes Tailwind
- **tailwindcss-animate** `^1.0.7` - Animations Tailwind

## 📝 Changelog

### v1.0.1 (2025-01-23)
- ✨ **Add**: Génération automatique de citations vides
- ✨ **Add**: Édition inline des citations
- ✨ **Add**: Système de likes avec horodatage
- ✨ **Add**: Calcul précis des jours calendaires
- ✨ **Add**: Interface d'administration complète
- 🐛 **Fix**: Correction des problèmes de compatibilité React 18
- 🐛 **Fix**: Logique de progression des citations
- 🔧 **Fix**: Compatibilité date-fns 3.6.0

### v1.0.0
- 🎉 **Initial**: Site de compte à rebours romantique
- 💕 **Add**: Citations quotidiennes avec logique inversée
- 👨‍💼 **Add**: Panneau d'administration sécurisé
- 📱 **Add**: Design responsive élégant
- 🔄 **Add**: Sauvegarde JSON persistante

## 🐛 Problèmes Connus

- ⚠️ Les citations peuvent ne pas changer immédiatement à l'heure (cache navigateur)
- ⚠️ Les images externes peuvent ne pas s'afficher si CORS bloqué
- ⚠️ Le calcul des jours peut varier selon le fuseau horaire

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Aprilox** - [GitHub](https://github.com/Aprilox)

Créé avec ❤️ pour l'amour

---

## 🆘 Support

Pour toute question ou problème :

1. 📋 Consulter les [Issues GitHub](https://github.com/Aprilox/countdown-love/issues)
2. 🆕 Créer une nouvelle issue si nécessaire
3. 📖 Consulter cette documentation
4. 💬 Contacter [@Aprilox](https://github.com/Aprilox)

---

## 🔗 Liens Utiles

- **Repository GitHub**: https://github.com/Aprilox/countdown-love
- **Documentation Next.js**: https://nextjs.org/docs
- **Documentation Radix UI**: https://www.radix-ui.com/
- **Documentation Tailwind CSS**: https://tailwindcss.com/docs

---

**💕 Fait avec amour pour l'amour ! 💖**

*Que ce site apporte de la magie à votre attente des retrouvailles !* ✨