<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              PostgreSQL Reviewer
            </h1>
            <span class="ml-2 text-sm text-gray-500">
              Система управления
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              API: {{ config.public.apiBaseUrl }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Global Toast Notifications -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 z-50 max-w-sm w-full"
    >
      <div
        :class="[
          'rounded-lg shadow-lg p-4 transition-all duration-300',
          toastType === 'success' ? 'bg-green-500 text-white' : 
          toastType === 'error' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        ]"
      >
        <div class="flex items-center justify-between">
          <span>{{ toastMessage }}</span>
          <button
            @click="hideToast"
            class="ml-2 text-white hover:text-gray-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

// Global toast notification state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')

// Global toast methods
const showSuccessToast = (message: string) => {
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
  setTimeout(hideToast, 5000)
}

const showErrorToast = (message: string) => {
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
  setTimeout(hideToast, 8000)
}

const showInfoToast = (message: string) => {
  toastMessage.value = message
  toastType.value = 'info'
  showToast.value = true
  setTimeout(hideToast, 5000)
}

const hideToast = () => {
  showToast.value = false
}

// Provide toast methods globally
provide('toast', {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
})
</script>
