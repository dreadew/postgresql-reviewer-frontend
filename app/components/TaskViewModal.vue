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
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div class="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Детали задачи
                  </h3>
                  <span
                    :class="[
                      'status-badge',
                      task.is_active ? 'status-active' : 'status-inactive'
                    ]"
                  >
                    {{ task.is_active ? 'Активна' : 'Неактивна' }}
                  </span>
                </div>
                
                <!-- Task Details -->
                <div class="space-y-6">
                  <!-- Basic Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="detail-group">
                      <div class="detail-label">ID</div>
                      <div class="detail-value">{{ task.id }}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Название</div>
                      <div class="detail-value">{{ task.name }}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Тип задачи</div>
                      <div class="detail-value">{{ getTaskTypeLabel(task.task_type) }}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Расписание (cron)</div>
                      <div class="detail-value font-mono text-sm">{{ task.schedule }}</div>
                    </div>

                    <div class="detail-group">
                      <div class="detail-label">ID подключения</div>
                      <div class="detail-value">{{ task.connection_id }}</div>
                    </div>
                  </div>

                  <!-- Timestamps -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="detail-group">
                      <div class="detail-label">Создана</div>
                      <div class="detail-value">
                        {{ formatDate(task.created_at) }}
                      </div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Обновлена</div>
                      <div class="detail-value">
                        {{ formatDate(task.updated_at) }}
                      </div>
                    </div>
                  </div>

                  <!-- Task Execution Section -->
                  <div class="border-t pt-6">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-md font-medium text-gray-900">Управление задачей</h4>
                        <div class="flex items-center space-x-2">
                          <button
                            @click="runTask"
                            :disabled="running"
                            class="btn btn-primary btn-sm"
                          >
                            {{ running ? 'Запуск...' : 'Запустить задачу' }}
                          </button>
                          <button
                            @click="openExecutions"
                            class="btn btn-secondary btn-sm"
                          >
                            История запусков
                          </button>
                        </div>
                    </div>
                    
                    <!-- Run Result -->
                    <div v-if="runResult" class="mt-4">
                      <div
                        :class="[
                          'p-3 rounded-md text-sm',
                          runResult.success
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        ]"
                      >
                        <div class="flex items-center">
                          <div class="flex-shrink-0">
                            <svg
                              v-if="runResult.success"
                              class="h-5 w-5 text-green-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            <svg
                              v-else
                              class="h-5 w-5 text-red-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                          </div>
                          <div class="ml-3">
                            <p class="font-medium">
                              {{ runResult.success ? 'Задача запущена успешно!' : 'Ошибка запуска задачи' }}
                            </p>
                            <p v-if="runResult.message" class="mt-1">
                              {{ runResult.message }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="bg-gray-50 px-6 py-3 sm:flex sm:flex-row-reverse">
            <button
              @click="$emit('edit')"
              class="btn btn-primary btn-md w-full sm:ml-3 sm:w-auto"
            >
              Редактировать
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary btn-md mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
  <TaskExecutionsModal :isOpen="executionsOpen" :taskId="props.task?.id ?? null" @close="closeExecutions" />
</template>

<script setup lang="ts">
import type { Task } from '~/types/api'
import TaskExecutionsModal from '~/components/TaskExecutionsModal.vue'

interface Props {
  isOpen: boolean
  task?: Task | null
}

interface Emits {
  (e: 'close'): void
  (e: 'edit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tasksStore = useTasksStore()

// Reactive state
const running = ref(false)
const runResult = ref<{ success: boolean; message?: string } | null>(null)

// Methods
const runTask = async () => {
  if (!props.task) return
  
  running.value = true
  runResult.value = null
  
  try {
    const result = await tasksStore.runTask(props.task.id)
    // API older shape: { message: string }
    if (result && typeof result === 'object' && 'success' in result) {
      runResult.value = result as { success: boolean; message?: string }
    } else {
      runResult.value = { success: true, message: (result && (result as any).message) || 'Запущено' }
    }
  } catch (error) {
    console.error('Task run error:', error)
    runResult.value = {
      success: false,
      message: 'Ошибка при запуске задачи'
    }
  } finally {
    running.value = false
  }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Не указано'
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU')
}

const getTaskTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'config_check': 'Проверка конфигурации',
    'query_analysis': 'Анализ запросов',
    'log_analysis': 'Анализ логов'
  }
  return labels[type] || type
}

// Clear run result when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    runResult.value = null
  }
})

// Executions modal state
const executionsOpen = ref(false)
const openExecutions = () => {
  executionsOpen.value = true
}
const closeExecutions = () => { executionsOpen.value = false }
</script>

<style scoped>
.detail-group {
  margin-bottom: 1rem;
}

.detail-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(55 65 81);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.875rem;
  color: rgb(17 24 39);
  background-color: rgb(249 250 251);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgb(229 231 235);
}
</style>
