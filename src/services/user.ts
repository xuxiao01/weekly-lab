import type { UserInfo } from '../types/user'
import { http, USER_STORAGE_KEY } from '../utils/http'

export async function getCurrentUser(): Promise<UserInfo> {
  const user = await http.get<UserInfo>('/api/auth/me')
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  return user
}
