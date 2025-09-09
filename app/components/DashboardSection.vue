<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="relative">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl opacity-50"></div>
      <div class="relative px-8 py-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Обзор системы
        </h1>
        <p class="mt-2 text-lg text-gray-600 font-medium">
          Мониторинг состояния PostgreSQL
        </p>
      </div>
    </div>

    <!-- Statistics Cards -->

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Connections Card -->
      <div class="group bg-white rounded-lg border border-blue-200 p-6 hover:border-blue-300 transition-colors hover:shadow-md">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
            </svg>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-slate-900">{{ connectionsStats.total }}</div>
            <div class="text-sm font-medium text-slate-600">Подключений</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-blue-700">
            {{ connectionsStats.active }} активных
          </div>
        </div>
      </div>

      <!-- Tasks Card -->
      <div class="group bg-white rounded-lg border border-purple-200 p-6 hover:border-purple-300 transition-colors hover:shadow-md">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-purple-50 rounded-xl border border-purple-100 group-hover:bg-purple-100 transition-colors">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-slate-900">{{ tasksStats.total }}</div>
            <div class="text-sm font-medium text-slate-600">Задач</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-purple-700">
            {{ tasksStats.active }} активных
          </div>
        </div>
      </div>

      <!-- Rules Card -->
      <div class="group bg-white rounded-lg border border-emerald-200 p-6 hover:border-emerald-300 transition-colors hover:shadow-md">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-slate-900">{{ rulesStats.total }}</div>
            <div class="text-sm font-medium text-slate-600">Правил</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-emerald-700">
            {{ rulesStats.config }}+{{ rulesStats.sql }} типов
          </div>
          <div class="flex items-center text-blue-600">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span class="text-xs font-medium">Готово</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis & Monitoring Tools -->
    <div class="space-y-6">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-100 rounded-2xl opacity-50"></div>
        <div class="relative px-8 py-6">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Инструменты анализа
          </h2>
          <p class="mt-2 text-gray-600 font-medium">
            Быстрый доступ к анализу конфигурации, SQL и логов
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Config Analysis Card -->
        <div class="group bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors hover:shadow-md">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Анализ конфигурации</h3>
            <p class="text-slate-600 text-sm mb-4 leading-relaxed">
              Проанализируйте настройки PostgreSQL и получите рекомендации по оптимизации производительности
            </p>
            <button
              @click="$emit('navigate', 'config-analysis')"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Анализировать конфигурацию
            </button>
          </div>
        </div>

        <!-- SQL Review Card -->
        <div class="group bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors hover:shadow-md">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-green-50 rounded-xl border border-green-100 group-hover:bg-green-100 transition-colors">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Анализ SQL</h3>
            <p class="text-slate-600 text-sm mb-4 leading-relaxed">
              Проверьте SQL запросы на производительность, безопасность и соответствие best practices
            </p>
            <button
              @click="$emit('navigate', 'sql-review')"
              class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Анализировать SQL
            </button>
          </div>
        </div>

        <!-- Log Analysis Card -->
        <div class="group bg-white rounded-lg border border-orange-200 hover:border-orange-300 transition-colors hover:shadow-md">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-orange-50 rounded-xl border border-orange-100 group-hover:bg-orange-100 transition-colors">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Анализ логов</h3>
            <p class="text-slate-600 text-sm mb-4 leading-relaxed">
              Анализируйте логи PostgreSQL для выявления ошибок и проблем производительности
            </p>
            <button
              @click="$emit('navigate', 'log-analysis')"
              class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Анализировать логи
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <!-- Recent Connections -->
      <div class="modern-card">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900">Подключения</h3>
          </div>
          <button
            @click="$emit('navigate', 'connections')"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Все →
          </button>
        </div>
        
        <div v-if="recentConnections.length === 0" class="empty-state">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-gray-500 text-center">Подключения не найдены</p>
          <button
            @click="$emit('navigate', 'connections')"
            class="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Добавить первое подключение
          </button>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="connection in recentConnections"
            :key="connection.id"
            class="connection-item group"
          >
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div
                  :class="[
                    'w-4 h-4 rounded-full border-2 border-white shadow-sm',
                    connection.is_active ? 'bg-green-500' : 'bg-gray-400'
                  ]"
                ></div>
                <div v-if="connection.is_active" class="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-ping opacity-75"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">
                  {{ connection.name }}
                </div>
              </div>
              <button
                @click="testConnection(connection.id)"
                :disabled="testingConnection === connection.id"
                class="test-button"
              >
                <svg v-if="testingConnection === connection.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Tasks -->
      <div class="modern-card">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900">Активные задачи</h3>
          </div>
          <button
            @click="$emit('navigate', 'tasks')"
            class="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            Все →
          </button>
        </div>
        
        <div v-if="activeTasks.length === 0" class="empty-state">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-gray-500 text-center">Активные задачи не найдены</p>
          <button
            @click="$emit('navigate', 'tasks')"
            class="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            Создать первую задачу
          </button>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="task in activeTasks"
            :key="task.id"
            class="task-item group"
          >
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                <div class="absolute inset-0 w-4 h-4 rounded-full bg-green-400 animate-pulse opacity-75"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">
                  {{ task.name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getTaskTypeLabel(task.task_type) }}
                </div>
              </div>
              <button
                @click="runTask(task.id)"
                :disabled="runningTask === task.id"
                class="run-button"
              >
                <svg v-if="runningTask === task.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a2 2 0 012-2h8a2 2 0 012 2v2M9 14v2a2 2 0 002 2h2a2 2 0 002-2v-2M5 18H4a2 2 0 01-2-2v-1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="modern-card">
      <div class="flex items-center space-x-3 mb-8">
        <div class="p-2 bg-indigo-100 rounded-lg">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900">Быстрые действия</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          @click="$emit('navigate', 'connections')"
          class="action-card group"
        >
          <div class="flex flex-col items-center text-center p-6">
            <div class="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-slate-900 mb-2">Добавить подключение</h4>
            <p class="text-sm text-slate-600 leading-relaxed">Настроить новое подключение к базе данных PostgreSQL</p>
          </div>
        </button>

        <button
          @click="$emit('navigate', 'tasks')"
          class="action-card group"
        >
          <div class="flex flex-col items-center text-center p-6">
            <div class="w-16 h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-slate-900 mb-2">Создать задачу</h4>
            <p class="text-sm text-slate-600 leading-relaxed">Настроить новую задачу автоматического анализа</p>
          </div>
        </button>

        <button
          @click="$emit('navigate', 'rules')"
          class="action-card group"
        >
          <div class="flex flex-col items-center text-center p-6">
            <div class="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Добавить правило</h4>
            <p class="text-sm text-gray-600 leading-relaxed">Создать новое правило для анализа конфигурации</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = {
  navigate: [tab: string]
}

const emit = defineEmits<Emits>()

const connectionsStore = useConnectionsStore()
const tasksStore = useTasksStore()
const rulesStore = useRulesStore()
const toast = inject('toast') as any

// Reactive state
const testingConnection = ref<number | null>(null)
const runningTask = ref<number | null>(null)

// Computed stats
const connectionsStats = computed(() => {
  const connections = connectionsStore.connections
  return {
    total: connections.length,
    active: connections.filter(c => c.is_active).length
  }
})

const tasksStats = computed(() => {
  const tasks = tasksStore.tasks
  return {
    total: tasks.length,
    active: tasks.filter(t => t.is_active).length
  }
})

const rulesStats = computed(() => {
  const rules = rulesStore.rules
  return {
    total: rules.length,
    config: rules.filter(r => r.category === 'config').length,
    sql: rules.filter(r => r.category === 'sql').length
  }
})

// Recent data
const recentConnections = computed(() => {
  return connectionsStore.connections.slice(0, 5)
})

const activeTasks = computed(() => {
  return tasksStore.tasks.filter(t => t.is_active).slice(0, 5)
})

// Methods
const testConnection = async (id: number) => {
  testingConnection.value = id
  try {
    await connectionsStore.testConnection(id)
    toast?.success('Подключение успешно!')
  } catch (error) {
    console.error('Test connection error:', error)
    toast?.error('Ошибка при тестировании подключения')
  } finally {
    testingConnection.value = null
  }
}

const runTask = async (id: number) => {
  runningTask.value = id
  try {
    await tasksStore.runTask(id)
    toast?.success('Задача успешно запущена!')
  } catch (error) {
    console.error('Run task error:', error)
    toast?.error('Ошибка при запуске задачи')
  } finally {
    runningTask.value = null
  }
}

const getTaskTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'config_check': 'Проверка конфигурации',
    'query_analysis': 'Анализ запросов',
    'log_analysis': 'Анализ логов'
  }
  return labels[type] || type
}
</script>

<style scoped>
.stats-card {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modern-card {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid rgb(229 231 235);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.modern-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.connection-item, .task-item {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgb(243 244 246);
  background: rgb(249 250 251);
  transition: all 0.2s ease;
}

.connection-item:hover, .task-item:hover {
  background: white;
  border-color: rgb(209 213 219);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.test-button, .run-button {
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: rgb(249 250 251);
  border: 1px solid rgb(229 231 235);
  color: rgb(75 85 99);
  transition: all 0.2s ease;
  opacity: 0;
}

.group:hover .test-button,
.group:hover .run-button {
  opacity: 1;
}

.test-button:hover {
  background: rgb(239 246 255);
  border-color: rgb(147 197 253);
  color: rgb(59 130 246);
}

.run-button:hover {
  background: rgb(243 232 255);
  border-color: rgb(196 181 253);
  color: rgb(147 51 234);
}

.test-button:disabled,
.run-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-card {
  background: white;
  border: 1px solid rgb(229 231 235);
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  min-height: 200px;
}

.action-card:hover {
  border-color: rgb(165 180 252);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgb(107 114 128);
}

/* Пульсация для активных элементов */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Анимация вращения */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Анимация масштабирования */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Градиентные фоны для карточек статистики */
.stats-card.border-blue-200 {
  background: linear-gradient(135deg, rgb(239 246 255) 0%, rgb(219 234 254) 100%);
}

.stats-card.border-purple-200 {
  background: linear-gradient(135deg, rgb(250 245 255) 0%, rgb(237 233 254) 100%);
}

.stats-card.border-emerald-200 {
  background: linear-gradient(135deg, rgb(236 253 245) 0%, rgb(209 250 229) 100%);
}
</style>
