export interface User {
  id: number
  name: string
  email: string
}

export interface Client {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  status: 'active' | 'inactive' | 'lead'
  notes: string | null
  created_at: string
}

export interface DashboardStats {
  total: number
  active: number
  inactive: number
  leads: number
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}
