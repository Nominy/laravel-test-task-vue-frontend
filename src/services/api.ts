import axios from 'axios'
import type { ApiResponse, ApiFilters, Stock, Income, Sale, Order } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const API_KEY = import.meta.env.VITE_API_KEY || ''

// Validate required environment variables
if (!API_KEY) {
  console.error('VITE_API_KEY is required but not set in environment variables')
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    key: API_KEY,
  }
  return config
})

export class ApiService {
  static async getStocks(filters: Omit<ApiFilters, 'key'> = {}): Promise<ApiResponse<Stock>> {
    // For stocks, dateFrom is mandatory and must be today or future
    const today = new Date().toISOString().split('T')[0]
    const params = {
      ...filters,
      dateFrom: filters.dateFrom || today, // Use provided dateFrom or default to today
      // dateTo is optional for stocks
    }
    const response = await apiClient.get('/stocks', { params })
    return response.data
  }

  static async getIncomes(filters: Omit<ApiFilters, 'key'> = {}): Promise<ApiResponse<Income>> {
    // For incomes, both dateFrom and dateTo are mandatory
    const today = new Date().toISOString().split('T')[0]
    const params = {
      ...filters,
      dateFrom: filters.dateFrom || today,
      dateTo: filters.dateTo || today,
    }
    const response = await apiClient.get('/incomes', { params })
    return response.data
  }

  static async getSales(filters: Omit<ApiFilters, 'key'> = {}): Promise<ApiResponse<Sale>> {
    // For sales, dateFrom is mandatory (dateTo is optional)
    const today = new Date().toISOString().split('T')[0]
    const params = {
      ...filters,
      dateFrom: filters.dateFrom || today,
      // dateTo is optional, only include if provided
      ...(filters.dateTo && { dateTo: filters.dateTo }),
    }
    const response = await apiClient.get('/sales', { params })
    return response.data
  }

  static async getOrders(filters: Omit<ApiFilters, 'key'> = {}): Promise<ApiResponse<Order>> {
    // For orders, dateFrom is mandatory (dateTo is optional)
    const today = new Date().toISOString().split('T')[0]
    const params = {
      ...filters,
      dateFrom: filters.dateFrom || today,
      // dateTo is optional, only include if provided
      ...(filters.dateTo && { dateTo: filters.dateTo }),
    }
    const response = await apiClient.get('/orders', { params })
    return response.data
  }
}
