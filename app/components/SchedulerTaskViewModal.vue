<template>
  <teleport to="body">
    <div
      v-if="isOpen && task"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Background overlay -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="$emit('close')"
        ></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Детали задачи планировщика
                  </h3>
                  <div class="flex items-center space-x-2">
                    <span :class="taskTypeClass(task.task_type)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ taskTypeLabel(task.task_type) }}
                    </span>
                    <span :class="task.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                          class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ task.is_active ? 'Активна' : 'Неактивна' }}
                    </span>
                  </div>
                </div>
                
                <!-- Task Details -->
                <div class="space-y-6">
                  <!-- Basic Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="detail-group">
                      <div class="detail-label">ID</div>
                      <div class="detail-value">{{ task.id }}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Название</div>
                      <div class="detail-value">{{ task.name }}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Подключение</div>
                      <div class="detail-value">{{ getConnectionName(task.connection_id) }}</div>
                    </div>

                    <div class="detail-group">
                      <div class="detail-label">Расписание (Cron)</div>
                      <div class="detail-value font-mono">{{ task.cron_schedule }}</div>
                    </div>

                    <div class="detail-group">
                      <div class="detail-label">Создана</div>
                      <div class="detail-value">{{ formatDate(task.created_at) }}</div>
                    </div>

                    <div class="detail-group">
                      <div class="detail-label">Обновлена</div>
                      <div class="detail-value">{{ formatDate(task.updated_at) }}</div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div v-if="task.description" class="detail-group">
                    <div class="detail-label">Описание</div>
                    <div class="detail-value">{{ task.description }}</div>
                  </div>

                  <!-- Task Parameters -->
                  <div class="border-t pt-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Параметры задачи</h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div v-if="task.task_params.environment" class="detail-group">
                        <div class="detail-label">Окружение</div>
                        <div class="detail-value">{{ task.task_params.environment }}</div>
                      </div>

                      <div v-if="task.task_params.output_format" class="detail-group">
                        <div class="detail-label">Формат вывода</div>
                        <div class="detail-value">{{ task.task_params.output_format }}</div>
                      </div>

                      <div v-if="task.task_params.detailed_analysis !== undefined" class="detail-group">
                        <div class="detail-label">Детальный анализ</div>
                        <div class="detail-value">{{ task.task_params.detailed_analysis ? 'Да' : 'Нет' }}</div>
                      </div>
                    </div>

                    <!-- Type-specific parameters -->
                    <div v-if="task.task_type === 'log_analysis'" class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-800">Параметры анализа логов</h5>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-if="task.task_params.log_level" class="detail-group">
                          <div class="detail-label">Уровень логов</div>
                          <div class="detail-value">{{ task.task_params.log_level }}</div>
                        </div>
                        <div v-if="task.task_params.time_range_hours" class="detail-group">
                          <div class="detail-label">Период анализа</div>
                          <div class="detail-value">{{ task.task_params.time_range_hours }} часов</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="task.task_type === 'config_check'" class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-800">Параметры проверки конфигурации</h5>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-if="task.task_params.check_performance !== undefined" class="detail-group">
                          <div class="detail-label">Проверка производительности</div>
                          <div class="detail-value">{{ task.task_params.check_performance ? 'Да' : 'Нет' }}</div>
                        </div>
                        <div v-if="task.task_params.check_security !== undefined" class="detail-group">
                          <div class="detail-label">Проверка безопасности</div>
                          <div class="detail-value">{{ task.task_params.check_security ? 'Да' : 'Нет' }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-if="task.task_type === 'custom_sql'" class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-800">SQL запрос</h5>
                      <div class="bg-gray-50 p-4 rounded-md">
                        <pre class="text-sm font-mono whitespace-pre-wrap">{{ task.task_params.custom_sql }}</pre>
                      </div>
                    </div>

                    <div v-if="task.task_type === 'table_analysis'" class="space-y-4">
                      <h5 class="text-sm font-medium text-gray-800">Параметры анализа таблиц</h5>
                      <div v-if="task.task_params.target_tables && task.task_params.target_tables.length > 0" class="detail-group">
                        <div class="detail-label">Целевые таблицы</div>
                        <div class="detail-value">
                          <div class="flex flex-wrap gap-1">
                            <span 
                              v-for="table in task.task_params.target_tables" 
                              :key="table"
                              class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {{ table }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-600 italic">
                        Анализ всех таблиц
                      </div>
                    </div>
                  </div>

                  <!-- Recent Executions -->
                  <div class="border-t pt-6">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-md font-medium text-gray-900">Последние выполнения</h4>
                      <button
                        @click="loadExecutions"
                        :disabled="loadingExecutions"
                        class="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {{ loadingExecutions ? 'Загрузка...' : 'Обновить' }}
                      </button>
                    </div>
                    
                    <div v-if="loadingExecutions" class="text-center py-4">
                      <div class="inline-flex items-center text-sm text-gray-600">
                        <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path>
                        </svg>
                        Загрузка...
                      </div>
                    </div>

                    <div v-else-if="executions.length === 0" class="text-center py-8 text-gray-500">
                      <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p class="text-sm">Нет выполнений</p>
                    </div>

                    <div v-else class="space-y-3">
                      <div 
                        v-for="execution in executions.slice(0, 5)" 
                        :key="execution.id"
                        class="bg-gray-50 p-3 rounded-md"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3">
                            <span :class="executionStatusClass(execution.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                              {{ executionStatusLabel(execution.status) }}
                            </span>
                            <span class="text-sm text-gray-600">{{ formatDate(execution.started_at) }}</span>
                          </div>
                          <div v-if="execution.duration_seconds" class="text-sm text-gray-500">
                            {{ execution.duration_seconds }}с
                          </div>
                        </div>
                        <div v-if="execution.error_message" class="mt-2 text-sm text-red-600">
                          {{ execution.error_message }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary btn-md w-full sm:w-auto"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SchedulerTask, TaskExecution, TaskType } from '~/types/api'

interface Props {
  isOpen: boolean
  task?: SchedulerTask | null
}

type Emits = {
  close: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const api = useApi()
const connectionsStore = useConnectionsStore()

const executions = ref<TaskExecution[]>([])
const loadingExecutions = ref(false)

onMounted(async () => {
  if (props.task) {
    await loadExecutions()
  }
})

const loadExecutions = async () => {
  if (!props.task) return
  
  loadingExecutions.value = true
  try {
    executions.value = await api.getSchedulerExecutions(props.task.id)
  } catch (err) {
    console.error('Error loading executions:', err)
  } finally {
    loadingExecutions.value = false
  }
}

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

const executionStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const executionStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Ожидание',
    running: 'Выполняется',
    success: 'Успешно',
    error: 'Ошибка'
  }
  return labels[status] || status
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
</script>

<style scoped>
.detail-group {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.btn {
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 150ms;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-md {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
