# Music Blind Test

📖 **Description**  
Music Blind Test est une application web interactive développée avec Vue.js qui permet aux joueurs de tester leurs connaissances musicales. Le but du jeu est d'identifier correctement les artistes et titres de chansons dans un temps limité, à partir de playlists Deezer.

## ✨ Fonctionnalités

- **Sélection de thèmes musicaux**: Choisissez parmi différentes playlists Deezer (pop, rock, variété, etc.)
- **Différents modes de réponse**:
  - Artiste uniquement: Identifiez seulement l'artiste
  - Titre uniquement: Identifiez seulement le titre de la chanson
  - Les deux: L'un ou l'autre est accepté comme réponse correcte
- **Système de points dynamique**: Plus vous répondez vite, plus vous gagnez de points
- **Durée limitée**: 30 secondes par chanson pour trouver la bonne réponse
- **Visualisation des résultats**: Tableau récapitulatif des scores à la fin du jeu
- **Suivi de progression**: Affichage en temps réel de votre score et du nombre de chansons jouées

## 🛠️ Technologies utilisées

- Vue.js 3 avec la Composition API
- TypeScript pour le typage statique
- Vite comme outil de build
- Pinia pour la gestion d'état
- Vue Router pour la navigation
- Tailwind CSS pour l'interface
- API Deezer pour les playlists et extraits audio

## 📦 Structure du projet

```
src/
├── App.vue                # Composant racine
├── main.ts                # Point d'entrée de l'application
├── style.css              # Styles globaux avec Tailwind
├── assets/                # Ressources statiques
├── components/
│   ├── game/
│   │   ├── AnswerInput.vue     # Saisie des réponses
│   │   ├── MusicPlayer.vue     # Lecteur audio avec visualiseur
│   │   └── ThemeSelector.vue   # Sélecteur de thèmes musicaux
│   ├── layout/
│   │   └── AppHeader.vue       # En-tête de l'application
│   └── ui/
│       └── Modal.vue           # Composant modal réutilisable
├── router/
│   └── index.ts           # Configuration des routes
├── services/
│   └── deezerApi.ts       # Service pour l'API Deezer
├── stores/
│   └── gameStore.ts       # Store Pinia pour l'état du jeu
├── types/
│   └── index.ts           # Définitions des types TypeScript
└── views/
    ├── GameView.vue       # Vue du jeu principal
    ├── HomeView.vue       # Page d'accueil et paramètres
    └── VictoryView.vue    # Écran de fin de partie
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/lucasrebl/blind-test
cd blind-test

# Installer les dépendances
npm install
```

### Lancement en développement
```bash
npm run dev
```

### Construction pour la production
```bash
npm run build
```

## 🎮 Comment jouer

1. Sélectionnez un ou plusieurs thèmes musicaux depuis les playlists Deezer
2. Choisissez votre mode de réponse (artiste, titre ou les deux)
3. Définissez le nombre de points à atteindre pour gagner
4. Cliquez sur "Start Game"
5. Écoutez l'extrait musical et tapez votre réponse
6. Appuyez sur "Submit" ou la touche Entrée pour valider
7. Obtenez plus de points en répondant rapidement!
8. Atteignez le score cible pour gagner la partie

## 📝 Notes

- Le système de réponse est tolérant aux fautes mineures (90% de similarité requise)
- Les extraits musicaux durent 30 secondes maximum
- Le barème de points est dégressif: 10 points pour une réponse en moins de 3 secondes, jusqu'à 1 point minimum
- En cas de problème avec l'API Deezer, l'application essaie différents proxys CORS automatiquement

Amusez-vous bien et testez vos connaissances musicales!
