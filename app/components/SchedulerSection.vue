<template>
  <div class="space-y-6">
    <!-- Statistics Section -->
    <SchedulerStatsSection />

    <!-- Tasks Management -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Планировщик задач</h3>
          <p class="text-sm text-gray-600 mt-1">Управление автоматическими задачами анализа PostgreSQL</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Создать задачу
        </button>
      </div>
    </div>

    <!-- Filter and Stats -->
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex space-x-4">
          <select v-model="filter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Все задачи</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
          <select v-model="typeFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Все типы</option>
            <option value="log_analysis">Анализ логов</option>
            <option value="config_check">Проверка конфигурации</option>
            <option value="query_analysis">Анализ запросов</option>
            <option value="custom_sql">Кастомный SQL</option>
            <option value="table_analysis">Анализ таблиц</option>
          </select>
        </div>
        <div class="text-sm text-gray-600">
          Найдено задач: {{ filteredTasks.length }}
        </div>
      </div>
    </div>

    <!-- Tasks List -->
    <div class="divide-y divide-gray-200">
      <div v-if="loading" class="p-6 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
          </svg>
          Загрузка задач...
        </div>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="p-6 text-center text-gray-500">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Задачи не найдены</h3>
        <p class="text-gray-600">{{ filter === 'all' ? 'Создайте первую задачу для начала автоматизации' : 'Нет задач с выбранными фильтрами' }}</p>
      </div>

      <div v-else>
        <div v-for="task in filteredTasks" :key="task.id" class="p-6 hover:bg-gray-50 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h4 class="text-lg font-medium text-gray-900">{{ task.name }}</h4>
                <span :class="taskTypeClass(task.task_type)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ taskTypeLabel(task.task_type) }}
                </span>
                <span :class="task.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                      class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ task.is_active ? 'Активна' : 'Неактивна' }}
                </span>
              </div>
              <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                <span>📅 {{ task.cron_schedule }}</span>
                <span>🔗 {{ getConnectionName(task.connection_id) }}</span>
                <span v-if="task.description">📝 {{ task.description }}</span>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                Создана: {{ formatDate(task.created_at) }}
              </div>
            </div>
            <div class="flex items-center space-x-2 ml-4">
              <button
                @click="executeTask(task.id)"
                :disabled="executingTasks.has(task.id)"
                class="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {{ executingTasks.has(task.id) ? 'Выполняется...' : '▶ Запустить' }}
              </button>
              <button
                @click="viewTask(task)"
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                👁 Просмотр
              </button>
              <button
                @click="editTask(task)"
                class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
              >
                ✏ Редактировать
              </button>
              <button
                @click="deleteTask(task.id)"
                class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
              >
                🗑 Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-50 border-l-4 border-red-400">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 class="text-red-800 font-medium">Ошибка</h4>
          <p class="text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
    </div>

  <!-- Create Task Modal -->
  <SchedulerTaskModal
    :is-open="showCreateModal"
    @close="showCreateModal = false"
    @created="onTaskCreated"
  />

  <!-- Edit Task Modal -->
  <SchedulerTaskModal
    v-if="showEditModal && editingTask"
    :is-open="showEditModal"
    :task="editingTask"
    @close="showEditModal = false"
    @updated="onTaskUpdated"
  />

  <!-- View Task Modal -->
  <SchedulerTaskViewModal
    :is-open="showViewModal"
    :task="viewingTask"
    @close="showViewModal = false"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SchedulerTask, TaskType } from '~/types/api'
import SchedulerStatsSection from './SchedulerStatsSection.vue'

const api = useApi()
const connectionsStore = useConnectionsStore()

const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<SchedulerTask[]>([])
const filter = ref<'all' | 'active' | 'inactive'>('all')
const typeFilter = ref<'all' | TaskType>('all')
const executingTasks = ref(new Set<number>())

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const editingTask = ref<SchedulerTask | null>(null)
const viewingTask = ref<SchedulerTask | null>(null)

// Load data
onMounted(async () => {
  await Promise.all([
    loadTasks(),
    connectionsStore.fetchConnections()
  ])
})

const loadTasks = async () => {
  loading.value = true
  error.value = null
  try {
    tasks.value = await api.getSchedulerTasks()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при загрузке задач'
  } finally {
    loading.value = false
  }
}

// Computed
const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (filter.value === 'active') {
    filtered = filtered.filter(task => task.is_active)
  } else if (filter.value === 'inactive') {
    filtered = filtered.filter(task => !task.is_active)
  }

  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(task => task.task_type === typeFilter.value)
  }

  return filtered
})

// Methods
const taskTypeClass = (type: TaskType): string => {
  const classes = {
    log_analysis: 'bg-blue-100 text-blue-800',
    config_check: 'bg-green-100 text-green-800',
    query_analysis: 'bg-purple-100 text-purple-800',
    custom_sql: 'bg-orange-100 text-orange-800',
    table_analysis: 'bg-indigo-100 text-indigo-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const taskTypeLabel = (type: TaskType): string => {
  const labels = {
    log_analysis: 'Анализ логов',
    config_check: 'Проверка конфигурации',
    query_analysis: 'Анализ запросов',
    custom_sql: 'Кастомный SQL',
    table_analysis: 'Анализ таблиц'
  }
  return labels[type] || type
}

const getConnectionName = (connectionId: number): string => {
  const connection = connectionsStore.getConnectionById(connectionId)
  return connection ? connection.name : `Connection ${connectionId}`
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Не указана'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const executeTask = async (taskId: number) => {
  executingTasks.value.add(taskId)
  try {
    const result = await api.executeSchedulerTask(taskId)
    // Show success message
    console.log(`Задача запущена! ID выполнения: ${result.execution_id}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при выполнении задачи'
  } finally {
    executingTasks.value.delete(taskId)
  }
}

const viewTask = (task: SchedulerTask) => {
  viewingTask.value = task
  showViewModal.value = true
}

const editTask = (task: SchedulerTask) => {
  editingTask.value = task
  showEditModal.value = true
}

const deleteTask = async (taskId: number) => {
  if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return
  
  try {
    await api.deleteSchedulerTask(taskId)
    await loadTasks()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка при удалении задачи'
  }
}

const onTaskCreated = () => {
  showCreateModal.value = false
  loadTasks()
}

const onTaskUpdated = () => {
  showEditModal.value = false
  editingTask.value = null
  loadTasks()
}
</script>
