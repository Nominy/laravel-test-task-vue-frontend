import axios from 'axios'
import type { ApiResponse, ApiFilters, Stock, Income, Sale, Order } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const API_KEY = import.meta.env.VITE_API_KEY || ''

// Validate required environment variables
if (!API_KEY) {
  console.error('VITE_API_KEY is required but not set in environment variables')
}

// Handle mixed content issues for HTTPS contexts using CORS proxy
const getApiBaseUrl = () => {
  const baseUrl = API_BASE_URL

  // If we're in HTTPS context and API is HTTP, use CORS proxy
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    baseUrl.startsWith('http://')
  ) {
    console.warn('🔄 Using CORS proxy due to mixed content restrictions')
    // Use allorigins.win as a reliable CORS proxy
    return 'https://api.allorigins.win/raw?url='
  }

  return baseUrl
}

// Custom request function to handle proxy
const makeRequest = async (endpoint: string, params: Record<string, string | number> = {}) => {
  const baseUrl = API_BASE_URL
  const needsProxy =
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    baseUrl.startsWith('http://')

  const queryParams = new URLSearchParams({
    ...params,
    key: API_KEY,
  })

  if (needsProxy) {
    // Use CORS proxy for mixed content
    const fullUrl = `${baseUrl}${endpoint}?${queryParams}`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`

    console.log('📡 Making proxied request to:', endpoint)
    const response = await fetch(proxyUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } else {
    // Direct request for local development
    const response = await axios.get(endpoint, {
      baseURL: baseUrl,
      params: {
        ...params,
        key: API_KEY,
      },
      timeout: 10000,
    })
    return response.data
  }
}

// Keep axios client for fallback
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
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
    return await makeRequest('/stocks', params)
  }

  static async getIncomes(filters: Omit<ApiFilters, 'key'> = {}): Promise<ApiResponse<Income>> {
    // For incomes, both dateFrom and dateTo are mandatory
    const today = new Date().toISOString().split('T')[0]
    const params = {
      ...filters,
      dateFrom: filters.dateFrom || today,
      dateTo: filters.dateTo || today,
    }
    return await makeRequest('/incomes', params)
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
    return await makeRequest('/sales', params)
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
    return await makeRequest('/orders', params)
  }
}
