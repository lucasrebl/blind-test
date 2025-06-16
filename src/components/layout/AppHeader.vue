<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

// Vérifier si on est sur la page de jeu
const isGamePage = computed(() => {
  return route.path === '/game'
})

// Empêcher la navigation depuis la page de jeu
function handleClick(event: { preventDefault: () => void }) {
  if (isGamePage.value) {
    event.preventDefault()
  }
}
</script>

<template>
  <header class="bg-primary-600 text-white shadow-md">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <!-- Logo avec RouterLink (correction des classes) -->
      <RouterLink 
        to="/" 
        class="text-2xl font-bold flex items-center" 
        :class="{ 'pointer-events-none cursor-not-allowed opacity-70': isGamePage }"
        @click="handleClick"
      >
        <span class="mr-2">🎵</span> Blind Test
      </RouterLink>
      
      <!-- Navigation -->
      <nav>
        <!-- Utilisation de RouterLink au lieu de <a> -->
        <RouterLink 
          to="/" 
          class="text-white hover:text-primary-200 mr-4" 
          :class="{ 'pointer-events-none cursor-not-allowed opacity-70': isGamePage }"
          @click="handleClick"
        >
          Home
        </RouterLink>
      </nav>
    </div>
  </header>
</template>