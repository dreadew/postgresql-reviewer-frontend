<template>
  <div class="p-6 space-y-6">
    <!-- Overall Score -->
    <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-xl font-bold text-gray-900">Результат анализа SQL запроса</h4>
          <p class="text-gray-600 mt-1">
            {{ results.environment }} среда • {{ formatTimestamp(results.timestamp) }}
            <span v-if="results.thread_id" class="ml-2">• Thread: {{ results.thread_id }}</span>
          </p>
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

    <!-- Query Analysis -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h5 class="text-lg font-semibold text-gray-900 mb-4">Анализ производительности</h5>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ results.query_analysis.complexity_score }}</div>
          <div class="text-sm text-gray-600">Сложность</div>
        </div>
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <div class="text-2xl font-bold text-purple-600">{{ results.query_analysis.estimated_execution_time }}ms</div>
          <div class="text-sm text-gray-600">Время выполнения</div>
        </div>
        <div class="text-center p-4 bg-orange-50 rounded-lg">
          <div class="text-lg font-bold text-orange-600">{{ results.query_analysis.resource_usage }}</div>
          <div class="text-sm text-gray-600">Использование ресурсов</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ results.query_analysis.optimization_opportunities.length }}</div>
          <div class="text-sm text-gray-600">Возможности оптимизации</div>
        </div>
      </div>

      <!-- Optimization Opportunities -->
      <div v-if="results.query_analysis.optimization_opportunities.length > 0" class="mt-6">
        <h6 class="font-semibold text-gray-900 mb-3">Возможности оптимизации:</h6>
        <ul class="space-y-2">
          <li 
            v-for="(opportunity, index) in results.query_analysis.optimization_opportunities" 
            :key="index"
            class="flex items-start space-x-2"
          >
            <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-gray-700">{{ opportunity }}</span>
          </li>
        </ul>
      </div>

      <!-- Index Recommendations -->
      <div v-if="results.query_analysis.index_recommendations.length > 0" class="mt-6">
        <h6 class="font-semibold text-gray-900 mb-3">Рекомендации по индексам:</h6>
        <ul class="space-y-2">
          <li 
            v-for="(recommendation, index) in results.query_analysis.index_recommendations" 
            :key="index"
            class="flex items-start space-x-2"
          >
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-gray-700">{{ recommendation }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Analysis Results -->
    <div class="space-y-4">
      <h5 class="text-lg font-semibold text-gray-900">Детальный анализ</h5>
      <div class="space-y-3">
        <div 
          v-for="(result, index) in results.analysis_results" 
          :key="index"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h6 class="font-semibold text-gray-900">{{ result.title }}</h6>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getSeverityColor(result.severity)"
                >
                  {{ getSeverityLabel(result.severity) }}
                </span>
                <span class="text-sm text-gray-500">{{ result.category }}</span>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getImpactColor(result.impact)"
                >
                  {{ getImpactLabel(result.impact) }}
                </span>
              </div>
              <p class="text-gray-600 mt-2">{{ result.description }}</p>
              <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-700">{{ result.details }}</p>
              </div>
              <div class="mt-3">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Рекомендация:</span> {{ result.recommendation }}
                </p>
              </div>
              <div v-if="result.sql_suggestion" class="mt-3 p-3 bg-blue-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Предлагаемый SQL:</span>
                  <button 
                    @click="copyToClipboard(result.sql_suggestion!)"
                    class="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Копировать</span>
                  </button>
                </div>
                <code class="text-sm font-mono text-gray-800 bg-white p-2 rounded border block">{{ result.sql_suggestion }}</code>
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
    <div v-if="results.recommendations.length > 0" class="space-y-4">
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
              <div class="mt-3 p-3 bg-green-50 rounded-lg">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">Ожидаемый эффект:</span> {{ recommendation.estimated_impact }}
                </p>
              </div>
              <div v-if="recommendation.sql_command" class="mt-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">SQL команда:</span>
                  <button 
                    @click="copyToClipboard(recommendation.sql_command!)"
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
import type { SQLReviewResult, Severity, Priority, Impact } from '~/types/api'

interface Props {
  results: SQLReviewResult
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

const getImpactColor = (impact: Impact) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }
  return colors[impact]
}

const getImpactLabel = (impact: Impact) => {
  const labels = {
    low: 'Низкое влияние',
    medium: 'Среднее влияние',
    high: 'Высокое влияние'
  }
  return labels[impact]
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
