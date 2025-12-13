// API request/response types

export interface ApiResponse<T> {
  data: T
  meta?: {
    timestamp: string
    [key: string]: unknown
  }
}

export interface ApiCollectionResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
    timestamp: string
  }
  links?: {
    self: string
    next?: string
    prev?: string
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Array<{
      field: string
      message: string
    }>
  }
}

export class ValidationError extends Error {
  details?: Array<{ field: string; message: string }>

  constructor(message: string, details?: Array<{ field: string; message: string }>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

