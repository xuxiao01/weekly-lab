import axios, { type AxiosRequestConfig } from 'axios'
import { HttpError, type ApiErrorBody, type ApiResponse } from '../types/http'

export const TOKEN_STORAGE_KEY = 'xuxiao_token'
export const USER_STORAGE_KEY = 'xuxiao_user'

let apiMisconfigured = false

function resolveBaseURL(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured
  // 开发环境走 Vite /api 代理 -> http://localhost:3000
  if (import.meta.env.DEV) return ''
  apiMisconfigured = true
  console.warn(
    '[http] 生产环境未配置 VITE_API_BASE_URL，API 请求已被禁用。请在 .env 或 CI 构建环境中设置该变量。',
  )
  return ''
}

const baseURL = resolveBaseURL()

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

function onUnauthorized() {
  if (unauthorizedHandler) {
    unauthorizedHandler()
    return
  }
  window.location.assign(import.meta.env.BASE_URL)
}

instance.interceptors.request.use((config) => {
  if (apiMisconfigured) {
    return Promise.reject(
      new HttpError('未配置 VITE_API_BASE_URL，无法请求 API'),
    )
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status as number | undefined
    const body = error.response?.data as ApiErrorBody | undefined
    const message =
      body?.message || error.message || '请求失败，请稍后重试'

    if (status === 401) {
      clearAuthStorage()
      onUnauthorized()
    }

    return Promise.reject(new HttpError(message, status))
  },
)

function unwrapResponse<T>(body: unknown): T {
  const payload = body as ApiResponse<T>

  if (payload && typeof payload === 'object' && payload.success === false) {
    throw new HttpError(payload.message || '请求失败')
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T
  }

  return body as T
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const body = await instance.request<ApiResponse<T>>(config)
  return unwrapResponse<T>(body)
}

export const http = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'GET', url })
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'POST', url, data })
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'PUT', url, data })
  },
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'PATCH', url, data })
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'DELETE', url })
  },
}
