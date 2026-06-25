import axios, { type AxiosRequestConfig } from 'axios'
import { HttpError, type ApiErrorBody, type ApiResponse } from '../types/http'

export const TOKEN_STORAGE_KEY = 'xuxiao_token'
export const USER_STORAGE_KEY = 'xuxiao_user'

function resolveBaseURL(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured
  // 开发环境走 Vite /api 代理 -> http://localhost:3000
  if (import.meta.env.DEV) return ''
  return 'http://localhost:3000'
}

const baseURL = resolveBaseURL()

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

/** 401 时预留跳转登录页，后续由路由层接入 */
function onUnauthorized() {
  // TODO: redirect to login page
}

instance.interceptors.request.use((config) => {
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
}
