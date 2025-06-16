<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const props = defineProps<{
  timeRemaining: number
  disabled: boolean
}>()

const emit = defineEmits(['submit'])
const gameStore = useGameStore()
const inputRef = ref<HTMLInputElement | null>(null)

// Get placeholder text based on answer mode
const placeholderText = computed(() => {
  switch (gameStore.settings.answerMode) {
    case 'artist':
      return 'Enter artist name...'
    case 'song':
      return 'Enter song title...'
    case 'both':
    default:
      return 'Enter artist name or song title...'
  }
})

// Check if input should be disabled (disabled prop, time is up, or correct answer found)
const isInputDisabled = computed(() => {
  return props.disabled || gameStore.timeIsUp || gameStore.foundCorrectAnswer
})

// Check if submit button should be disabled
const isSubmitDisabled = computed(() => {
  return props.disabled || gameStore.timeIsUp || !gameStore.userAnswer || gameStore.foundCorrectAnswer
})

// Focus the input when it becomes enabled and no correct answer found yet
watch(() => [props.disabled, gameStore.foundCorrectAnswer], ([newDisabled, foundCorrect]) => {
  if (!newDisabled && !foundCorrect && inputRef.value) {
    inputRef.value.focus()
  }
})

// Submit answer
function submitAnswer() {
  if (isSubmitDisabled.value) return
  
  // Check if answer is correct
  if (gameStore.isAnswerCorrect()) {
    // If correct, mark as answered with current time remaining
    gameStore.markCorrectAnswer(props.timeRemaining)
  } else {
    // If incorrect, clear the input and let player try again
    gameStore.userAnswer = ''
    if (inputRef.value) {
      inputRef.value.focus()
    }
  }
}

// Get result message (only shown when time is up)
function getResultMessage(): string {
  const currentSong = gameStore.currentSong
  if (!currentSong) return ''
  
  if (gameStore.foundCorrectAnswer) {
    const score = gameStore.getCurrentScore(gameStore.correctAnswerTime)
    return `Correct! +${score} points - ${currentSong.artist.name} - ${currentSong.title}`
  } else {
    return `The answer was ${currentSong.artist.name} - ${currentSong.title}`
  }
}
</script>

<template>
  <div class="answer-input">
    <!-- Input form -->
    <form @submit.prevent="submitAnswer" class="mb-4">
      <div class="flex">
        <input
          ref="inputRef"
          v-model="gameStore.userAnswer"
          type="text"
          :placeholder="placeholderText"
          class="input flex-grow"
          :class="{ 'bg-gray-100': gameStore.foundCorrectAnswer }"
          :disabled="isInputDisabled"
          @keyup.enter="submitAnswer"
        />
        <button 
          type="submit" 
          class="btn btn-primary ml-2"
          :disabled="isSubmitDisabled"
        >
          Submit
        </button>
      </div>
    </form>
    
    <!-- Feedback for correct answer during game -->
    <div v-if="gameStore.foundCorrectAnswer && !gameStore.timeIsUp" class="bg-green-100 text-green-800 p-3 rounded-lg text-center mb-4">
      <p class="font-medium">Correct! Keep listening until the end...</p>
      <p class="text-sm">Input disabled - wait for next song</p>
    </div>
    
    <!-- Result message (only shown when time is up) -->
    <div v-if="gameStore.timeIsUp" class="result-message p-4 rounded-lg text-center mb-4"
      :class="{
        'bg-green-100 text-green-800': gameStore.foundCorrectAnswer,
        'bg-red-100 text-red-800': !gameStore.foundCorrectAnswer
      }"
    >
      <p class="text-lg font-medium">{{ getResultMessage() }}</p>
    </div>
  </div>
</template>