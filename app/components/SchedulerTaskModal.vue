<template>
  <teleport to="body">
    <div
      v-if="isOpen"
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
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form @submit.prevent="onSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {{ isEditing ? 'Редактировать задачу планировщика' : 'Создать задачу планировщика' }}
                  </h3>
                  
                  <!-- Form fields -->
                  <div class="space-y-4">
                    <!-- Basic Information -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label for="task-name" class="label">Название</label>
                        <input
                          id="task-name"
                          v-model="form.name"
                          type="text"
                          class="input"
                          required
                          placeholder="Введите название задачи"
                        />
                      </div>

                      <div>
                        <label for="task-connection" class="label">Подключение</label>
                        <select
                          id="task-connection"
                          v-model="form.connection_id"
                          class="input"
                          required
                        >
                          <option value="">Выберите подключение</option>
                          <option 
                            v-for="connection in connections" 
                            :key="connection.id" 
                            :value="connection.id"
                          >
                            {{ connection.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label for="task-description" class="label">Описание</label>
                      <textarea
                        id="task-description"
                        v-model="form.description"
                        class="input"
                        rows="2"
                        placeholder="Описание задачи (необязательно)"
                      ></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label for="task-type" class="label">Тип задачи</label>
                        <select
                          id="task-type"
                          v-model="form.task_type"
                          class="input"
                          required
                          @change="onTaskTypeChange"
                        >
                          <option value="">Выберите тип</option>
                          <option value="log_analysis">Анализ логов</option>
                          <option value="config_check">Проверка конфигурации</option>
                          <option value="query_analysis">Анализ запросов</option>
                          <option value="custom_sql">Кастомный SQL</option>
                          <option value="table_analysis">Анализ таблиц</option>
                        </select>
                      </div>

                      <div>
                        <label for="cron-schedule" class="label">Расписание (Cron)</label>
                        <input
                          id="cron-schedule"
                          v-model="form.cron_schedule"
                          type="text"
                          class="input"
                          required
                          placeholder="0 2 * * *"
                        />
                        <p class="text-xs text-gray-500 mt-1">Пример: 0 2 * * * (каждый день в 2:00)</p>
                      </div>
                    </div>

                    <div class="flex items-center">
                      <input
                        id="is-active"
                        v-model="form.is_active"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="is-active" class="ml-2 block text-sm text-gray-900">
                        Активная задача
                      </label>
                    </div>

                    <!-- Task Parameters -->
                    <div v-if="form.task_type" class="border-t pt-4">
                      <h4 class="text-md font-medium text-gray-900 mb-3">Параметры задачи</h4>
                      
                      <!-- Common Parameters -->
                      <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label for="environment" class="label">Окружение</label>
                            <select
                              id="environment"
                              v-model="form.task_params.environment"
                              class="input"
                            >
                              <option value="">Не указано</option>
                              <option value="development">Development</option>
                              <option value="staging">Staging</option>
                              <option value="production">Production</option>
                            </select>
                          </div>

                          <div>
                            <label for="output-format" class="label">Формат вывода</label>
                            <select
                              id="output-format"
                              v-model="form.task_params.output_format"
                              class="input"
                            >
                              <option value="json">JSON</option>
                              <option value="csv">CSV</option>
                            </select>
                          </div>
                        </div>

                        <div class="flex items-center">
                          <input
                            id="detailed-analysis"
                            v-model="form.task_params.detailed_analysis"
                            type="checkbox"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label for="detailed-analysis" class="ml-2 block text-sm text-gray-900">
                            Детальный анализ
                          </label>
                        </div>

                        <!-- Log Analysis Parameters -->
                        <div v-if="form.task_type === 'log_analysis'" class="space-y-4">
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label for="log-level" class="label">Уровень логов</label>
                              <select
                                id="log-level"
                                v-model="form.task_params.log_level"
                                class="input"
                              >
                                <option value="">Все</option>
                                <option value="debug">Debug</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                              </select>
                            </div>

                            <div>
                              <label for="log-source" class="label">Источник логов</label>
                              <select
                                id="log-source"
                                v-model="form.task_params.log_source"
                                class="input"
                              >
                                <option value="postgresql">PostgreSQL</option>
                                <option value="application">Application</option>
                              </select>
                            </div>

                            <div>
                              <label for="time-range" class="label">Период анализа (часы)</label>
                              <input
                                id="time-range"
                                v-model.number="form.task_params.time_range_hours"
                                type="number"
                                class="input"
                                min="1"
                                max="168"
                                placeholder="24"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Config Check Parameters -->
                        <div v-if="form.task_type === 'config_check'" class="space-y-4">
                          <div>
                            <label for="config-sections" class="label">Секции конфигурации</label>
                            <div id="config-sections" class="grid grid-cols-2 gap-2">
                              <div class="flex items-center">
                                <input
                                  id="config-memory"
                                  v-model="configSections.memory"
                                  type="checkbox"
                                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label for="config-memory" class="ml-2 block text-sm text-gray-900">
                                  Memory
                                </label>
                              </div>
                              <div class="flex items-center">
                                <input
                                  id="config-wal"
                                  v-model="configSections.wal"
                                  type="checkbox"
                                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label for="config-wal" class="ml-2 block text-sm text-gray-900">
                                  WAL
                                </label>
                              </div>
                              <div class="flex items-center">
                                <input
                                  id="config-query-planning"
                                  v-model="configSections.query_planning"
                                  type="checkbox"
                                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label for="config-query-planning" class="ml-2 block text-sm text-gray-900">
                                  Query Planning
                                </label>
                              </div>
                              <div class="flex items-center">
                                <input
                                  id="config-autovacuum"
                                  v-model="configSections.autovacuum"
                                  type="checkbox"
                                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label for="config-autovacuum" class="ml-2 block text-sm text-gray-900">
                                  Autovacuum
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <div class="space-y-2">
                            <div class="flex items-center">
                              <input
                                id="check-performance"
                                v-model="form.task_params.check_performance"
                                type="checkbox"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label for="check-performance" class="ml-2 block text-sm text-gray-900">
                                Проверка производительности
                              </label>
                            </div>

                            <div class="flex items-center">
                              <input
                                id="check-security"
                                v-model="form.task_params.check_security"
                                type="checkbox"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label for="check-security" class="ml-2 block text-sm text-gray-900">
                                Проверка безопасности
                              </label>
                            </div>
                          </div>
                        </div>

                        <!-- Custom SQL Parameters -->
                        <div v-if="form.task_type === 'custom_sql'" class="space-y-4">
                          <div>
                            <label for="custom-sql" class="label">SQL запрос</label>
                            <textarea
                              id="custom-sql"
                              v-model="form.task_params.custom_sql"
                              class="input"
                              rows="4"
                              placeholder="SELECT * FROM pg_stat_activity;"
                              required
                            ></textarea>
                          </div>
                          
                          <div>
                            <label for="query-timeout" class="label">Timeout запроса (секунды)</label>
                            <input
                              id="query-timeout"
                              v-model.number="form.task_params.query_timeout"
                              type="number"
                              class="input"
                              min="1"
                              max="3600"
                              placeholder="300"
                            />
                          </div>
                        </div>

                        <!-- Table Analysis Parameters -->
                        <div v-if="form.task_type === 'table_analysis'" class="space-y-4">
                          <div>
                            <label for="target-tables" class="label">Целевые таблицы</label>
                            <input
                              id="target-tables"
                              v-model="targetTablesInput"
                              type="text"
                              class="input"
                              placeholder="table1, table2, table3"
                            />
                            <p class="text-xs text-gray-500 mt-1">Разделите названия таблиц запятыми. Оставьте пустым для анализа всех таблиц.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary btn-md w-full sm:ml-3 sm:w-auto"
              >
                {{ loading ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Создать') }}
              </button>
              <button
                type="button"
                @click="$emit('close')"
                class="btn btn-secondary btn-md mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { SchedulerTask, CreateSchedulerTaskRequest, TaskType } from '~/types/api'

interface Props {
  isOpen: boolean
  task?: SchedulerTask | null
}

interface Emits {
  (e: 'close'): void
  (e: 'created'): void
  (e: 'updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const api = useApi()
const connectionsStore = useConnectionsStore()

const loading = ref(false)
const error = ref<string | null>(null)
const targetTablesInput = ref('')

// Config sections for config_check task type
const configSections = ref({
  memory: false,
  wal: false,
  query_planning: false,
  autovacuum: false
})

// Computed
const isEditing = computed(() => !!props.task)
const connections = computed(() => connectionsStore.connections)

// Form data
const form = ref<CreateSchedulerTaskRequest>({
  name: '',
  task_type: '' as TaskType,
  connection_id: 0,
  cron_schedule: '0 2 * * *',
  description: '',
  task_params: {
    output_format: 'json',
    detailed_analysis: false
  },
  is_active: true
})

// Load connections on mount
onMounted(async () => {
  await connectionsStore.fetchConnections()
})

// Reset form function
const resetForm = () => {
  form.value = {
    name: '',
    task_type: '' as TaskType,
    connection_id: 0,
    cron_schedule: '0 2 * * *',
    description: '',
    task_params: {
      output_format: 'json',
      detailed_analysis: false
    },
    is_active: true
  }
  targetTablesInput.value = ''
  configSections.value = {
    memory: false,
    wal: false,
    query_planning: false,
    autovacuum: false
  }
  error.value = null
}

// Watch for task prop changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = {
      name: newTask.name,
      task_type: newTask.task_type,
      connection_id: newTask.connection_id,
      cron_schedule: newTask.cron_schedule,
      description: newTask.description || '',
      task_params: { ...newTask.task_params },
      is_active: newTask.is_active
    }
    
    // Handle target tables for table analysis
    if (newTask.task_type === 'table_analysis' && newTask.task_params.target_tables) {
      targetTablesInput.value = newTask.task_params.target_tables.join(', ')
    }
    
    // Handle config sections for config check
    if (newTask.task_type === 'config_check' && newTask.task_params.config_sections) {
      configSections.value = {
        memory: newTask.task_params.config_sections.includes('memory'),
        wal: newTask.task_params.config_sections.includes('wal'),
        query_planning: newTask.task_params.config_sections.includes('query_planning'),
        autovacuum: newTask.task_params.config_sections.includes('autovacuum')
      }
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Watch target tables input
watch(targetTablesInput, (value) => {
  if (form.value.task_type === 'table_analysis') {
    form.value.task_params.target_tables = value
      ? value.split(',').map(t => t.trim()).filter(t => t)
      : undefined
  }
})

// Watch config sections
watch(configSections, (sections) => {
  if (form.value.task_type === 'config_check') {
    const selectedSections = Object.entries(sections)
      .filter(([_, selected]) => selected)
      .map(([section, _]) => section)
    
    form.value.task_params.config_sections = selectedSections.length > 0 ? selectedSections : undefined
  }
}, { deep: true })

const onTaskTypeChange = () => {
  // Reset task parameters when task type changes
  form.value.task_params = {
    output_format: form.value.task_params.output_format || 'json',
    detailed_analysis: form.value.task_params.detailed_analysis || false
  }
  targetTablesInput.value = ''
  configSections.value = {
    memory: false,
    wal: false,
    query_planning: false,
    autovacuum: false
  }
}

const onSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    if (isEditing.value && props.task) {
      await api.updateSchedulerTask(props.task.id, form.value)
      emit('updated')
    } else {
      await api.createSchedulerTask(form.value)
      emit('created')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3b82f6;
  border-color: #3b82f6;
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

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
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
