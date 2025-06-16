<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../stores/gameStore'

const props = defineProps<{
  audioUrl: string
}>()

const emit = defineEmits(['timerUpdate'])
const router = useRouter()
const gameStore = useGameStore()

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const progress = ref(0)
const remainingTime = ref(30)
const timerInterval = ref<number | null>(null)

// Create audio element
function createAudio() {
  if (audio.value) {
    audio.value.pause()
    audio.value = null
  }
  
  audio.value = new Audio(props.audioUrl)
  
  audio.value.addEventListener('loadeddata', () => {
    startTimer()
    playAudio()
  })
  
  audio.value.addEventListener('timeupdate', updateProgress)
  audio.value.addEventListener('ended', stopAudio)
}

// Start the timer
function startTimer() {
  remainingTime.value = 30
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      emit('timerUpdate', remainingTime.value)
    } else {
      // Time is up - stop everything and notify the game
      stopTimer()
      stopAudio()
      gameStore.timeUp(0)
    }
  }, 1000) as unknown as number
}

// Stop the timer
function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// Play audio
function playAudio() {
  if (audio.value) {
    if (!gameStore.isMuted) {
      audio.value.volume = 1
    } else {
      audio.value.volume = 0
    }
    audio.value.play()
    isPlaying.value = true
  }
}

// Stop audio
function stopAudio() {
  if (audio.value) {
    audio.value.pause()
    audio.value.currentTime = 0
    isPlaying.value = false
  }
  
  stopTimer()
}

// Update progress
function updateProgress() {
  if (audio.value) {
    progress.value = (audio.value.currentTime / 30) * 100
  }
}

// Stop game and go home
function stopGame() {
  if (confirm('Êtes-vous sûr de vouloir arrêter la partie ? Votre progression sera perdue.')) {
    stopAudio()
    stopTimer()
    gameStore.resetGame()
    router.push('/')
  }
}

// Watch for mute state changes
watch(() => gameStore.isMuted, (isMuted) => {
  if (audio.value) {
    audio.value.volume = isMuted ? 0 : 1
  }
})

// Watch for changes in the audio URL
watch(() => props.audioUrl, () => {
  createAudio()
})

// Clean up on component unmount
onUnmounted(() => {
  stopAudio()
  stopTimer()
  
  if (audio.value) {
    audio.value.removeEventListener('loadeddata', playAudio)
    audio.value.removeEventListener('timeupdate', updateProgress)
    audio.value.removeEventListener('ended', stopAudio)
  }
})

// Initialize audio on component mount
createAudio()
</script>

<template>
  <div class="music-player p-4 bg-white rounded-lg shadow-md">
    <!-- Audio Visualizer -->
    <div class="audio-visualizer h-16 bg-gray-100 rounded-lg mb-4 overflow-hidden">
      <div 
        v-if="isPlaying" 
        class="visualizer-bars flex items-end justify-center h-full"
      >
        <div 
          v-for="i in 50" 
          :key="i" 
          class="bar bg-primary-600 w-1 mx-px rounded-t-sm transition-all duration-100"
          :style="{ 
            height: `${Math.random() * 100}%`, 
            animationDelay: `${i * 0.05}s`
          }"
        ></div>
      </div>
      <div v-else class="flex items-center justify-center h-full text-gray-400">
        <span>Music paused</span>
      </div>
    </div>
    
    <!-- Progress bar -->
    <div class="progress-container h-2 bg-gray-200 rounded-full mb-4">
      <div 
        class="progress-bar h-full bg-primary-600 rounded-full"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    
    <!-- Timer -->
    <div class="timer flex justify-center items-center mb-4">
      <div class="timer-display text-4xl font-bold text-primary-700">
        {{ remainingTime }}
      </div>
      <div class="text-lg ml-2">seconds left</div>
    </div>
    
    <!-- Control buttons -->
    <div class="controls flex justify-center space-x-3">
      <!-- Mute/Unmute button -->
      <button 
        @click="gameStore.toggleMute"
        class="btn btn-accent flex items-center space-x-2 text-sm px-4 py-2"
        :disabled="gameStore.timeIsUp"
      >
        <svg v-if="!gameStore.isMuted" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        <span>{{ gameStore.isMuted ? 'Unmute' : 'Mute' }}</span>
      </button>
      
      <!-- Stop Game button -->
      <button 
        @click="stopGame"
        class="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center space-x-2 text-sm px-4 py-2"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
        </svg>
        <span>Stop</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.visualizer-bars {
  padding: 0 1rem;
}

.bar {
  animation: pulse-bar 0.5s ease-in-out infinite alternate;
}

@keyframes pulse-bar {
  0% {
    height: 10%;
  }
  100% {
    height: 70%;
  }
}
</style>