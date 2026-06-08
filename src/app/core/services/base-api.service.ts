import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

@Injectable()
export abstract class BaseApiService {
  protected http = inject(HttpClient);
  protected config = inject(ConfigService);

  protected get baseUrl(): string {
    return this.config.apiUrl;
  }

  protected get$<T>(url: string, params?: Record<string, any>): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${url}`, { params: this.toParams(params) }).pipe(
      map(r => r.data)
    );
  }

  protected post$<T>(url: string, body?: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${url}`, body).pipe(
      map(r => r.data)
    );
  }

  protected put$<T>(url: string, body?: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${url}`, body).pipe(
      map(r => r.data)
    );
  }

  protected delete$<T>(url: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${url}`).pipe(
      map(r => r.data)
    );
  }

  private toParams(params?: Record<string, any>): HttpParams | undefined {
    if (!params) return undefined;
    let p = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) p = p.set(k, String(v));
    }
    return p;
  }
}
