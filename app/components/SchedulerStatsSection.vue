<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-2">Статистика планировщика</h2>
      <p class="text-gray-600">Мониторинг выполнения задач и состояния системы</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Tasks -->
      <div class="bg-white rounded-lg border border-blue-200 p-4 hover:border-blue-300 transition-colors">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
      <div class="ml-4">
        <div class="text-2xl font-bold text-slate-900">{{ totalTasks ?? '-' }}</div>
        <div class="text-sm text-slate-600">Всего задач</div>
          </div>
        </div>
      </div>

      <!-- Active Tasks -->
      <div class="bg-white rounded-lg border border-green-200 p-4 hover:border-green-300 transition-colors">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-50 text-green-600 border border-green-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
      <div class="ml-4">
        <div class="text-2xl font-bold text-slate-900">{{ activeTasks ?? '-' }}</div>
        <div class="text-sm text-slate-600">Активных задач</div>
          </div>
        </div>
      </div>

      <!-- Queue Length -->
      <div class="bg-white rounded-lg border border-orange-200 p-4 hover:border-orange-300 transition-colors">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <div class="text-2xl font-bold text-slate-900">{{ queueStatus?.queue_length ?? '-' }}</div>
            <div class="text-sm text-slate-600">В очереди</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Executions in Last 24h -->
    <div class="mb-6">
      <h3 class="text-lg font-medium mb-4 text-slate-900">Выполнения за последние 24 часа</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
    <div class="text-2xl font-bold text-slate-900">{{ exec24Total }}</div>
          <div class="text-sm text-slate-600">Всего</div>
        </div>
        <div class="text-center p-4 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors">
    <div class="text-2xl font-bold text-green-600">{{ exec24Completed }}</div>
          <div class="text-sm text-slate-600">Завершено</div>
        </div>
        <div class="text-center p-4 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors">
    <div class="text-2xl font-bold text-red-600">{{ exec24Failed }}</div>
          <div class="text-sm text-slate-600">Ошибки</div>
        </div>
        <div class="text-center p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
    <div class="text-2xl font-bold text-blue-600">{{ exec24Running }}</div>
          <div class="text-sm text-slate-600">Выполняется</div>
        </div>
      </div>
    </div>

    <!-- Recent Executions -->
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h3 class="text-lg font-medium text-slate-900">Последние выполнения</h3>
        </div>
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <!-- Status Filter -->
          <div class="flex items-center gap-2">
            <label for="status-filter" class="text-sm font-medium text-slate-700">Статус:</label>
            <select 
              id="status-filter"
              v-model="statusFilter"
              class="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <!-- Refresh Button -->
          <button
            @click="refreshData"
            class="flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :disabled="isRefreshDisabled"
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
            <tr v-for="execution in paginatedExecutions" :key="execution.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ execution.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Задача {{ execution.task_type }}
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
      
      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-slate-700">
          Страница {{ currentPage }} из {{ totalPages }} (всего {{ totalExecutions }} записей)
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage <= 1"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            ← Назад
          </button>
          
          <div class="flex items-center space-x-1">
            <template v-for="page in getPaginationPages()" :key="page">
              <button
                v-if="typeof page === 'number'"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-2 text-slate-500">...</span>
            </template>
          </div>
          
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { SchedulerStats, QueueStatus, TaskExecution } from '~/types/api'

// SchedulerStatsSection script loaded (development logs removed)

const api = useApi()

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<SchedulerStats | null>(null)
const queueStatus = ref<QueueStatus | null>(null)

// Pagination and filtering
const currentPage = ref(1)
const pageSize = ref(5)
const statusFilter = ref('all')
const allExecutions = ref<TaskExecution[]>([]) // Все данные

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'completed', label: 'Завершено' },
  { value: 'running', label: 'Выполняется' },
  { value: 'failed', label: 'Ошибка' },
  { value: 'pending', label: 'Ожидает' }
]

// Computed properties for client-side filtering and pagination
const filteredExecutions = computed(() => {
  // Compute filteredExecutions and sort by completion date (most recent first).
  // Executions without `completed_at` are treated as older and appear last.
  const base = statusFilter.value === 'all'
    ? [...allExecutions.value]
    : allExecutions.value.filter(execution => execution.status === statusFilter.value)

  base.sort((a, b) => {
    const ta = a.completed_at ? new Date(a.completed_at).getTime() : 0
    const tb = b.completed_at ? new Date(b.completed_at).getTime() : 0
    return tb - ta
  })

  return base
})

const totalExecutions = computed(() => {
  const total = filteredExecutions.value.length
  // console.debug('Computing totalExecutions:', total)
  return total
})

// Ensure at least 1 page is shown to avoid "Page 1 of 0" UX and math edge-cases
const totalPages = computed(() => {
  const pages = Math.max(1, Math.ceil(totalExecutions.value / pageSize.value))
  // console.debug('Computing totalPages:', pages)
  return pages
})

const paginatedExecutions = computed(() => {
  const offset = (currentPage.value - 1) * pageSize.value
  const result = filteredExecutions.value.slice(offset, offset + pageSize.value)
  // Computing paginatedExecutions
  return result
})

// Update executions ref when paginated data changes
// Больше не нужно - таблица использует paginatedExecutions напрямую

// Pagination helper function
const getPaginationPages = () => {
  const pages: (number | string)[] = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Show first page
    pages.push(1)
    
    // Add ellipsis and middle pages
    const start = Math.max(2, currentPage.value - 1)
    const end = Math.min(totalPages.value - 1, currentPage.value + 1)
    
    if (start > 2) pages.push('...')
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (end < totalPages.value - 1) pages.push('...')
    
    // Show last page
    if (totalPages.value > 1) pages.push(totalPages.value)
  }
  
  return pages
}

const successRate = computed(() => {
  const exec24 = stats.value?.executions_24h
  if (!exec24) return 0
  const total_executions = typeof exec24.total_executions === 'number' ? exec24.total_executions : 0
  const completed = typeof exec24.completed === 'number' ? exec24.completed : 0
  if (total_executions === 0) return 100
  return Math.round((completed / total_executions) * 100)
})

// Last 24h derived metrics (safe fallbacks)
const exec24Total = computed(() => {
  if (stats.value && (stats.value as any).executions_24h && typeof (stats.value as any).executions_24h.total_executions === 'number') {
    return (stats.value as any).executions_24h.total_executions
  }
  // Fallback - count items in allExecutions that started within last 24h
  const cutoff = Date.now() - 24 * 3600 * 1000
  return allExecutions.value.filter(e => e.started_at && new Date(e.started_at).getTime() >= cutoff).length
})

const exec24Completed = computed(() => {
  if (stats.value && (stats.value as any).executions_24h && typeof (stats.value as any).executions_24h.completed === 'number') {
    return (stats.value as any).executions_24h.completed
  }
  const cutoff = Date.now() - 24 * 3600 * 1000
  return allExecutions.value.filter(e => e.completed_at && new Date(e.completed_at).getTime() >= cutoff && e.status === 'completed').length
})

const exec24Failed = computed(() => {
  if (stats.value && (stats.value as any).executions_24h && typeof (stats.value as any).executions_24h.failed === 'number') {
    return (stats.value as any).executions_24h.failed
  }
  const cutoff = Date.now() - 24 * 3600 * 1000
  return allExecutions.value.filter(e => (e.completed_at && new Date(e.completed_at).getTime() >= cutoff) || (e.started_at && new Date(e.started_at).getTime() >= cutoff)).filter(e => e.status === 'failed').length
})

const exec24Running = computed(() => {
  if (stats.value && (stats.value as any).executions_24h && typeof (stats.value as any).executions_24h.running === 'number') {
    return (stats.value as any).executions_24h.running
  }
  const cutoff = Date.now() - 24 * 3600 * 1000
  return allExecutions.value.filter(e => e.started_at && new Date(e.started_at).getTime() >= cutoff && e.status === 'running').length
})

// Safe derived total tasks: backend may not provide tasks.total_tasks
const totalTasks = computed(() => {
  // Prefer explicit stats.tasks.total_tasks when available
  if (stats.value && (stats.value as any).tasks && typeof (stats.value as any).tasks.total_tasks === 'number') {
    return (stats.value as any).tasks.total_tasks
  }
  // Fallback: count executions' rows if available
  return allExecutions.value.length || 0
})

const activeTasks = computed(() => {
  if (stats.value && (stats.value as any).tasks && typeof (stats.value as any).tasks.active_tasks === 'number') {
    return (stats.value as any).tasks.active_tasks
  }
  // Fallback: approximate active tasks by counting executions with running status
  return allExecutions.value.filter(e => e.status === 'running').length
})

const inactiveTasks = computed(() => {
  if (stats.value && (stats.value as any).tasks && typeof (stats.value as any).tasks.inactive_tasks === 'number') {
    return (stats.value as any).tasks.inactive_tasks
  }
  // Fallback: approximate inactive tasks as total - active
  return Math.max(0, totalTasks.value - activeTasks.value)
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

const loadExecutions = async (showLoading = false) => {
  try {
    if (showLoading) loading.value = true
    
  // Loading all executions for client-side filtering
    
    // Load all executions without pagination/filtering - do it on client
    let data: TaskExecution[] = []
    try {
      data = await api.getTaskExecutions()
    } catch (e) {
      // If API call fails, fallback to test data (keeps UI usable during dev)
      console.warn('getTaskExecutions API error, falling back to test data', e)
    }

    // Store all data for client-side filtering
    allExecutions.value = data
    // If current page is out-of-range after reload, clamp it
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
    
  // Loaded all executions count
    
  } catch (err) {
    console.error('Error loading executions:', err)
    error.value = 'Ошибка загрузки выполнений'
  } finally {
    if (showLoading) loading.value = false
  }
}

// Keep currentPage within bounds when totalPages change (e.g. after filtering)
watch(totalPages, (tp) => {
  if (currentPage.value > tp) currentPage.value = tp
})

// Watch for status filter changes - reset to page 1
watch(statusFilter, () => {
  // statusFilter changed
  currentPage.value = 1
  // ensure next tick lets computed values settle and DOM update
  nextTick().then(() => {/* nextTick after statusFilter */})
})

const refreshData = async () => {
  // refreshData called
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      loadStats(),
      loadExecutions(false)
    ])
  // refreshData completed successfully
  } catch (err) {
  console.error('refreshData error:', err)
  } finally {
    loading.value = false
  // refreshData finished, loading set to false
  }
}

onMounted(() => {
  // SchedulerStatsSection mounted
  refreshData()
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(refreshData, 30000)
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(interval)
  })
})

// Watch for route changes to refresh data
const route = useRoute()
watch(() => route.path, (newPath) => {
  if (newPath === '/scheduler') {
    // Delay to ensure component is fully mounted
    nextTick(() => {
      refreshData()
    })
  }
}, { immediate: false })

// Additional computed for refresh button state
const isRefreshDisabled = computed(() => {
  // computing isRefreshDisabled
  return loading.value
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
