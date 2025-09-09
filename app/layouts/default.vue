<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
              <h1 class="text-2xl font-bold text-gray-900">
                PostgreSQL Reviewer
              </h1>
              <span class="ml-2 text-sm text-gray-500">
                Система управления
              </span>
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              API: {{ config.public.apiBaseUrl }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Bar -->
    <div class="bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="nav-container">
          <div class="nav-wrapper gap-2 flex flex-wrap">
            <NuxtLink
              v-for="tab in navigationTabs"
              :key="tab.id"
              :to="tab.route"
              :class="[
                'nav-tab',
                $route.path === tab.route ? 'nav-tab-active' : 'nav-tab-inactive'
              ]"
            >
              <span class="nav-label">{{ tab.name }}</span>
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>

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

// Navigation tabs
const navigationTabs = [
  { 
    id: 'dashboard', 
    name: 'Обзор', 
    route: '/dashboard',
    icon: 'heroicons:chart-bar'
  },
  { 
    id: 'connections', 
    name: 'Подключения', 
    route: '/connections',
    icon: 'heroicons:server-stack'
  },
  { 
    id: 'scheduler', 
    name: 'Планировщик', 
    route: '/scheduler',
    icon: 'heroicons:clock'
  },
  { 
    id: 'rules', 
    name: 'Правила', 
    route: '/rules',
    icon: 'heroicons:document-check'
  },
  { 
    id: 'config-analysis', 
    name: 'Анализ конфигурации', 
    route: '/config-analysis',
    icon: 'heroicons:cog-6-tooth'
  },
  { 
    id: 'sql-review', 
    name: 'Анализ SQL', 
    route: '/sql-review',
    icon: 'heroicons:magnifying-glass'
  },
  { 
    id: 'log-analysis', 
    name: 'Анализ логов', 
    route: '/log-analysis',
    icon: 'heroicons:document-text'
  }
]

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

<style scoped>
/* Navigation Styles */
.nav-container {
  padding: 8px 0;
}

.nav-wrapper {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 4px;
}

.nav-wrapper::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  min-width: fit-content;
  text-align: center;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-label {
  display: none;
}

.nav-tab-active {
  background: rgb(59 130 246);
  color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.nav-tab-inactive {
  color: rgb(107 114 128);
  background: transparent;
}

.nav-tab-inactive:hover {
  color: rgb(59 130 246);
  background: rgb(239 246 255);
}

/* Mobile Responsive */
@media (min-width: 640px) {
  .nav-label {
    display: block;
  }
  
  .nav-tab {
    padding: 10px 16px;
  }
}

@media (min-width: 768px) {
  .nav-wrapper {
    overflow-x: visible;
    justify-content: center;
  }
}
</style>
