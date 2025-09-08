<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Статистика планировщика</h2>
      <p class="text-gray-600">Мониторинг выполнения задач и состояния системы</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Tasks -->
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats?.tasks.total_tasks ?? '-' }}</div>
            <div class="text-sm text-gray-600">Всего задач</div>
          </div>
        </div>
      </div>

      <!-- Active Tasks -->
      <div class="bg-green-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ stats?.tasks.active_tasks ?? '-' }}</div>
            <div class="text-sm text-gray-600">Активных задач</div>
          </div>
        </div>
      </div>

      <!-- Queue Length -->
      <div class="bg-yellow-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ queueStatus?.queue_length ?? '-' }}</div>
            <div class="text-sm text-gray-600">В очереди</div>
          </div>
        </div>
      </div>

      <!-- Success Rate -->
      <div class="bg-purple-50 rounded-lg p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-gray-900">{{ successRate }}%</div>
            <div class="text-sm text-gray-600">Успешность</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Executions in Last 24h -->
    <div class="mb-6">
      <h3 class="text-lg font-medium mb-4">Выполнения за последние 24 часа</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ stats?.executions_24h.total_executions ?? 0 }}</div>
          <div class="text-sm text-gray-600">Всего</div>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ stats?.executions_24h.completed ?? 0 }}</div>
          <div class="text-sm text-gray-600">Завершено</div>
        </div>
        <div class="text-center p-4 bg-red-50 rounded-lg">
          <div class="text-2xl font-bold text-red-600">{{ stats?.executions_24h.failed ?? 0 }}</div>
          <div class="text-sm text-gray-600">Ошибки</div>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ stats?.executions_24h.running ?? 0 }}</div>
          <div class="text-sm text-gray-600">Выполняется</div>
        </div>
      </div>
    </div>

    <!-- Recent Executions -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Последние выполнения</h3>
        <button
          @click="refreshData"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          :disabled="loading"
        >
          <svg 
            class="w-4 h-4 mr-2" 
            :class="{ 'animate-spin': loading }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Обновить
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Задача
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время выполнения
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Завершено
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="execution in executions" :key="execution.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ execution.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ execution.scheduled_task_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTaskTypeClass(execution.task_type)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getTaskTypeLabel(execution.task_type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(execution.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(execution.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDuration(execution) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ execution.completed_at ? formatDate(execution.completed_at) : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SchedulerStats, QueueStatus, TaskExecution } from '~/types/api'

const api = useApi()

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<SchedulerStats | null>(null)
const queueStatus = ref<QueueStatus | null>(null)
const executions = ref<TaskExecution[]>([])

const successRate = computed(() => {
  if (!stats.value?.executions_24h) return 0
  
  const { total_executions, completed } = stats.value.executions_24h
  if (total_executions === 0) return 100
  
  return Math.round((completed / total_executions) * 100)
})

const getTaskTypeLabel = (taskType: string) => {
  const labels: Record<string, string> = {
    log_analysis: 'Анализ логов',
    config_check: 'Проверка конфигурации',
    query_analysis: 'Анализ запросов',
    custom_sql: 'Кастомный SQL',
    table_analysis: 'Анализ таблиц'
  }
  return labels[taskType] || taskType
}

const getTaskTypeClass = (taskType: string) => {
  const classes: Record<string, string> = {
    log_analysis: 'bg-blue-100 text-blue-800',
    config_check: 'bg-green-100 text-green-800',
    query_analysis: 'bg-yellow-100 text-yellow-800',
    custom_sql: 'bg-purple-100 text-purple-800',
    table_analysis: 'bg-indigo-100 text-indigo-800'
  }
  return classes[taskType] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Ожидание',
    running: 'Выполняется',
    completed: 'Завершено',
    failed: 'Ошибка'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDuration = (execution: TaskExecution) => {
  if (!execution.started_at) return '-'
  
  const startTime = new Date(execution.started_at)
  const endTime = execution.completed_at ? new Date(execution.completed_at) : new Date()
  const durationMs = endTime.getTime() - startTime.getTime()
  const durationSeconds = Math.floor(durationMs / 1000)
  
  if (durationSeconds < 60) {
    return `${durationSeconds}с`
  } else if (durationSeconds < 3600) {
    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds % 60
    return `${minutes}м ${seconds}с`
  } else {
    const hours = Math.floor(durationSeconds / 3600)
    const minutes = Math.floor((durationSeconds % 3600) / 60)
    return `${hours}ч ${minutes}м`
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadStats = async () => {
  try {
    const [statsData, queueData] = await Promise.all([
      api.getSchedulerStats(),
      api.getQueueStatus()
    ])
    
    stats.value = statsData
    queueStatus.value = queueData
  } catch (err) {
    console.error('Error loading stats:', err)
    error.value = 'Ошибка загрузки статистики'
  }
}

const loadExecutions = async () => {
  try {
    const data = await api.getSchedulerExecutions({ limit: 10 })
    executions.value = data
  } catch (err) {
    console.error('Error loading executions:', err)
    error.value = 'Ошибка загрузки выполнений'
  }
}

const refreshData = async () => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      loadStats(),
      loadExecutions()
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(refreshData, 30000)
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
