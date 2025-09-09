<template>
  <div class="p-6 space-y-6">
    <!-- Overall Score -->
    <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-xl font-bold text-gray-900">Результат анализа логов</h4>
          <p class="text-gray-600 mt-1">{{ results.notes }}</p>
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

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ results.analysis_summary?.total_log_lines ?? 0 }}</div>
        <div class="text-sm text-gray-600">Строк логов</div>
      </div>
      <div class="bg-white border border-red-200 rounded-lg p-4 text-center">
  <div class="text-2xl font-bold text-red-600">{{ results.analysis_summary?.error_count ?? 0 }}</div>
        <div class="text-sm text-gray-600">Ошибок</div>
      </div>
      <div class="bg-white border border-yellow-200 rounded-lg p-4 text-center">
  <div class="text-2xl font-bold text-yellow-600">{{ results.analysis_summary?.warning_count ?? 0 }}</div>
        <div class="text-sm text-gray-600">Предупреждений</div>
      </div>
      <div class="bg-white border border-orange-200 rounded-lg p-4 text-center">
  <div class="text-2xl font-bold text-orange-600">{{ results.analysis_summary?.slow_query_count ?? 0 }}</div>
        <div class="text-sm text-gray-600">Медленных запросов</div>
      </div>
      <div class="bg-white border border-green-200 rounded-lg p-4 text-center">
  <div class="text-2xl font-bold text-green-600">{{ results.analysis_summary?.connection_events ?? 0 }}</div>
        <div class="text-sm text-gray-600">События подключений</div>
      </div>
    </div>

    <!-- Time Range -->
    <div class="bg-blue-50 rounded-lg p-4">
      <h5 class="text-sm font-semibold text-gray-900 mb-2">Временной диапазон анализа</h5>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Начало:</span>
          <span class="ml-2 font-medium">{{ results.analysis_summary?.time_range?.start ? formatTimestamp(results.analysis_summary.time_range.start) : '-' }}</span>
        </div>
        <div>
          <span class="text-gray-600">Конец:</span>
          <span class="ml-2 font-medium">{{ results.analysis_summary?.time_range?.end ? formatTimestamp(results.analysis_summary.time_range.end) : '-' }}</span>
        </div>
        <div>
          <span class="text-gray-600">Длительность:</span>
          <span class="ml-2 font-medium">{{ results.analysis_summary?.time_range?.duration_minutes ? results.analysis_summary.time_range.duration_minutes.toFixed(1) + ' мин' : '-' }}</span>
        </div>
      </div>
    </div>

    <!-- Categories Distribution -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h5 class="text-lg font-semibold text-gray-900 mb-4">Распределение по категориям</h5>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="text-center">
    <div class="text-3xl font-bold text-red-600">{{ results.analysis_summary?.categories?.errors ?? 0 }}</div>
          <div class="text-sm text-gray-600">Ошибки</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-600">{{ results.analysis_summary?.categories?.warnings ?? 0 }}</div>
          <div class="text-sm text-gray-600">Предупреждения</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-orange-600">{{ results.analysis_summary?.categories?.performance ?? 0 }}</div>
          <div class="text-sm text-gray-600">Производительность</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ results.analysis_summary?.categories?.security ?? 0 }}</div>
          <div class="text-sm text-gray-600">Безопасность</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ results.analysis_summary?.categories?.connections ?? 0 }}</div>
          <div class="text-sm text-gray-600">Подключения</div>
        </div>
      </div>
    </div>

    <!-- Errors -->
  <div v-if="(results.errors || []).length > 0" class="space-y-4">
      <h5 class="text-lg font-semibold text-gray-900">Обнаруженные ошибки</h5>
      <div class="space-y-3">
        <div 
          v-for="(error, index) in results.errors" 
          :key="index"
          class="bg-white border border-red-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getSeverityColor(error.severity)"
                >
                  {{ error.severity }}
                </span>
                <span class="text-sm text-gray-500">{{ error.category }}</span>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getImpactColor(error.impact)"
                >
                  {{ getImpactLabel(error.impact) }}
                </span>
                <span class="text-sm text-gray-500">Строка {{ error.line_number }}</span>
              </div>
              <div class="mt-2">
                <p class="font-medium text-gray-900">{{ error.description }}</p>
                <p class="text-gray-600 mt-1">{{ error.message }}</p>
              </div>
              <div class="mt-3 text-sm text-gray-600">
                <span class="font-medium">Время:</span> {{ error.timestamp ? formatTimestamp(error.timestamp) : '-' }}
              </div>
              <div v-if="error.query" class="mt-3 p-3 bg-gray-50 rounded-lg">
                <div class="text-sm font-medium text-gray-700 mb-1">SQL запрос:</div>
                <code class="text-sm font-mono text-gray-800">{{ error.query }}</code>
              </div>
              <div class="mt-3 p-3 bg-blue-50 rounded-lg">
                <div class="text-sm font-medium text-gray-700 mb-1">Рекомендация:</div>
                <p class="text-sm text-gray-700">{{ error.recommendation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Issues -->
  <div v-if="(results.analysis_summary?.performance_issues || []).length > 0" class="space-y-4">
      <h5 class="text-lg font-semibold text-gray-900">Проблемы производительности</h5>
      <div class="space-y-3">
        <div 
          v-for="(issue, index) in (results.analysis_summary?.performance_issues || [])" 
          :key="index"
          class="bg-white border border-orange-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h6 class="font-semibold text-gray-900">{{ issue.type }}</h6>
                <span class="text-sm text-orange-600 font-medium">
                  {{ (issue.duration_ms / 1000).toFixed(2) }}s
                </span>
              </div>
              <div class="mt-2 p-3 bg-gray-50 rounded-lg">
                <div class="text-sm font-medium text-gray-700 mb-1">Запрос:</div>
                <code class="text-sm font-mono text-gray-800">{{ issue.query }}</code>
              </div>
              <div class="mt-3 p-3 bg-orange-50 rounded-lg">
                <div class="text-sm font-medium text-gray-700 mb-1">Рекомендация:</div>
                <p class="text-sm text-gray-700">{{ issue.recommendation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
  <div v-if="(results.analysis_summary?.recommendations || []).length > 0" class="space-y-4">
      <h5 class="text-lg font-semibold text-gray-900">Общие рекомендации</h5>
      <div class="space-y-3">
        <div 
          v-for="(recommendation, index) in (results.analysis_summary?.recommendations || [])" 
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LogAnalysisResult, Priority, Impact } from '~/types/api'

interface Props {
  results: LogAnalysisResult
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

const getSeverityColor = (severity: string) => {
  const severityLower = severity.toLowerCase()
  if (severityLower.includes('error') || severityLower.includes('fatal')) {
    return 'bg-red-100 text-red-800'
  }
  if (severityLower.includes('warning') || severityLower.includes('warn')) {
    return 'bg-yellow-100 text-yellow-800'
  }
  if (severityLower.includes('info') || severityLower.includes('log')) {
    return 'bg-blue-100 text-blue-800'
  }
  return 'bg-gray-100 text-gray-800'
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
</script>
