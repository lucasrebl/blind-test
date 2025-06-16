import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Theme, Song, GameSettings, GameResult } from '../types'

export const useGameStore = defineStore('game', () => {
  // Game settings
  const settings = ref<GameSettings>({
    maxPoints: 100,
    selectedThemeIds: [],
    answerMode: 'both'
  })

  // Available themes (playlists)
  const availableThemes = ref<Theme[]>([])
  
  // Current game state
  const currentSong = ref<Song | null>(null)
  const currentSongIndex = ref(0)
  const playlist = ref<Song[]>([])
  const scores = ref<GameResult[]>([])
  const isPlaying = ref(false)
  const timer = ref(30)
  const userAnswer = ref('')
  const timeIsUp = ref(false)
  const foundCorrectAnswer = ref(false)
  const correctAnswerTime = ref(0)
  
  // Keep only mute state
  const isMuted = ref(false)
  
  // Computed properties
  const selectedThemes = computed(() => {
    return availableThemes.value.filter(theme => 
      settings.value.selectedThemeIds.includes(theme.id)
    )
  })
  
  // Stocker les points temporairement pour les afficher plus tard
  const pendingScore = ref(0);
  const pendingResult = ref<GameResult | null>(null);
  
  // Modification du calcul du score total pour exclure les points en attente
  const totalScore = computed(() => {
    return scores.value.reduce((sum, result) => sum + result.score, 0)
  })
  
  const isGameOver = computed(() => {
    return totalScore.value >= settings.value.maxPoints || 
      (currentSongIndex.value === playlist.value.length && playlist.value.length > 0)
  })
  
  // Methods
  function updateSettings(newSettings: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...newSettings }
  }
  
  function setAvailableThemes(themes: Theme[]) {
    availableThemes.value = themes
  }
  
  function setSelectedThemes(themes: Theme[]) {
    settings.value.selectedThemeIds = themes.map(theme => theme.id)
  }
  
  function startGame() {
    currentSongIndex.value = 0
    scores.value = []
    isMuted.value = false
    nextSong()
  }
  
  function setPlaylist(songs: Song[]) {
    playlist.value = songs
  }
  
  function nextSong() {
    if (currentSongIndex.value < playlist.value.length) {
      currentSong.value = playlist.value[currentSongIndex.value]
      currentSongIndex.value++
      timer.value = 30
      userAnswer.value = ''
      timeIsUp.value = false
      foundCorrectAnswer.value = false
      correctAnswerTime.value = 0
      isPlaying.value = true
    }
  }
  
  function markCorrectAnswer(timeRemaining: number) {
    foundCorrectAnswer.value = true
    correctAnswerTime.value = timeRemaining
    
    // Au lieu d'ajouter immédiatement le score, on le stocke pour plus tard
    if (currentSong.value) {
      const score = getCurrentScore(timeRemaining)
      pendingScore.value = score;
      pendingResult.value = {
        songId: currentSong.value.id,
        songTitle: currentSong.value.title,
        artistName: currentSong.value.artist.name,
        userAnswer: userAnswer.value,
        isCorrect: true,
        score: score,
        timeRemaining: timeRemaining
      };
      // Ne pas ajouter immédiatement à scores.value
    }
  }
  
  function timeUp() {
    timeIsUp.value = true
    isPlaying.value = false
    
    // À la fin du timer, on ajoute les points au score
    if (currentSong.value) {
      if (foundCorrectAnswer.value && pendingResult.value) {
        // Ajouter les points en attente au score total
        scores.value.push(pendingResult.value);
        pendingScore.value = 0;
        pendingResult.value = null;
      } else if (!foundCorrectAnswer.value) {
        // Aucune réponse correcte n'a été trouvée, score = 0
        scores.value.push({
          songId: currentSong.value.id,
          songTitle: currentSong.value.title,
          artistName: currentSong.value.artist.name,
          userAnswer: '',
          isCorrect: false,
          score: 0,
          timeRemaining: 0
        });
      }
    }
  }
  
  // Mute/Unmute audio
  function toggleMute() {
    isMuted.value = !isMuted.value
  }
  
  // Fixed scoring system based on exact time ranges
  function getCurrentScore(timeRemaining: number): number {
    if (timeRemaining >= 28) return 10      // 30-28 seconds = 10 points
    if (timeRemaining >= 25) return 9       // 27-25 seconds = 9 points
    if (timeRemaining >= 22) return 8       // 24-22 seconds = 8 points
    if (timeRemaining >= 19) return 7       // 21-19 seconds = 7 points
    if (timeRemaining >= 16) return 6       // 18-16 seconds = 6 points
    if (timeRemaining >= 13) return 5       // 15-13 seconds = 5 points
    if (timeRemaining >= 10) return 4       // 12-10 seconds = 4 points
    if (timeRemaining >= 7) return 3        // 9-7 seconds = 3 points
    if (timeRemaining >= 4) return 2        // 6-4 seconds = 2 points
    return 1                                // 3-0 seconds = 1 point
  }
  
  // Improved answer matching with 90% similarity requirement
  function calculateSimilarity(str1: string, str2: string): number {
    // Supprimer le texte entre parenthèses
    const s1 = str1.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^\w\s]/g, '').trim()
    const s2 = str2.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^\w\s]/g, '').trim()
    
    if (s1 === s2) return 100
    
    // Levenshtein distance algorithm
    const matrix = []
    const len1 = s1.length
    const len2 = s2.length
    
    if (len1 === 0) return len2 === 0 ? 100 : 0
    if (len2 === 0) return 0
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        )
      }
    }
    
    const distance = matrix[len1][len2]
    const maxLength = Math.max(len1, len2)
    const similarity = ((maxLength - distance) / maxLength) * 100
    
    return similarity
  }
  
  function isAnswerCorrect(): boolean {
    if (!currentSong.value || !userAnswer.value) return false
    
    const answer = userAnswer.value.trim()
    const title = currentSong.value.title
    const artist = currentSong.value.artist.name
    
    // Minimum length requirement (at least 3 characters)
    if (answer.length < 3) return false
    
    // Check similarity based on answer mode
    let titleSimilarity = 0
    let artistSimilarity = 0
    
    if (settings.value.answerMode === 'song' || settings.value.answerMode === 'both') {
      titleSimilarity = calculateSimilarity(answer, title)
    }
    
    if (settings.value.answerMode === 'artist' || settings.value.answerMode === 'both') {
      artistSimilarity = calculateSimilarity(answer, artist)
    }
    
    // Also check if the answer contains significant words from title or artist
    const answerWords = answer.toLowerCase().split(' ').filter(word => word.length >= 3)
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length >= 3)
    const artistWords = artist.toLowerCase().split(' ').filter(word => word.length >= 3)
    
    // Check for exact word matches based on answer mode
    let hasExactWordMatch = false
    
    if (settings.value.answerMode === 'song' || settings.value.answerMode === 'both') {
      hasExactWordMatch = hasExactWordMatch || answerWords.some(word => 
        titleWords.some(titleWord => calculateSimilarity(word, titleWord) >= 90)
      )
    }
    
    if (settings.value.answerMode === 'artist' || settings.value.answerMode === 'both') {
      hasExactWordMatch = hasExactWordMatch || answerWords.some(word => 
        artistWords.some(artistWord => calculateSimilarity(word, artistWord) >= 90)
      )
    }
    
    return titleSimilarity >= 90 || artistSimilarity >= 90 || 
           (hasExactWordMatch && answerWords.length > 0 && answer.length >= 4)
  }
  
  function resetGame() {
    currentSong.value = null
    currentSongIndex.value = 0
    playlist.value = []
    scores.value = []
    isPlaying.value = false
    timer.value = 30
    userAnswer.value = ''
    timeIsUp.value = false
    foundCorrectAnswer.value = false
    correctAnswerTime.value = 0
    isMuted.value = false
    pendingScore.value = 0
    pendingResult.value = null
  }
  
  return {
    settings,
    availableThemes,
    currentSong,
    currentSongIndex,
    playlist,
    scores,
    isPlaying,
    timer,
    userAnswer,
    timeIsUp,
    foundCorrectAnswer,
    correctAnswerTime,
    isMuted,
    selectedThemes,
    pendingScore,
    pendingResult,
    totalScore,
    isGameOver,
    updateSettings,
    setAvailableThemes,
    setSelectedThemes,
    startGame,
    setPlaylist,
    nextSong,
    markCorrectAnswer,
    timeUp,
    toggleMute,
    getCurrentScore,
    resetGame,
    isAnswerCorrect
  }
})