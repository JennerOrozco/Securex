import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

function isPaginated(value: any): boolean {
  return value && typeof value === 'object' && 'data' in value && 'total' in value && 'currentPage' in value;
}

function normalizePaginated(value: any): any {
  return {
    data: value.data ?? [],
    total: value.total ?? 0,
    currentPage: value.currentPage ?? 1,
    perPage: value.perPage ?? 15,
    hasMorePages: value.hasMorePages ?? false,
  };
}

export const paginatedResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body && typeof event.body === 'object') {
        const body: any = event.body;
        if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
          let changed = false;
          const normalized: Record<string, any> = {};
          for (const key of Object.keys(body.data)) {
            if (isPaginated(body.data[key])) {
              normalized[key] = normalizePaginated(body.data[key]);
              changed = true;
            }
          }
          if (changed) {
            return event.clone({ body: { ...body, data: { ...body.data, ...normalized } } });
          }
        }
      }
      return event;
    })
  );
};
