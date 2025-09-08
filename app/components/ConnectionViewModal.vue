<template>
  <teleport to="body">
    <div
      v-if="isOpen && connection"
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
          <div class="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Детали подключения
                  </h3>
                  <span
                    :class="[
                      'status-badge',
                      connection.is_active ? 'status-active' : 'status-inactive'
                    ]"
                  >
                    {{ connection.is_active ? 'Активно' : 'Неактивно' }}
                  </span>
                </div>
                
                <!-- Connection Details -->
                <div class="space-y-6">
                  <!-- Basic Information -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="detail-group">
                      <div class="detail-label">ID</div>
                      <div class="detail-value">{{ connection.id }}</div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Название</div>
                      <div class="detail-value">{{ connection.name }}</div>
                    </div>
                  </div>

                  <!-- Vault Information -->
                  <div class="detail-group">
                    <div class="detail-label">Vault Path</div>
                    <div class="detail-value font-mono text-sm bg-gray-50 p-2 rounded">
                      {{ connection.vault_path || 'Не указан' }}
                    </div>
                  </div>

                  <!-- Timestamps -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="detail-group">
                      <div class="detail-label">Создано</div>
                      <div class="detail-value">
                        {{ formatDate(connection.created_at) }}
                      </div>
                    </div>
                    
                    <div class="detail-group">
                      <div class="detail-label">Обновлено</div>
                      <div class="detail-value">
                        {{ formatDate(connection.updated_at) }}
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
</template>

<script setup lang="ts">
import type { DatabaseConnection } from '~/types/api'

interface Props {
  isOpen: boolean
  connection?: DatabaseConnection | null
}

interface Emits {
  (e: 'close'): void
  (e: 'edit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const connectionsStore = useConnectionsStore()

// Reactive state
const testing = ref(false)
const testResult = ref<{ success: boolean; message?: string } | null>(null)

// Methods
const testConnection = async () => {
  if (!props.connection) return
  
  testing.value = true
  testResult.value = null
  
  try {
    const result = await connectionsStore.testConnection(props.connection.id)
    testResult.value = result
  } catch (error) {
    console.error('Connection test error:', error)
    testResult.value = {
      success: false,
      message: 'Ошибка при тестировании подключения'
    }
  } finally {
    testing.value = false
  }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Не указано'
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU')
}

// Clear test result when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    testResult.value = null
  }
})
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
