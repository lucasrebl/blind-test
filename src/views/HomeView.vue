<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import ThemeSelector from '../components/game/ThemeSelector.vue'
import deezerApi from '../services/deezerApi'
import type { AnswerMode } from '../types'

const router = useRouter()
const gameStore = useGameStore()
const maxPoints = ref(100)
const answerMode = ref<AnswerMode>('both')
const isLoading = ref(false)
const error = ref('')

// Update max points setting
function updateMaxPoints() {
  gameStore.updateSettings({ maxPoints: maxPoints.value })
}

// Update answer mode setting
function updateAnswerMode() {
  gameStore.updateSettings({ answerMode: answerMode.value })
}

// Start the game
async function startGame() {
  if (gameStore.settings.selectedThemeIds.length === 0) {
    error.value = 'Please select at least one theme'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Fetch tracks for all selected themes
    const allTracks = []
    let totalTracksFound = 0
    
    for (const themeId of gameStore.settings.selectedThemeIds) {
      console.log(`Fetching tracks for playlist ${themeId}...`)
      const tracks = await deezerApi.getPlaylistTracks(themeId)
      
      if (tracks.length === 0) {
        console.warn(`No valid tracks found for playlist ${themeId}`)
        continue
      }
      
      console.log(`Playlist ${themeId}: Added ${tracks.length} tracks`)
      allTracks.push(...tracks)
      totalTracksFound += tracks.length
    }
    
    if (allTracks.length === 0) {
      error.value = 'No valid tracks found in selected playlists. Please try different themes.'
      isLoading.value = false
      return
    }
    
    console.log(`Total tracks found: ${totalTracksFound}`)
    
    // Remove duplicates based on song ID
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    )
    
    console.log(`Unique tracks after deduplication: ${uniqueTracks.length}`)
    
    // Shuffle the tracks
    const shuffledTracks = uniqueTracks.sort(() => Math.random() - 0.5)
    
    // Take a reasonable number of tracks for the game (max 50)
    const gameTracks = shuffledTracks.slice(0, Math.min(50, shuffledTracks.length))
    
    console.log(`Game will use ${gameTracks.length} tracks`)
    
    // Set the playlist and start the game
    gameStore.setPlaylist(gameTracks)
    gameStore.startGame()
    
    // Navigate to the game page
    router.push('/game')
  } catch (err) {
    console.error('Error starting game:', err)
    error.value = 'Failed to start game. Please try again or select different themes.'
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-700 mb-2">Music Blind Test</h1>
        <p class="text-lg text-gray-600">
          Test your music knowledge with songs from your favorite playlists!
        </p>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Game Settings</h2>
        
        <!-- Max points setting -->
        <div class="mb-6">
          <label for="max-points" class="block text-sm font-medium text-gray-700 mb-2">
            Points to Win (minimum 100)
          </label>
          <input
            id="max-points"
            v-model.number="maxPoints"
            type="number"
            min="100"
            class="input"
            @change="updateMaxPoints"
          />
        </div>
        
        <!-- Answer mode setting -->
        <div class="mb-6">
          <label for="answer-mode" class="block text-sm font-medium text-gray-700 mb-2">
            Answer Mode
          </label>
          <select
            id="answer-mode"
            v-model="answerMode"
            class="input"
            @change="updateAnswerMode"
          >
            <option value="both">Artist Name OR Song Title</option>
            <option value="artist">Artist Name Only</option>
            <option value="song">Song Title Only</option>
          </select>
          <p class="text-sm text-gray-500 mt-1">
            Choose what type of answers are accepted during the game
          </p>
        </div>
        
        <!-- Theme selector -->
        <ThemeSelector />
        
        <!-- Selected themes summary -->
        <div class="mt-6 mb-6">
          <h3 class="text-lg font-medium mb-2">Selected Themes ({{ gameStore.selectedThemes.length }})</h3>
          <div v-if="gameStore.selectedThemes.length > 0" class="flex flex-wrap gap-2">
            <div 
              v-for="theme in gameStore.selectedThemes" 
              :key="theme.id"
              class="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
            >
              {{ theme.title }} ({{ theme.nb_tracks }} tracks)
            </div>
          </div>
          <p v-else class="text-gray-500">No themes selected yet</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
        
        <!-- Start game button -->
        <div class="flex justify-center">
          <button 
            @click="startGame" 
            class="btn btn-primary text-lg"
            :disabled="isLoading || gameStore.settings.selectedThemeIds.length === 0"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading tracks...
            </span>
            <span v-else>
              Start Game
            </span>
          </button>
        </div>
      </div>
      
      <!-- How to play section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold mb-4">How to Play</h2>
        <ul class="list-disc pl-5 space-y-2">
          <li>Select one or more music themes (playlists) from Deezer</li>
          <li>Choose your answer mode: artist name only, song title only, or both</li>
          <li>Each song plays for 30 seconds</li>
          <li>Type the correct answer based on your selected mode to earn points</li>
          <li><strong>Scoring:</strong> Answer quickly to earn more points! (30s = 10 points, decreasing to 1 point minimum)</li>
          <li>First player to reach the target score wins!</li>
          <li><strong>Note:</strong> Only songs with valid preview clips will be included</li>
        </ul>
      </div>
    </div>
  </div>
</template>