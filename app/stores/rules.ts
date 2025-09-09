import { defineStore } from 'pinia'
import type { Rule, CreateRuleRequest } from '~/types/api'

export const useRulesStore = defineStore('rules', {
  state: () => ({
    rules: [] as Rule[],
    loading: false,
    error: null as string | null,
    selectedCategory: '' as string,
  }),

  actions: {
    async fetchRules(category?: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.rules = await api.getRules(category)
        if (category) {
          this.selectedCategory = category
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch rules'
        console.error('Error fetching rules:', error)
      } finally {
        this.loading = false
      }
    },

    async getRule(category: string, filename: string) {
      try {
        const api = useApi()
        return await api.getRule(category, filename)
      } catch (error) {
        console.error('Error fetching rule:', error)
        throw error
      }
    },

    async createRule(data: CreateRuleRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const newRule = await api.createRule(data)
        this.rules.push(newRule)
        return newRule
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create rule'
        console.error('Error creating rule:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRule(category: string, filename: string, data: Partial<CreateRuleRequest>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const updatedRule = await api.updateRule(category, filename, data)
        const index = this.rules.findIndex(rule => 
          rule.category === category && rule.filename === filename
        )
        if (index !== -1) {
          this.rules[index] = updatedRule
        }
        return updatedRule
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update rule'
        console.error('Error updating rule:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRule(category: string, filename: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        await api.deleteRule(category, filename)
        this.rules = this.rules.filter(rule => 
          !(rule.category === category && rule.filename === filename)
        )
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete rule'
        console.error('Error deleting rule:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setCategory(category: string) {
      this.selectedCategory = category
      this.fetchRules(category || undefined)
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    rulesByCategory: (state) => (category: string) => 
      state.rules.filter(rule => rule.category === category),
    configRules: (state) => state.rules.filter(rule => rule.category === 'config'),
    sqlRules: (state) => state.rules.filter(rule => rule.category === 'sql'),
  logsRules: (state) => state.rules.filter(rule => rule.category === 'logs'),
  }
})
