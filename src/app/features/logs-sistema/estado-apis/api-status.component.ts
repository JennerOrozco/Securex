import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AppService } from '@core/services/app.service';
import { ConfigService } from '@core/services/config.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { ButtonComponent } from '@shared/components/button/button.component';
import { catchError, map, of } from 'rxjs';

interface ApiStatus {
  name: string;
  url: string;
  healthEndpoint: string;
  metricsEndpoint: string;
  status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  latency?: number;
  error?: string;
  version?: string;
}

@Component({
  selector: 'app-api-status',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DialogModule, ButtonComponent],
  templateUrl: './api-status.component.html',
  styleUrls: ['./api-status.component.css']
})
export class ApiStatusComponent implements OnInit {
  private appService = inject(AppService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  apis = signal<ApiStatus[]>([]);
  isSyncing = signal<boolean>(false);
  hasPermission = true;

  selectedApiForMetrics = signal<ApiStatus | null>(null);
  showMetricsDialog = signal<boolean>(false);
  isLoadingMetrics = signal<boolean>(false);
  metricsData = signal<any>(null);

  ngOnInit() {
    this.hasPermission = this.authService.checkPermission('securex.system_logs.api_status');
    if (!this.hasPermission) return;

    this.initializeApis();
    this.checkAllHealth();
  }

  private initializeApis() {
    this.apis.set([
      {
        name: 'Security API',
        url: this.configService.apiUrl,
        healthEndpoint: `${this.configService.apiUrl}/health`,
        metricsEndpoint: `${this.configService.apiUrl}/metrics`,
        status: 'CHECKING' as const
      },
      {
        name: 'Notification API',
        url: this.configService.notificationApiUrl,
        healthEndpoint: `${this.configService.notificationApiUrl}/health`,
        metricsEndpoint: `${this.configService.notificationApiUrl}/metrics`,
        status: 'CHECKING' as const
      },
      {
        name: 'Finance API',
        url: this.configService.financeApiUrl,
        healthEndpoint: `${this.configService.financeApiUrl.replace(/\/finance$/, '')}/health`,
        metricsEndpoint: `${this.configService.financeApiUrl.replace(/\/finance$/, '')}/metrics`,
        status: 'CHECKING' as const
      },
      {
        name: 'CRM API',
        url: this.configService.crmApiUrl,
        healthEndpoint: `${this.configService.crmApiUrl.replace(/\/crm$/, '')}/health`,
        metricsEndpoint: `${this.configService.crmApiUrl.replace(/\/crm$/, '')}/metrics`,
        status: 'CHECKING' as const
      },
      {
        name: 'Report API',
        url: this.configService.reportApiUrl,
        healthEndpoint: `${this.configService.reportApiUrl.replace(/\/report$/, '')}/health`,
        metricsEndpoint: `${this.configService.reportApiUrl.replace(/\/report$/, '')}/metrics`,
        status: 'CHECKING' as const
      }
    ].filter(api => !!api.url));
  }

  checkAllHealth() {
    const currentApis = this.apis();
    const updatedApis = currentApis.map(api => ({ ...api, status: 'CHECKING' as const }));
    this.apis.set(updatedApis);

    updatedApis.forEach((api, index) => {
      const startTime = performance.now();

      this.http.get<any>(api.healthEndpoint).pipe(
        map(response => {
          const latency = Math.round(performance.now() - startTime);
          return { status: 'ONLINE', latency, version: response?.data?.version || 'N/A' };
        }),
        catchError(error => {
          return of({ status: 'OFFLINE', error: error.message });
        })
      ).subscribe(result => {
        this.apis.update(apis => {
          const newApis = [...apis];
          newApis[index] = {
            ...newApis[index],
            status: result.status as 'ONLINE' | 'OFFLINE',
            latency: (result as any).latency,
            version: (result as any).version,
            error: (result as any).error
          };
          return newApis;
        });
      });
    });
  }

  syncApps() {
    this.isSyncing.set(true);
    this.appService.broadcastAppSync().subscribe({
      next: () => {
        this.isSyncing.set(false);
        this.notificationService.success('Sincronización Completada. Se ha enviado la orden de sincronizar apps a todos los microservicios.');
      },
      error: () => {
        this.isSyncing.set(false);
        this.notificationService.error('Hubo un error al intentar sincronizar las aplicaciones.');
      }
    });
  }

  openMetrics(api: ApiStatus) {
    this.selectedApiForMetrics.set(api);
    this.showMetricsDialog.set(true);
    this.isLoadingMetrics.set(true);
    this.metricsData.set(null);

    this.http.get<any>(api.metricsEndpoint).pipe(
      catchError(err => of({ error: err.message }))
    ).subscribe(res => {
      this.isLoadingMetrics.set(false);
      this.metricsData.set(res.data || res);
    });
  }
}
