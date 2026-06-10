import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { AuthService, User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private storage = inject(StorageService);
  private authService = inject(AuthService);

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.configService.apiUrl}/auth/me`).pipe(
      tap(response => {
        const data = response.data || response;
        if (data && data.uuid) {
          const existing = this.authService.currentUserValue;
          const updatedUser: User = {
            ...existing!,
            full_name: data.full_name,
            name: data.full_name,
            role_name: data.role_name || 'Residente',
            profile_picture: data.profile_picture
          };
          this.storage.setUser(updatedUser);
          this.authService.setCurrentUser(updatedUser);

          if (data.permissions) {
            this.authService.setUserPermissions(data.permissions);
            this.storage.setUserPermissions(data.permissions);
          }
        }
      })
    );
  }

  uploadPicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.configService.apiUrl}/auth/profile-picture`, formData).pipe(
      tap(response => {
        const data = response.data || response;
        if (data && data.url) {
          const updatedUser = { ...this.authService.currentUserValue!, profile_picture: data.url };
          this.storage.setUser(updatedUser);
          this.authService.setCurrentUser(updatedUser);
        }
      })
    );
  }

  deletePicture(): Observable<any> {
    return this.http.delete<any>(`${this.configService.apiUrl}/auth/profile-picture`).pipe(
      tap(() => {
        const updatedUser = { ...this.authService.currentUserValue!, profile_picture: undefined };
        this.storage.setUser(updatedUser);
        this.authService.setCurrentUser(updatedUser);
      })
    );
  }

  changePassword(data: any): Observable<any> {
    const token = this.storage.getAccessToken();
    if (!token) return of(null);
    return this.http.post<any>(`${this.configService.apiUrl}/auth/change-password`, data);
  }
}
