export interface ApiResponse<T = unknown> {
  data?: T;
  success?: boolean;
  message?: string;
  error?: string;
  status?: string;
  access_token?: string;
  refresh_token?: string;
  requires_company_select?: boolean;
  companies?: unknown[];
  user?: unknown;
  company?: unknown;
  branch?: unknown;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  all?: boolean;
  query?: string;
}
