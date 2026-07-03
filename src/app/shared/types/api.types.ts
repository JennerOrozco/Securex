export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface SelectOption {
  label: string;
  value: any;
}

export interface Entity {
  uuid?: string;
  id?: number | string;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}
