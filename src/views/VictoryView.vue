<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

// Computed properties
const totalScore = computed(() => gameStore.totalScore)
const correctAnswers = computed(() => {
  return gameStore.scores.filter(result => result.isCorrect).length
})
const totalQuestions = computed(() => gameStore.scores.length)
const accuracy = computed(() => {
  return totalQuestions.value > 0 
    ? Math.round((correctAnswers.value / totalQuestions.value) * 100) 
    : 0
})

// Détermine si c'est une victoire par score ou par épuisement des musiques
const isVictory = computed(() => gameStore.isVictory)

// Format time remaining to seconds
function formatTimeRemaining(time: number): string {
  return `${time}s`
}

// Navigate back to home
function goHome() {
  gameStore.resetGame()
  router.push('/')
}

// Check if there are scores to display
onMounted(() => {
  if (gameStore.scores.length === 0) {
    router.push('/')
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header with confetti animation (seulement pour les victoires) -->
      <div class="text-center mb-12 relative">
        <div v-if="isVictory" class="confetti-container absolute top-0 left-0 w-full h-32 overflow-hidden">
          <div v-for="i in 50" :key="i" class="confetti" 
            :style="{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: `hsl(${Math.random() * 360}, 100%, 50%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }"
          ></div>
        </div>
        
        <h1 class="text-5xl font-bold mb-4" :class="isVictory ? 'text-primary-700' : 'text-gray-700'">
          {{ isVictory ? 'Game Complete!' : 'Game Over!' }}
        </h1>
        <p class="text-xl text-gray-600">Your final score: <span class="font-bold text-2xl" :class="isVictory ? 'text-primary-600' : 'text-secondary-600'">{{ totalScore }}</span></p>
        <p v-if="!isVictory" class="text-lg text-gray-600 mt-2">
          You didn't reach {{ gameStore.settings.maxPoints }} points, but you went through all available songs!
        </p>
        <p class="text-lg text-gray-600">
          You got <span class="font-bold" :class="isVictory ? 'text-primary-600' : 'text-secondary-600'">{{ correctAnswers }}</span> out of <span class="font-bold">{{ totalQuestions }}</span> correct
          (<span class="font-bold">{{ accuracy }}%</span> accuracy)
        </p>
      </div>
      
      <!-- Game summary -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Game Summary</h2>
        
        <!-- Themes played -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2">Themes Played</h3>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="theme in gameStore.selectedThemes" 
              :key="theme.id"
              class="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
            >
              {{ theme.title }}
            </div>
          </div>
        </div>
        
        <!-- Songs list -->
        <div>
          <h3 class="text-lg font-medium mb-4">Songs Results</h3>
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Left</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(result, index) in gameStore.scores" :key="index"
                  :class="{ 'bg-green-50': result.isCorrect, 'bg-red-50': !result.isCorrect }"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ result.artistName }}</div>
                    <div class="text-sm text-gray-500">{{ result.songTitle }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ result.userAnswer || '(No answer)' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatTimeRemaining(result.timeRemaining) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': result.isCorrect,
                        'bg-red-100 text-red-800': !result.isCorrect
                      }"
                    >
                      {{ result.score }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="text-center">
        <button @click="goHome" class="btn btn-primary text-lg px-8">
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confetti {
  position: absolute;
  top: -10%;
  border-radius: 0;
  animation: fall linear forwards;
}

@keyframes fall {
  0% {
    top: -10%;
    transform: rotate(0deg) translateX(0);
  }
  100% {
    top: 100%;
    transform: rotate(720deg) translateX(100px);
  }
}
</style>