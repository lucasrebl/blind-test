<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import MusicPlayer from '../components/game/MusicPlayer.vue'
import AnswerInput from '../components/game/AnswerInput.vue'

const router = useRouter()
const gameStore = useGameStore()
const timeRemaining = ref(30)
const gameReady = ref(false)
const answerTimer = ref<number | null>(null)

// Check if we have songs loaded
const hasSongs = computed(() => {
  return gameStore.playlist.length > 0
})

// Current song details
const currentSong = computed(() => {
  return gameStore.currentSong
})

// Get the current audio URL
const audioUrl = computed(() => {
  return currentSong.value?.preview || ''
})

// Update timer value from music player
function updateTimer(time: number) {
  timeRemaining.value = time
  
  // When time runs out, show answer for 10 seconds then move to next song
  if (time === 0 && !gameStore.timeIsUp) {
    gameStore.timeUp(0)
    startAnswerTimer()
  }
}

// Start the 10-second answer display timer
function startAnswerTimer() {
  if (answerTimer.value) {
    clearTimeout(answerTimer.value)
  }
  
  answerTimer.value = setTimeout(() => {
    if (!gameStore.isGameOver) {
      gameStore.nextSong()
    } else {
      router.push('/victory')
    }
  }, 10000) as unknown as number
}

// Start the game
function startGame() {
  gameReady.value = true
}

// Redirect to home if no songs are loaded
onMounted(() => {
  if (!hasSongs.value) {
    router.push('/')
  }
})

// Clean up when leaving page
onUnmounted(() => {
  if (answerTimer.value) {
    clearTimeout(answerTimer.value)
  }
  
  if (gameStore.isGameOver) {
    // Keep the game state for the victory screen
  } else {
    // Reset the game if leaving without finishing
    gameStore.resetGame()
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <!-- Game header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-700 mb-2">Music Blind Test</h1>
        <div class="flex justify-center items-center space-x-4">
          <div class="bg-primary-100 text-primary-800 px-4 py-1 rounded-full">
            Score: {{ gameStore.totalScore }} / {{ gameStore.settings.maxPoints }}
          </div>
          <div class="bg-secondary-100 text-secondary-800 px-4 py-1 rounded-full">
            Song: {{ gameStore.currentSongIndex }} / {{ gameStore.playlist.length }}
          </div>
        </div>
      </div>
      
      <!-- Start game button (initial state) -->
      <div v-if="!gameReady" class="text-center mb-8">
        <button @click="startGame" class="btn btn-primary text-xl px-8 py-4">
          Click When Ready to Start
        </button>
      </div>
      
      <!-- Game content (after starting) -->
      <div v-else>
        <!-- Music player -->
        <div class="mb-8">
          <MusicPlayer 
            :audio-url="audioUrl" 
            @timer-update="updateTimer"
          />
        </div>
        
        <!-- Answer input -->
        <div class="mb-8">
          <AnswerInput 
            :time-remaining="timeRemaining"
            :disabled="!gameStore.isPlaying"
          />
        </div>
      </div>
    </div>
  </div>
</template>