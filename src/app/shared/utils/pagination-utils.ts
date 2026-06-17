export interface PaginationParams {
  page: number;
  limit: number;
  filter: Record<string, any>;
  sort: { column: string; direction: 'ASC' | 'DESC' };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

const DEFAULT_SORT_COLUMN = 'created_at';
const DEFAULT_PAGE_SIZE = 15;

export function parseLazyLoadEvent(event?: any, defaultSortColumn = DEFAULT_SORT_COLUMN): PaginationParams {
  const page = event && event.rows ? Math.floor(event.first / event.rows) + 1 : 1;
  const limit = event && event.rows ? event.rows : DEFAULT_PAGE_SIZE;

  const filter: Record<string, any> = {};
  if (event?.globalFilter) {
    filter['globalSearch'] = event.globalFilter;
  }

  const sort: any = { column: defaultSortColumn, direction: 'DESC' };
  if (event?.sortField) {
    sort.column = event.sortField;
    sort.direction = event.sortOrder === 1 ? 'ASC' : 'DESC';
  } else if (event?.multiSortMeta && event.multiSortMeta.length > 0) {
    sort.column = event.multiSortMeta[0].field;
    sort.direction = event.multiSortMeta[0].order === 1 ? 'ASC' : 'DESC';
  }

  return { page, limit, filter, sort };
}

export function extractPaginatedData<T>(response: any, mapper?: (item: any) => T): PaginatedResponse<T> {
  const raw = response?.data ?? [];
  return {
    data: mapper ? raw.map(mapper) : raw,
    total: response?.total ?? 0,
  };
}
