import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AppService } from '@core/services/app.service';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { TableDataLoader } from '@shared/utils/table-data-loader';
import { TableComponent } from '@shared/table-shared/table-component/table-component.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { WizardComponent } from '@shared/components/wizard/wizard.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { buildFormGroup } from '@shared/utils/form-utils';
import { APP_COLS, COMPANY_COLS, USER_COLS, MESSAGE_FIELDS, SEND_CONFIG } from './notification-test.config';
import { trackSignal } from '@shared/utils/rxjs-utils';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import type { WizardStep } from '@shared/components/wizard/wizard.component';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableComponent, ButtonComponent,
    EmptyStateComponent, WizardComponent, DynamicFormComponent,
    HasPermissionDirective
  ],
  templateUrl: './notification-test.component.html',
  styleUrls: ['./notification-test.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationTestComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private appService = inject(AppService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  destroyRef = inject(DestroyRef);
  cdr = inject(ChangeDetectorRef);

  isSending = signal(false);
  step = signal(1);
  companies = signal<any[]>([]);

  selectedApp = signal<any>(null);
  selectedCompany = signal<any>(null);
  selectedUser = signal<any>(null);

  messageFields = MESSAGE_FIELDS;
  messageForm = buildFormGroup(this.fb, MESSAGE_FIELDS, {
    title: 'Test Notificación',
    message: 'Este es un mensaje de prueba desde el wizard.',
    type: 'INFO',
    channels: 'PUSH,EMAIL'
  });

  appTable = new TableDataLoader(
    (p, l, f, s) => this.appService.getAppsWithCompaniesPaginated(p, l, f, s),
    this.notificationService,
    'Error al cargar aplicaciones'
  );

  userTable = new TableDataLoader(
    (p, l, f, s) => this.userService.getAdminUsersPaginated(p, l, f, s, {
      company_uuid: this.selectedCompany()?.uuid,
      app_uuid: this.selectedApp()?.uuid
    }),
    this.notificationService,
    'Error al cargar usuarios'
  );

  appCols = APP_COLS;
  companyCols = COMPANY_COLS;
  userCols = USER_COLS;

  wizardSteps: WizardStep[] = [
    { label: 'App', icon: 'pi pi-th-large' },
    { label: 'Empresa', icon: 'pi pi-building' },
    { label: 'Usuario', icon: 'pi pi-user' },
    { label: 'Mensaje', icon: 'pi pi-send' },
  ];

  hasPermission = computed(() => this.authService.checkPermission('securex.notifications.test'));

  ngOnInit() {
    if (this.hasPermission()) {
      this.appTable.load();
    }
  }

  selectApp(app: any) {
    this.selectedApp.set(app);
    this.step.set(2);
    this.companies.set(app.companies || []);
  }

  selectCompany(company: any) {
    this.selectedCompany.set(company);
    this.step.set(3);
  }

  selectUser(user: any) {
    this.selectedUser.set(user);
    this.initMessageForm();
    this.step.set(4);
  }

  private initMessageForm() {
    this.messageForm = buildFormGroup(this.fb, MESSAGE_FIELDS, {
      title: 'Test Notificación',
      message: 'Este es un mensaje de prueba desde el wizard.',
      type: 'INFO',
      channels: 'PUSH,EMAIL'
    });
  }

  goBack() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  sendTest(formData: any) {
    this.isSending.set(true);

    const payload = {
      ...formData,
      app_uuid: this.selectedApp()?.uuid,
      company_uuid: this.selectedCompany()?.uuid,
      user_uuid: this.selectedUser()?.uuid,
      user_email: this.selectedUser()?.email
    };

    SEND_CONFIG.fn(this.apiService, payload).pipe(
      trackSignal(this, this.isSending, SEND_CONFIG.successMessage)
    ).subscribe({
      next: () => this.resetWizard()
    });
  }

  private resetWizard() {
    this.step.set(1);
    this.selectedApp.set(null);
    this.selectedCompany.set(null);
    this.selectedUser.set(null);
  }
}
