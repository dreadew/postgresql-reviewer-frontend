import { defineStore } from 'pinia'
import type { ScheduledTask, CreateScheduledTaskRequest, TaskExecution } from '~/types/api'

export const useSchedulerStore = defineStore('scheduler', {
  state: () => ({
    tasks: [] as ScheduledTask[],
    executions: [] as TaskExecution[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.tasks = await api.getScheduledTasks()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch scheduled tasks'
        console.error('Error fetching scheduled tasks:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTask(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const task = await api.getScheduledTask(id)
        
        // Update task in array if it exists, otherwise add it
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks[index] = task
        } else {
          this.tasks.push(task)
        }
        
        return task
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch scheduled task'
        console.error('Error fetching scheduled task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTask(data: CreateScheduledTaskRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const newTask = await api.createScheduledTask(data)
        this.tasks.push(newTask)
        return newTask
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create scheduled task'
        console.error('Error creating scheduled task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTask(id: number, data: Partial<CreateScheduledTaskRequest>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const updatedTask = await api.updateScheduledTask(id, data)
        const index = this.tasks.findIndex(task => task.id === id)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }
        return updatedTask
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update scheduled task'
        console.error('Error updating scheduled task:', error)
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
        await api.deleteScheduledTask(id)
        this.tasks = this.tasks.filter(task => task.id !== id)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete scheduled task'
        console.error('Error deleting scheduled task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async pauseTask(id: number) {
      try {
        const api = useApi()
        const result = await api.pauseScheduledTask(id)
        
        // Update task status locally
        const task = this.tasks.find(t => t.id === id)
        if (task) {
          task.is_active = false
        }
        
        return result
      } catch (error) {
        console.error('Error pausing scheduled task:', error)
        throw error
      }
    },

    async resumeTask(id: number) {
      try {
        const api = useApi()
        const result = await api.resumeScheduledTask(id)
        
        // Update task status locally
        const task = this.tasks.find(t => t.id === id)
        if (task) {
          task.is_active = true
        }
        
        return result
      } catch (error) {
        console.error('Error resuming scheduled task:', error)
        throw error
      }
    },

    async triggerTask(id: number) {
      try {
        const api = useApi()
        return await api.triggerScheduledTask(id)
      } catch (error) {
        console.error('Error triggering scheduled task:', error)
        throw error
      }
    },

    async fetchExecutions(taskId?: number, limit?: number) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.executions = await api.getTaskExecutions(taskId, limit)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch task executions'
        console.error('Error fetching task executions:', error)
      } finally {
        this.loading = false
      }
    },

    async getSchedulerStats() {
      try {
        const api = useApi()
        return await api.getSchedulerStats()
      } catch (error) {
        console.error('Error fetching scheduler stats:', error)
        throw error
      }
    },

    async getQueueStatus() {
      try {
        const api = useApi()
        return await api.getQueueStatus()
      } catch (error) {
        console.error('Error fetching queue status:', error)
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    activeTasks: (state) => state.tasks.filter(task => task.is_active),
    inactiveTasks: (state) => state.tasks.filter(task => !task.is_active),
    getTaskById: (state) => (id: number) => state.tasks.find(task => task.id === id),
    getExecutionsForTask: (state) => (taskId: number) => 
      state.executions.filter(execution => execution.task_id === taskId),
    recentExecutions: (state) => [...state.executions]
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 10),
  }
})
