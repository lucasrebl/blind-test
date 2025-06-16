<template>
  <div class="theme-selector">
    <h3 class="text-lg font-semibold mb-4">Select Music Themes</h3>
    
    <!-- Search bar -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Recherchez des thèmes musicaux (ex: 'pop', 'rock', 'rap')..."
          class="input w-full pl-10"
          @input="onSearchInput"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading themes...</p>
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center py-4">
      <p>{{ error }}</p>
      <button 
        @click="onRetryClick" 
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="theme in themes" 
        :key="theme.id"
        class="theme-card border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
        :class="{ 'border-blue-500 bg-blue-50': selectedThemes.includes(theme.id) }"
        @click="toggleTheme(theme.id)"
      >
        <img 
          :src="theme.picture_medium || theme.picture" 
          :alt="theme.title"
          class="w-full h-32 object-cover rounded mb-3"
        />
        <h4 class="font-medium text-sm mb-1">{{ theme.title }}</h4>
        <p class="text-xs text-gray-600">{{ theme.nb_tracks }} tracks</p>
      </div>
    </div>
    
    <div v-if="selectedThemes.length > 0" class="mt-6 text-center">
      <p class="text-sm text-gray-600 mb-2">
        {{ selectedThemes.length }} theme(s) selected
      </p>
      <button 
        @click="confirmSelection"
        class="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Confirm Selection
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import deezerApi from '../../services/deezerApi'

const gameStore = useGameStore()

interface Theme {
  id: number
  title: string
  picture?: string
  picture_medium?: string
  nb_tracks?: number
}

const themes = ref<Theme[]>([])
const loading = ref(false)
const error = ref('')
const selectedThemes = ref<number[]>([])
const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)

const loadThemes = async (query: string = 'popular') => {
  loading.value = true
  error.value = ''
  
  try {
    // Load playlists based on search query
    const response = await deezerApi.searchPlaylists(query)
    themes.value = response || []
  } catch (err) {
    error.value = 'Failed to load themes. Please try again.'
    console.error('Error loading themes:', err)
  } finally {
    loading.value = false
  }
}

const onRetryClick = () => {
  loadThemes()
}

const onSearchInput = () => {
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // Set new timeout to avoid too many API calls
  searchTimeout.value = setTimeout(() => {
    const query = searchQuery.value.trim()
    if (query) { // Ne charger que si la recherche n'est pas vide
      loadThemes(query)
    }
  }, 500) as unknown as number
}

const toggleTheme = (themeId: number) => {
  const index = selectedThemes.value.indexOf(themeId)
  if (index > -1) {
    selectedThemes.value.splice(index, 1)
  } else {
    selectedThemes.value.push(themeId)
  }
}

const confirmSelection = () => {
  const selectedThemeObjects = themes.value
    .filter(theme => selectedThemes.value.includes(theme.id))
    .map(theme => ({
      id: theme.id,
      title: theme.title,
      picture: theme.picture || '',
      tracklist: (theme as any).tracklist || '',
      nb_tracks: theme.nb_tracks || 0
    }))
  gameStore.setSelectedThemes(selectedThemeObjects)
}

// Ne pas charger de thèmes automatiquement au montage
// onMounted(() => {
//   loadThemes()
// })
</script>

<style scoped>
.theme-card {
  transition: all 0.2s ease-in-out;
}

.theme-card:hover {
  transform: translateY(-2px);
}
</style>