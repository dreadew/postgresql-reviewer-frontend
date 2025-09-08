<template>
  <div class="p-6 space-y-6">
    <!-- Overall Score -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-xl font-bold text-gray-900">Общая оценка конфигурации</h4>
          <p class="text-gray-600 mt-1">{{ results.environment }} среда • {{ formatTimestamp(results.timestamp) }}</p>
        </div>
        <div class="text-right">
          <div class="text-4xl font-bold" :class="getScoreColor(results.overall_score)">
            {{ results.overall_score.toFixed(1) }}
          </div>
          <div class="text-sm font-medium text-gray-600">из 100</div>
        </div>
      </div>
      <div class="mt-4">
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="h-3 rounded-full transition-all duration-500"
            :class="getScoreColor(results.overall_score, true)"
            :style="{ width: `${results.overall_score}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ results.summary.total_parameters_analyzed }}</div>
            <div class="text-sm text-gray-600">Проанализировано</div>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white border border-red-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-red-600">{{ results.summary.high_priority_issues }}</div>
            <div class="text-sm text-gray-600">Критичных</div>
          </div>
          <div class="p-3 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-yellow-600">{{ results.summary.medium_priority_issues }}</div>
            <div class="text-sm text-gray-600">Средних</div>
          </div>
          <div class="p-3 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-4xl font-bold text-green-600">{{ results.summary.configuration_grade }}</div>
            <div class="text-sm text-gray-600">Оценка</div>
          </div>
          <div class="p-3 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Results -->
    <div class="space-y-4">
      <h5 class="text-lg font-semibold text-gray-900">Детальный анализ параметров</h5>
      <div class="space-y-3">
        <div 
          v-for="result in results.analysis_results" 
          :key="result.parameter"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h6 class="font-semibold text-gray-900">{{ result.parameter }}</h6>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getSeverityColor(result.severity)"
                >
                  {{ getSeverityLabel(result.severity) }}
                </span>
                <span class="text-sm text-gray-500">{{ result.category }}</span>
              </div>
              <p class="text-gray-600 mt-1">{{ result.description }}</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <span class="text-sm font-medium text-gray-700">Текущее значение:</span>
                  <span class="ml-2 px-2 py-1 bg-gray-100 rounded text-sm font-mono">{{ result.current_value }}</span>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-700">Рекомендуемое:</span>
                  <span class="ml-2 px-2 py-1 bg-green-100 rounded text-sm font-mono">{{ result.recommended_value }}</span>
                </div>
              </div>
              <div class="mt-3">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Рекомендация:</span> {{ result.recommendation }}
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  <span class="font-medium">Влияние:</span> {{ result.impact }}
                </p>
              </div>
            </div>
            <div class="text-right ml-4">
              <div class="text-2xl font-bold" :class="getScoreColor(result.score)">
                {{ result.score }}
              </div>
              <div class="text-xs text-gray-500">из 100</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="space-y-4">
      <h5 class="text-lg font-semibold text-gray-900">Рекомендации по оптимизации</h5>
      <div class="space-y-3">
        <div 
          v-for="(recommendation, index) in results.recommendations" 
          :key="index"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h6 class="font-semibold text-gray-900">{{ recommendation.title }}</h6>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getPriorityColor(recommendation.priority)"
                >
                  {{ getPriorityLabel(recommendation.priority) }}
                </span>
                <span class="text-sm text-gray-500">{{ recommendation.category }}</span>
              </div>
              <p class="text-gray-600 mt-2">{{ recommendation.description }}</p>
              <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">SQL команда:</span>
                  <button 
                    @click="copyToClipboard(recommendation.sql_command)"
                    class="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Копировать</span>
                  </button>
                </div>
                <code class="text-sm font-mono text-gray-800 bg-white p-2 rounded border block">{{ recommendation.sql_command }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Server Info -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h5 class="text-sm font-semibold text-gray-900 mb-2">Информация о сервере</h5>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Версия:</span>
          <span class="ml-2 font-medium">{{ results.server_info.version }}</span>
        </div>
        <div>
          <span class="text-gray-600">Хост:</span>
          <span class="ml-2 font-medium">{{ results.server_info.host }}</span>
        </div>
        <div>
          <span class="text-gray-600">База данных:</span>
          <span class="ml-2 font-medium">{{ results.server_info.database }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConfigAnalysisResult, Severity, Priority } from '~/types/api'

interface Props {
  results: ConfigAnalysisResult
}

defineProps<Props>()

const getScoreColor = (score: number, background = false) => {
  if (background) {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getSeverityColor = (severity: Severity) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return colors[severity]
}

const getSeverityLabel = (severity: Severity) => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критичный'
  }
  return labels[severity]
}

const getPriorityColor = (priority: Priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return colors[priority]
}

const getPriorityLabel = (priority: Priority) => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критичный'
  }
  return labels[priority]
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('ru-RU')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}
</script>
