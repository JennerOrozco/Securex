export interface PaginationParams {
  page: number;
  limit: number;
  filter?: Record<string, any>;
  sort: { column: string; direction: 'ASC' | 'DESC' };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

const DEFAULT_SORT_COLUMN = 'created_at';
const DEFAULT_PAGE_SIZE = 15;

const MATCH_MODE_MAP: Record<string, string> = {
  contains: 'CONTAINS',
  equals: 'EQUALS',
  startsWith: 'STARTS_WITH',
  endsWith: 'ENDS_WITH',
};

export function parseLazyLoadEvent(event?: any, defaultSortColumn = DEFAULT_SORT_COLUMN, columnMap?: Record<string, string | null>): PaginationParams {
  const page = event && event.rows ? Math.floor(event.first / event.rows) + 1 : 1;
  const limit = event && event.rows ? event.rows : DEFAULT_PAGE_SIZE;

  const filter: Record<string, any> = {};
  if (event?.filters) {
    const columnFilters: any[] = [];
    for (const [field, f] of Object.entries(event.filters)) {
      const condition = Array.isArray(f) ? f[0] : f;
      const val = condition?.value;
      if (val != null && val !== '') {
        if (field === 'global') {
          filter['globalSearch'] = val;
          continue;
        }
        if (columnMap) {
          if (field in columnMap) {
            const mapped = columnMap[field];
            if (mapped === null) {
              console.warn(`[parseLazyLoadEvent] Field "${field}" is blocked`);
              continue;
            }
            columnFilters.push({
              field: mapped,
              operator: {
                value: val,
                matchMode: MATCH_MODE_MAP[condition?.matchMode] || 'CONTAINS'
              }
            });
          } else {
            columnFilters.push({
              field,
              operator: {
                value: val,
                matchMode: MATCH_MODE_MAP[condition?.matchMode] || 'CONTAINS'
              }
            });
          }
        } else {
          columnFilters.push({
            field,
            operator: {
              value: val,
              matchMode: MATCH_MODE_MAP[condition?.matchMode] || 'CONTAINS'
            }
          });
        }
      }
    }
    if (columnFilters.length > 0) {
      filter['filters'] = columnFilters;
    }
  } else if (event?.globalFilter) {
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

  const hasFilter = Object.keys(filter).length > 0;
  return { page, limit, ...(hasFilter ? { filter } : {}), sort };
}

export function extractPaginatedData<T>(response: any, mapper?: (item: any) => T): PaginatedResponse<T> {
  const raw = response?.data ?? [];
  return {
    data: mapper ? raw.map(mapper) : raw,
    total: response?.total ?? 0,
  };
}
