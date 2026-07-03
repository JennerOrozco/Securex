import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { AppService } from '@/core/services';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { PUSH_SETTINGS_COLS, createPushSettingsForm } from './push-settings.config';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-push-settings',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, ButtonComponent],
  templateUrl: './push-settings.component.html',
  providers: [UnifiedCrudService]
})
export class PushSettingsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private appService = inject(AppService);
  private notificationService = inject(NotificationService);
  crud = inject(UnifiedCrudService);

  cols = PUSH_SETTINGS_COLS;
  
  formFields = computed(() => {
    const catalogs = this.crud.catalogItems();
    return createPushSettingsForm(catalogs);
  });

  constructor() {}

  ngOnInit(): void {
    this.crud.initialize({
      resourceName: 'Configuración Push',
      primaryKey: 'id',
      defaultSortKey: 'id',
      fnFetch: this.apiService.getPushSettingsGql.bind(this.apiService),
      fnCreate: (data) => this.saveSetting(data, 'add'),
      fnUpdate: (id, data) => this.saveSetting(data, 'edit'),
      fnDelete: this.apiService.deletePushSetting.bind(this.apiService),
      fnCatalogs: {
        apps: () => this.appService.getAppsWithCompanies().pipe(
          map((res: any) => res.data || res || [])
        )
      }
    });
  }

  saveSetting(data: any, mode: 'add' | 'edit'): Observable<any> {
    const id = mode === 'add' ? null : data.id;
    const payload: FormData | any = data.icon instanceof File ? new FormData() : { ...data };

    if (payload instanceof FormData) {
      Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (key === 'icon' && value instanceof File) {
          payload.append('icon', value, value.name);
        } else {
          payload.append(key, String(value));
        }
      });
    }

    return this.apiService.savePushSetting(id, payload);
  }

  handleGenerateVapid() {
    this.apiService.generateVapid().subscribe({
      next: (res: any) => {
        const keys = res.data || res;
        const current = this.crud.selectedItem();
        this.crud.selectedItem.set({
          ...current,
          vapid_public_key: keys.public_key,
          vapid_private_key: keys.private_key
        });
        this.notificationService.success('Llaves VAPID generadas. Por favor completa los demás campos y guarda.');
      },
      error: () => this.notificationService.error('Error al generar llaves VAPID')
    });
  }
}