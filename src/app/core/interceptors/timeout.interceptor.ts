import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { timeout } from 'rxjs';

export const REQUEST_TIMEOUT = new HttpContextToken<number>(() => 30000);

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const ms = req.context.get(REQUEST_TIMEOUT);
  if (ms > 0) {
    return next(req).pipe(timeout(ms));
  }
  return next(req);
};
