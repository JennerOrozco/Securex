import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

const CSRF_HEADER = 'X-XSRF-TOKEN';
const CSRF_COOKIE = 'XSRF-TOKEN';

export const xsrfInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(ConfigService);

  if (req.method === 'GET') return next(req);

  const token = getCookie(CSRF_COOKIE);
  if (token) {
    req = req.clone({ setHeaders: { [CSRF_HEADER]: token } });
  }

  return next(req);
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
