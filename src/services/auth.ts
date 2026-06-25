import type {
  AuthPayload,
  LoginParams,
  RegisterParams,
} from '../types/auth'
import type { UserInfo } from '../types/user'
import { http, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../utils/http'

export const WEEKLY_LAB_TOKEN_KEY = 'weekly_lab_token'

function saveAuthSession(payload: AuthPayload) {
  localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user))
  localStorage.removeItem(WEEKLY_LAB_TOKEN_KEY)
}

function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(WEEKLY_LAB_TOKEN_KEY)
}

export function getStoredToken(): string | null {
  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem(WEEKLY_LAB_TOKEN_KEY)
  )
}

export function isAuthenticated(): boolean {
  return !!getStoredToken()
}

export function getStoredUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export async function register(params: RegisterParams): Promise<AuthPayload> {
  const data = await http.post<AuthPayload>('/api/auth/register', params)
  saveAuthSession(data)
  return data
}

export async function login(params: LoginParams): Promise<AuthPayload> {
  const data = await http.post<AuthPayload>('/api/auth/login', params)
  saveAuthSession(data)
  return data
}

export function logout() {
  clearAuthSession()
}
