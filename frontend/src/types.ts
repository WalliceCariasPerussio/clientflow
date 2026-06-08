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
  company_id: number | null
  company_name: string | null
  status: 'active' | 'inactive' | 'lead'
  notes: string | null
  created_at: string
}

export interface Company {
  id: number
  name: string
}

export interface DashboardStats {
  total: number
  active: number
  inactive: number
  leads: number
  company_count: number
  sales: {
    total_revenue: number
    this_month: number
    pending_amount: number
    this_month_count: number
  }
}

export interface Sale {
  id: number
  client_id: number
  client?: { id: number; name: string }
  amount: number
  description: string | null
  status: 'completed' | 'pending' | 'cancelled'
  sale_date: string
  created_at: string
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
