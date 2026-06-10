import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '@core/services/config.service';
import { catchError, map, of } from 'rxjs';

interface ApiSummary {
  name: string;
  endpoint: string;
  status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  latency?: number;
}

@Component({
  selector: 'app-api-status-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-status-summary.component.html',
  styleUrls: ['./api-status-summary.component.css']
})
export class ApiStatusSummaryComponent implements OnInit {
  private configService = inject(ConfigService);
  private http = inject(HttpClient);

  apis = signal<ApiSummary[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.initializeApis();
    this.checkHealth();
  }

  private initializeApis() {
    this.apis.set([
      {
        name: 'Seguridad',
        endpoint: `${this.configService.apiUrl}/health`,
        status: 'CHECKING' as const
      },
      {
        name: 'Notificaciones',
        endpoint: `${this.configService.notificationApiUrl}/health`,
        status: 'CHECKING' as const
      },
      {
        name: 'Finanzas',
        endpoint: `${this.configService.financeApiUrl.replace(/\/finance$/, '')}/health`,
        status: 'CHECKING' as const
      },
      {
        name: 'CRM',
        endpoint: `${this.configService.crmApiUrl.replace(/\/crm$/, '')}/health`,
        status: 'CHECKING' as const
      },
      {
        name: 'Reportes',
        endpoint: `${this.configService.reportApiUrl.replace(/\/report$/, '')}/health`,
        status: 'CHECKING' as const
      }
    ].filter(api => !!api.endpoint));
  }

  checkHealth() {
    this.loading.set(true);
    const currentApis = this.apis();
    
    let completedChecks = 0;
    const totalChecks = currentApis.length;

    if (totalChecks === 0) {
      this.loading.set(false);
      return;
    }

    currentApis.forEach((api, index) => {
      const startTime = performance.now();

      this.http.get<any>(api.endpoint).pipe(
        map(() => {
          const latency = Math.round(performance.now() - startTime);
          return { status: 'ONLINE' as const, latency };
        }),
        catchError(() => {
          return of({ status: 'OFFLINE' as const, latency: undefined });
        })
      ).subscribe(result => {
        this.apis.update(apis => {
          const newApis = [...apis];
          newApis[index] = {
            ...newApis[index],
            status: result.status,
            latency: result.latency
          };
          return newApis;
        });

        completedChecks++;
        if (completedChecks === totalChecks) {
          this.loading.set(false);
        }
      });
    });
  }
}
