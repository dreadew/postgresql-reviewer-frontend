<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Анализ конфигурации PostgreSQL</h3>
          <p class="text-sm text-gray-600 mt-1">Проанализируйте настройки PostgreSQL и получите рекомендации по оптимизации</p>
        </div>
        <button
          @click="startAnalysis"
          :disabled="loading || !selectedConnection"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {{ loading ? 'Анализируем...' : '🔍 Начать анализ' }}
        </button>
      </div>
    </div>

    <!-- Analysis Form -->
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Подключение</label>
          <select v-model="selectedConnection" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Выберите подключение</option>
            <option v-for="connection in connections" :key="connection.id" :value="connection.id">
              {{ connection.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Окружение</label>
          <select v-model="environment" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div class="flex items-end">
          <label class="flex items-center">
            <input v-model="detailedAnalysis" type="checkbox" class="mr-2">
            <span class="text-sm text-gray-700">Детальный анализ</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="p-6">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
          </svg>
          Анализируем конфигурацию...
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-red-800 font-medium">Ошибка анализа</h4>
            <p class="text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="results" class="space-y-6">
        <!-- Summary -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Сводка анализа</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ results.summary?.total_issues || 0 }}</div>
              <div class="text-sm text-gray-600">Найдено проблем</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ results.summary?.critical_issues || 0 }}</div>
              <div class="text-sm text-gray-600">Критических</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ results.recommendations?.length || 0 }}</div>
              <div class="text-sm text-gray-600">Рекомендаций</div>
            </div>
          </div>
        </div>

        <!-- Issues -->
        <div v-if="results.issues && results.issues.length > 0">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Найденные проблемы</h4>
          <div class="space-y-3">
            <div 
              v-for="issue in results.issues" 
              :key="issue.parameter"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h5 class="font-medium text-gray-900">{{ issue.parameter }}</h5>
                    <span :class="severityClass(issue.severity)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ issue.severity }}
                    </span>
                  </div>
                  <p class="text-gray-700 mb-2">{{ issue.description }}</p>
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Текущее значение:</span> {{ issue.current_value }}
                    <br>
                    <span class="font-medium">Рекомендуется:</span> {{ issue.recommended_value }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="results.recommendations && results.recommendations.length > 0">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Рекомендации</h4>
          <div class="space-y-3">
            <div 
              v-for="recommendation in results.recommendations" 
              :key="recommendation.category"
              class="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <h5 class="font-medium text-blue-900 mb-2">{{ recommendation.category }}</h5>
              <p class="text-blue-800">{{ recommendation.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Анализ не запущен</h3>
        <p class="text-gray-600">Выберите подключение и нажмите "Начать анализ" для проверки конфигурации</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ConfigAnalysisRequest, ConfigAnalysisResult } from '~/types/api'

const api = useApi()
const connectionsStore = useConnectionsStore()

const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<ConfigAnalysisResult | null>(null)
const selectedConnection = ref<number | ''>('')
const environment = ref<'development' | 'staging' | 'production'>('production')
const detailedAnalysis = ref(false)

const connections = computed(() => connectionsStore.connections)

onMounted(async () => {
  await connectionsStore.fetchConnections()
})

const startAnalysis = async () => {
  if (!selectedConnection.value) {
    error.value = 'Выберите подключение для анализа'
    return
  }

  loading.value = true
  error.value = null
  results.value = null

  try {
    const request: ConfigAnalysisRequest = {
      connection_id: selectedConnection.value as number,
      environment: environment.value,
      detailed_analysis: detailedAnalysis.value,
      analysis_target: 'all'
    }

    results.value = await api.analyzeConfig(request)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла ошибка при анализе'
  } finally {
    loading.value = false
  }
}

const severityClass = (severity: string): string => {
  const classes: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  }
  return classes[severity] || 'bg-gray-100 text-gray-800'
}
</script>