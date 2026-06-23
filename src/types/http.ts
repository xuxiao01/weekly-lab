export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

export interface ApiErrorBody {
  success: false
  message?: string
}

export class HttpError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}
