import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { AppService } from '@core/services/app.service';
import { UserService } from '@core/services/user.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { TableDataLoader } from '@shared/utils/table-data-loader';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { TableComponent } from '@shared/table-shared/table-component/table-component.component';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { APP_COLS, COMPANY_COLS, USER_COLS } from './notification-test.config';
import { trackSignal } from '@shared/utils/rxjs-utils';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, TextareaModule,
    TableComponent, ToolbarComponent, InputComponent, SelectComponent, ButtonComponent,
    EmptyStateComponent
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
  destroyRef = inject(DestroyRef);
  cdr = inject(ChangeDetectorRef);

  isSending = signal(false);
  step = signal(1);
  companies = signal<any[]>([]);

  selectedApp = signal<any>(null);
  selectedCompany = signal<any>(null);
  selectedUser = signal<any>(null);

  testForm = new FormGroup({
    title: new FormControl<string>('Test Notificación', { nonNullable: true, validators: [Validators.required] }),
    message: new FormControl<string>('Este es un mensaje de prueba desde el wizard.', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<string>('INFO', { nonNullable: true }),
    channels: new FormControl<string>('PUSH,EMAIL', { nonNullable: true }),
    app_uuid: new FormControl<string | null>(null, { validators: [Validators.required] }),
    company_uuid: new FormControl<string | null>(null, { validators: [Validators.required] }),
    user_uuid: new FormControl<string | null>(null, { validators: [Validators.required] }),
    user_email: new FormControl<string | null>(null, { validators: [Validators.required] })
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

  channelOptions = [
    { label: 'Push y Email', value: 'PUSH,EMAIL' },
    { label: 'Solo Push', value: 'PUSH' },
    { label: 'Solo Email', value: 'EMAIL' }
  ];

  typeOptions = [
    { label: 'Información (INFO)', value: 'INFO' },
    { label: 'Advertencia (WARNING)', value: 'WARNING' },
    { label: 'Error (ERROR)', value: 'ERROR' },
    { label: 'Éxito (SUCCESS)', value: 'SUCCESS' }
  ];

  steps = [
    { num: 1, label: 'App', icon: 'pi pi-th-large' },
    { num: 2, label: 'Empresa', icon: 'pi pi-building' },
    { num: 3, label: 'Usuario', icon: 'pi pi-user' },
    { num: 4, label: 'Mensaje', icon: 'pi pi-send' },
  ];

  hasPermission = computed(() => this.authService.checkPermission('securex.notifications.test'));

  ngOnInit() {
    if (this.hasPermission()) {
      this.appTable.load();
    }
  }

  selectApp(app: any) {
    this.selectedApp.set(app);
    this.testForm.patchValue({ app_uuid: app.uuid });
    this.step.set(2);
    this.companies.set(app.companies || []);
  }

  selectCompany(company: any) {
    this.selectedCompany.set(company);
    this.testForm.patchValue({ company_uuid: company.uuid });
    this.step.set(3);
  }

  selectUser(user: any) {
    this.selectedUser.set(user);
    this.testForm.patchValue({
      user_uuid: user.uuid,
      user_email: user.email
    });
    this.step.set(4);
  }

  goBack() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  sendTest() {
    if (this.testForm.invalid) return;

    this.apiService.sendNotificationToAny(this.testForm.getRawValue()).pipe(
      trackSignal(this, this.isSending, 'Notificación enviada correctamente al usuario.')
    ).subscribe({
      next: () => {
        this.resetWizard();
      }
    });
  }

  private resetWizard() {
    this.step.set(1);
    this.selectedApp.set(null);
    this.selectedCompany.set(null);
    this.selectedUser.set(null);
    this.testForm.reset({
      title: 'Test Notificación',
      message: 'Este es un mensaje de prueba desde el wizard.',
      type: 'INFO',
      channels: 'PUSH,EMAIL',
      app_uuid: null,
      company_uuid: null,
      user_uuid: null,
      user_email: null
    });
  }
}
