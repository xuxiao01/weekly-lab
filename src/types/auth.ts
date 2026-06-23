import type { UserInfo } from './user'

export interface RegisterParams {
  email: string
  username: string
  password: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface AuthPayload {
  token: string
  user: UserInfo
}

export type LoginResult = AuthPayload
