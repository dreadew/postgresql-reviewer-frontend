<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Управление подключениями к БД</h2>
      <button
        @click="openCreateModal"
        class="btn btn-primary btn-md"
      >
        Добавить подключение
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="connectionsStore.error"
      class="bg-red-50 border border-red-200 rounded-md p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ connectionsStore.error }}</p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              @click="connectionsStore.clearError()"
              class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="connectionsStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Connections Table -->
    <div v-else class="card overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="connection in connectionsStore.connections" :key="connection.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ connection.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ connection.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'status-badge',
                  connection.is_active ? 'status-active' : 'status-inactive'
                ]"
              >
                {{ connection.is_active ? 'Активно' : 'Неактивно' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="viewConnection(connection)"
                class="btn btn-secondary btn-sm"
              >
                Просмотр
              </button>
              <button
                @click="testConnection(connection.id)"
                class="btn btn-secondary btn-sm"
                :disabled="testingConnection === connection.id"
              >
                {{ testingConnection === connection.id ? 'Тест...' : 'Тест' }}
              </button>
              <button
                @click="editConnection(connection)"
                class="btn btn-secondary btn-sm"
              >
                Редактировать
              </button>
              <button
                @click="deleteConnection(connection.id)"
                class="btn btn-danger btn-sm"
                :disabled="connectionsStore.loading"
              >
                Удалить
              </button>
            </td>
          </tr>
          <tr v-if="connectionsStore.connections.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              Подключения не найдены
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <ConnectionModal
      :is-open="isModalOpen"
      :connection="selectedConnection"
      @close="closeModal"
      @saved="onConnectionSaved"
    />

    <!-- View Modal -->
    <ConnectionViewModal
      :is-open="isViewModalOpen"
      :connection="viewingConnection"
      @close="closeViewModal"
      @edit="editFromView"
    />
  </div>
</template>

<script setup lang="ts">
import type { DatabaseConnection } from '~/types/api'

const connectionsStore = useConnectionsStore()
const toast = inject('toast') as any

// Reactive state
const isModalOpen = ref(false)
const selectedConnection = ref<DatabaseConnection | null>(null)
const testingConnection = ref<number | null>(null)
const isViewModalOpen = ref(false)
const viewingConnection = ref<DatabaseConnection | null>(null)

// Methods
const openCreateModal = () => {
  selectedConnection.value = null
  isModalOpen.value = true
}

const viewConnection = (connection: DatabaseConnection) => {
  viewingConnection.value = connection
  isViewModalOpen.value = true
}

const editConnection = (connection: DatabaseConnection) => {
  selectedConnection.value = connection
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedConnection.value = null
}

const closeViewModal = () => {
  isViewModalOpen.value = false
  viewingConnection.value = null
}

const editFromView = () => {
  if (viewingConnection.value) {
    selectedConnection.value = viewingConnection.value
    closeViewModal()
    isModalOpen.value = true
  }
}

const onConnectionSaved = () => {
  closeModal()
  toast?.success('Подключение успешно сохранено!')
}

const testConnection = async (id: number) => {
  testingConnection.value = id
  try {
    const result = await connectionsStore.testConnection(id)
    if (result.success) {
      toast?.success('Подключение успешно!')
    } else {
      toast?.error(`Ошибка подключения: ${result.message}`)
    }
  } catch (error) {
    console.error('Test connection error:', error)
    toast?.error('Ошибка при тестировании подключения')
  } finally {
    testingConnection.value = null
  }
}

const deleteConnection = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить это подключение?')) {
    return
  }

  try {
    await connectionsStore.deleteConnection(id)
    toast?.success('Подключение удалено!')
  } catch (error) {
    console.error('Delete connection error:', error)
    toast?.error('Ошибка при удалении подключения')
  }
}
</script>
