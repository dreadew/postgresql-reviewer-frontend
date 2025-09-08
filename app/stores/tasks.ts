import { defineStore } from 'pinia'
import type { Task, CreateTaskRequest } from '~/types/api'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.tasks = await api.getTasks()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch tasks'
        console.error('Error fetching tasks:', error)
      } finally {
        this.loading = false
      }
    },

    async createTask(data: CreateTaskRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const newTask = await api.createTask(data)
        this.tasks.push(newTask)
        return newTask
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create task'
        console.error('Error creating task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTask(id: number, data: Partial<CreateTaskRequest>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const updatedTask = await api.updateTask(id, data)
        const index = this.tasks.findIndex(task => task.id === id)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }
        return updatedTask
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update task'
        console.error('Error updating task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTask(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        await api.deleteTask(id)
        this.tasks = this.tasks.filter(task => task.id !== id)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete task'
        console.error('Error deleting task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async runTask(id: number) {
      try {
        const api = useApi()
        return await api.runTask(id)
      } catch (error) {
        console.error('Error running task:', error)
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    activeTasks: (state) => state.tasks.filter(task => task.is_active),
    getTaskById: (state) => (id: number) => state.tasks.find(task => task.id === id),
    tasksByType: (state) => (type: string) => state.tasks.filter(task => task.task_type === type)
  }
})
