import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { APP_COLS, COMPANY_COLS, USER_COLS } from './notification-test.config';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, TextareaModule,
    TableComponent, ToolbarComponent, InputComponent, SelectComponent, ButtonComponent
  ],
  templateUrl: './notification-test.component.html',
  styleUrls: ['./notification-test.component.css']
})
export class NotificationTestComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private appService = inject(AppService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  testForm: FormGroup;
  isSending = false;

  step = 1;


  companies: any[] = [];

  selectedApp: any = null;
  selectedCompany: any = null;
  selectedUser: any = null;

  appTable = new TableDataLoader(
    (p, l, f, s) => this.appService.getAppsWithCompaniesPaginated(p, l, f, s),
    this.notificationService,
    'Error al cargar aplicaciones'
  );

  userTable = new TableDataLoader(
    (p, l, f, s) => this.userService.getAdminUsersPaginated(p, l, f, s, {
      company_uuid: this.selectedCompany?.uuid,
      app_uuid: this.selectedApp?.uuid
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

  constructor() {
    this.testForm = this.fb.group({
      title: ['Test Notificación', Validators.required],
      message: ['Este es un mensaje de prueba desde el wizard.', Validators.required],
      type: ['INFO'],
      channels: ['PUSH,EMAIL'],
      app_uuid: [null, Validators.required],
      company_uuid: [null, Validators.required],
      user_uuid: [null, Validators.required],
      user_email: [null, Validators.required]
    });
  }

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.test');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.appTable.load();
    }
  }

  loadCompanies() {
    // Las compañías ya vienen precargadas dentro de la app seleccionada
    this.companies = this.selectedApp?.companies || [];
  }

  selectApp(app: any) {
    this.selectedApp = app;
    this.testForm.patchValue({ app_uuid: app.uuid });
    this.step = 2;
    this.companies = app.companies || [];
  }

  selectCompany(company: any) {
    this.selectedCompany = company;
    this.testForm.patchValue({ company_uuid: company.uuid });
    this.step = 3;
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.testForm.patchValue({
      user_uuid: user.uuid,
      user_email: user.email
    });
    this.step = 4;
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
    }
  }

  sendTest() {
    if (this.testForm.invalid) return;

    this.isSending = true;

    this.apiService.sendNotificationToAny(this.testForm.value).subscribe({
      next: () => {
        this.notificationService.success('Notificación enviada correctamente al usuario.');
        this.isSending = false;
        this.resetWizard();
      },
      error: (err) => {
        this.notificationService.error('Error al enviar notificación: ' + (err.error?.message || err.message));
        this.isSending = false;
      }
    });
  }

  private resetWizard() {
    this.step = 1;
    this.selectedApp = null;
    this.selectedCompany = null;
    this.selectedUser = null;
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
