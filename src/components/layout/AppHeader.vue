<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="bg-primary-600 text-white shadow-md">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <RouterLink to="/" class="text-2xl font-bold flex items-center">
        <span class="mr-2">🎵</span> Blind Test
      </RouterLink>
      <nav>
        <RouterLink to="/" class="text-white hover:text-primary-200 mr-4">Home</RouterLink>
      </nav>
    </div>
  </header>
</template>