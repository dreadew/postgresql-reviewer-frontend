<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">История запусков задачи #{{ taskId }}</h3>
              <div class="flex items-center space-x-2">
                <select v-model="statusFilter" class="px-3 py-1 border rounded">
                  <option value="">Все статусы</option>
                  <option value="pending">pending</option>
                  <option value="running">running</option>
                  <option value="completed">completed</option>
                  <option value="failed">failed</option>
                </select>
                <button @click="refresh" :disabled="loading" class="px-3 py-1 bg-blue-600 text-white rounded">{{ loading ? 'Загрузка...' : 'Обновить' }}</button>
                <button @click="close" class="px-3 py-1 border rounded">Закрыть</button>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="error" class="text-red-600">{{ error }}</div>

              <div v-if="loading" class="text-gray-600">Загрузка...</div>

              <div v-else>
                <div class="overflow-x-auto">
                  <table class="w-full text-left table-auto">
                    <thead>
                      <tr class="text-sm text-gray-600">
                        <th class="px-3 py-2">ID</th>
                        <th class="px-3 py-2">Статус</th>
                        <th class="px-3 py-2">Начат</th>
                        <th class="px-3 py-2">Завершен</th>
                        <th class="px-3 py-2">Сообщение об ошибке</th>
                        <th class="px-3 py-2">Параметры</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="exec in executions" :key="exec.id" class="border-t">
                        <td class="px-3 py-2 text-sm">{{ exec.id }}</td>
                        <td class="px-3 py-2 text-sm">{{ exec.status }}</td>
                        <td class="px-3 py-2 text-sm">{{ formatDate(exec.started_at) }}</td>
                        <td class="px-3 py-2 text-sm">{{ exec.completed_at ? formatDate(exec.completed_at) : '-' }}</td>
                        <td class="px-3 py-2 text-sm">{{ exec.error_message || '-' }}</td>
                        <td class="px-3 py-2 text-sm font-mono max-w-xs truncate">{{ formatParams(exec.result ?? exec) }}</td>
                      </tr>
                      <tr v-if="executions.length === 0">
                        <td colspan="6" class="px-3 py-4 text-center text-gray-500">Нет запусков</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <button @click="prevPage" :disabled="page === 1 || loading" class="px-3 py-1 border rounded">Назад</button>
                    <button @click="nextPage" :disabled="isLastPage || loading" class="px-3 py-1 border rounded">Далее</button>
                    <span class="text-sm text-gray-600">Страница {{ page }}</span>
                  </div>
                  <div>
                    <label for="pageSizeSelect" class="text-sm text-gray-600 mr-2">На странице</label>
                    <select id="pageSizeSelect" v-model.number="pageSize" class="px-2 py-1 border rounded">
                      <option :value="5">5</option>
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { TaskExecution } from '~/types/api'
import { useApi } from '~/composables/useApi'

const props = defineProps<{ isOpen: boolean; taskId: number | null }>()
const emit = defineEmits<('close')[]>()

const isOpen = ref(props.isOpen)
watch(() => props.isOpen, v => isOpen.value = v)

const taskId = ref<number | null>(props.taskId)
watch(() => props.taskId, v => taskId.value = v)

const executions = ref<TaskExecution[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const isLastPage = ref(false)

const api = useApi()

const fetchExecutions = async () => {
  if (!taskId.value) return
  loading.value = true
  error.value = null
  try {
    const offset = (page.value - 1) * pageSize.value
    const data = await api.getTaskExecutions(taskId.value, pageSize.value, offset, statusFilter.value || undefined)
    executions.value = data || []
    // If returned less than pageSize, mark last page
    isLastPage.value = (data.length < pageSize.value)
  } catch (err) {
    console.error('Error fetching executions:', err)
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

const refresh = () => fetchExecutions()

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchExecutions()
  }
}

const nextPage = () => {
  if (!isLastPage.value) {
    page.value += 1
    fetchExecutions()
  }
}

const close = () => emit('close')

const formatDate = (s?: string) => s ? new Date(s).toLocaleString('ru-RU') : '-'

const formatParams = (p: any) => {
  try { return JSON.stringify(p) } catch { return String(p) }
}

// Fetch when modal opens
watch(() => props.isOpen, (open) => {
  if (open) {
    page.value = 1
  // TaskExecutionsModal opened
    // If taskId is not yet provided by parent, wait for it
    if (!props.taskId) {
      const stop = watch(() => props.taskId, (val) => {
        if (val) {
          // received taskId, fetching
          fetchExecutions()
          stop()
        }
      })
    } else {
      fetchExecutions()
    }
  }
})

// Fetch when pagination or filter change while modal is open
watch([page, pageSize, statusFilter], () => {
  if (props.isOpen) {
  // params changed while modal open, fetching page
    fetchExecutions()
  }
})

onMounted(() => {
  if (props.isOpen) fetchExecutions()
})
</script>

<style scoped>
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
