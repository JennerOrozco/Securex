export function extractApiData<T>(payload: any, fallback: T | null = null): T {
    if (payload == null) {
        return fallback as T;
    }

    const directData = payload.data ?? payload.result ?? payload.response ?? payload.items ?? payload;
    if (Array.isArray(directData)) {
        return directData as T;
    }

    if (directData && typeof directData === 'object' && 'data' in directData && Array.isArray((directData as any).data)) {
        return (directData as any).data as T;
    }

    return directData as T;
}

export function extractApiArray<T>(payload: any): T[] {
    const data = extractApiData<T[] | T>(payload, []);
    if (Array.isArray(data)) {
        return data;
    }

    return data ? [data] : [];
}

export function extractApiCollection<T>(payload: any): T[] {
    return extractApiArray<T>(payload);
}

export function buildApiErrorMessage(error: any, fallback = 'Ocurrió un error inesperado'): string {
    return error?.error?.message || error?.message || fallback;
}
