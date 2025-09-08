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
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="onSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {{ isEditing ? 'Редактировать задачу' : 'Создать задачу' }}
                  </h3>
                  
                  <!-- Form fields -->
                  <div class="space-y-4">
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
                          v-for="connection in connectionsStore.activeConnections" 
                          :key="connection.id"
                          :value="connection.id"
                        >
                          {{ connection.name }} ({{ connection.host }}:{{ connection.port }})
                        </option>
                      </select>
                    </div>

                    <div>
                      <label for="task-type" class="label">Тип задачи</label>
                      <select
                        id="task-type"
                        v-model="form.task_type"
                        class="input"
                        required
                      >
                        <option value="">Выберите тип</option>
                        <option value="config_check">Проверка конфигурации</option>
                        <option value="query_analysis">Анализ запросов</option>
                        <option value="log_analysis">Анализ логов</option>
                      </select>
                    </div>

                    <div>
                      <label for="task-schedule" class="label">Расписание (cron)</label>
                      <input
                        id="task-schedule"
                        v-model="form.schedule"
                        type="text"
                        class="input"
                        required
                        placeholder="*/30 * * * *"
                      />
                      <p class="mt-1 text-sm text-gray-500">
                        Пример: */30 * * * * (каждые 30 минут)
                      </p>
                    </div>

                    <div class="flex items-center">
                      <input
                        id="task-active"
                        v-model="form.is_active"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label for="task-active" class="ml-2 block text-sm text-gray-900">
                        Активная задача
                      </label>
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
                {{ loading ? 'Сохранение...' : 'Сохранить' }}
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
import type { Task, CreateTaskRequest } from '~/types/api'

interface Props {
  isOpen: boolean
  task?: Task | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tasksStore = useTasksStore()
const connectionsStore = useConnectionsStore()

// Computed
const isEditing = computed(() => !!props.task)

// Reactive state
const loading = ref(false)
const form = reactive<CreateTaskRequest>({
  name: '',
  connection_id: 0,
  task_type: 'config_check',
  schedule: '*/30 * * * *',
  is_active: true
})

// Watch for task changes to populate form
watch(() => props.task, (task) => {
  if (task) {
    form.name = task.name
    form.connection_id = task.connection_id
    form.task_type = task.task_type
    form.schedule = task.schedule
    form.is_active = task.is_active
  } else {
    // Reset form for new task
    Object.assign(form, {
      name: '',
      connection_id: 0,
      task_type: 'config_check',
      schedule: '*/30 * * * *',
      is_active: true
    })
  }
}, { immediate: true })

// Methods
const onSubmit = async () => {
  loading.value = true
  
  try {
    if (isEditing.value && props.task) {
      // Update existing task
      await tasksStore.updateTask(props.task.id, form)
    } else {
      // Create new task
      await tasksStore.createTask(form)
    }
    
    emit('saved')
  } catch (error) {
    console.error('Error saving task:', error)
  } finally {
    loading.value = false
  }
}

// Load connections on mount
onMounted(() => {
  if (connectionsStore.connections.length === 0) {
    connectionsStore.fetchConnections()
  }
})
</script>
