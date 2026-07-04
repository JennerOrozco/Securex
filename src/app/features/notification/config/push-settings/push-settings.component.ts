import { Component, inject, OnInit, computed, ChangeDetectionStrategy, signal, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AppService } from '@/core/services';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { PUSH_SETTINGS_COLS, createPushSettingsForm } from './push-settings.config';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { trackSignal } from '@shared/utils/rxjs-utils';
import { objectToFormData } from '@shared/utils/form-utils';

@Component({
  selector: 'app-push-settings',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, ButtonComponent],
  templateUrl: './push-settings.component.html',
  providers: [UnifiedCrudService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PushSettingsComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private appService = inject(AppService);
  private notificationService = inject(NotificationService);
  destroyRef = inject(DestroyRef);
  cdr = inject(ChangeDetectorRef);
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
    const payload = objectToFormData(data, 'icon');
    return this.apiService.savePushSetting(id, payload);
  }

  isGeneratingVapid = signal(false);

  handleGenerateVapid() {
    this.apiService.generateVapid().pipe(
      trackSignal(this, this.isGeneratingVapid)
    ).subscribe({
      next: (res: any) => {
        const keys = res.data || res;
        const current = this.crud.selectedItem();
        this.crud.selectedItem.set({
          ...current,
          vapid_public_key: keys.public_key,
          vapid_private_key: keys.private_key
        });
        this.notificationService.success('Llaves VAPID generadas. Por favor completa los demás campos y guarda.');
      }
    });
  }
}