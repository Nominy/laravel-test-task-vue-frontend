// Base interfaces matching actual API responses
export interface Stock {
  date: string
  last_change_date: string | null
  supplier_article: string
  tech_size: string
  barcode: number
  quantity: number
  is_supply: boolean | null
  is_realization: boolean | null
  quantity_full: number | null
  warehouse_name: string
  in_way_to_client: number | null
  in_way_from_client: number | null
  nm_id: number
  subject: string
  category: string
  brand: string
  sc_code: number
  price: string
  discount: string
}

export interface Income {
  income_id: number
  number: string
  date: string
  last_change_date: string
  supplier_article: string
  tech_size: string
  barcode: number
  quantity: number
  total_price: string
  date_close: string
  warehouse_name: string
  nm_id: number
}

export interface Sale {
  g_number: string
  date: string
  last_change_date: string
  supplier_article: string
  tech_size: string
  barcode: number
  total_price: string
  discount_percent: string
  is_supply: boolean
  is_realization: boolean
  promo_code_discount: string | null
  warehouse_name: string
  country_name: string
  oblast_okrug_name: string
  region_name: string
  income_id: number
  sale_id: string
  odid: string | null
  spp: string
  for_pay: string
  finished_price: string
  price_with_disc: string
  nm_id: number
  subject: string
  category: string
  brand: string
  is_storno?: boolean
}

export interface Order {
  g_number: string
  date: string
  last_change_date: string
  supplier_article: string
  tech_size: string
  barcode: number
  total_price: string
  discount_percent: number
  warehouse_name: string
  oblast: string
  income_id: number
  odid: string
  nm_id: number
  subject: string
  category: string
  brand: string
  is_cancel: boolean
  cancel_dt: string | null
}

// Laravel pagination response structure
export interface ApiResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev?: string | null
    next?: string | null
  }
  meta: {
    current_page: number
    from?: number | null
    last_page: number
    links: Array<{
      url?: string | null
      label: string
      active: boolean
    }>
    path: string
    per_page: string
    to?: number | null
    total: number
  }
}

export interface ApiFilters {
  dateFrom?: string
  dateTo?: string
  page?: number
  key?: string
  limit?: number
  search?: string
}
