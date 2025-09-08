import { defineStore } from 'pinia'
import type { DatabaseConnection, CreateConnectionRequest } from '~/types/api'

export const useConnectionsStore = defineStore('connections', {
  state: () => ({
    connections: [] as DatabaseConnection[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchConnections() {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.connections = await api.getConnections()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch connections'
        console.error('Error fetching connections:', error)
      } finally {
        this.loading = false
      }
    },

    async createConnection(data: CreateConnectionRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const newConnection = await api.createConnection(data)
        this.connections.push(newConnection)
        return newConnection
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create connection'
        console.error('Error creating connection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateConnection(id: number, data: Partial<CreateConnectionRequest>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const updatedConnection = await api.updateConnection(id, data)
        const index = this.connections.findIndex(conn => conn.id === id)
        if (index !== -1) {
          this.connections[index] = updatedConnection
        }
        return updatedConnection
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update connection'
        console.error('Error updating connection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteConnection(id: number) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        await api.deleteConnection(id)
        this.connections = this.connections.filter(conn => conn.id !== id)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete connection'
        console.error('Error deleting connection:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async testConnection(id: number) {
      try {
        const api = useApi()
        return await api.testConnection(id)
      } catch (error) {
        console.error('Error testing connection:', error)
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    activeConnections: (state) => state.connections.filter(conn => conn.is_active),
    getConnectionById: (state) => (id: number) => state.connections.find(conn => conn.id === id)
  }
})
