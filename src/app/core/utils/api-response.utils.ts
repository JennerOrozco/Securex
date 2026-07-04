export interface NormalizedApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export function unwrapNestedData(payload: any): any {
  const directData = payload?.data ?? payload?.result ?? payload?.response ?? payload?.items ?? payload;

  if (Array.isArray(directData)) {
    return directData;
  }

  if (directData && typeof directData === 'object') {
    if ('data' in directData && Array.isArray((directData as any).data)) {
      return (directData as any).data;
    }

    if ('items' in directData && Array.isArray((directData as any).items)) {
      return (directData as any).items;
    }
  }

  return directData;
}

export function normalizeApiResponse<T>(payload: any): NormalizedApiResponse<T> {
  if (payload == null) {
    return { data: [] as T };
  }

  const data = unwrapNestedData(payload);
  const metadataSource = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  return {
    data: data as T,
    total: payload.total ?? payload.count ?? metadataSource?.total ?? metadataSource?.count ?? payload?.pagination?.total ?? metadataSource?.pagination?.total ?? payload?.meta?.total ?? metadataSource?.meta?.total ?? 0,
    page: payload.page ?? metadataSource?.page ?? payload?.pagination?.page ?? metadataSource?.pagination?.page ?? 1,
    pageSize: payload.pageSize ?? metadataSource?.pageSize ?? payload?.pagination?.pageSize ?? metadataSource?.pagination?.pageSize ?? payload?.limit ?? metadataSource?.limit ?? 0,
  };
}
