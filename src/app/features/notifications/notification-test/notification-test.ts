import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { SecurexService } from '@core/services/securex.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, TextareaModule,
    TableComponent, ToolbarComponent, InputComponent, SelectComponent, ButtonComponent
  ],
  templateUrl: './notification-test.html',
  styleUrls: ['./notification-test.css']
})
export class NotificationTestComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  testForm: FormGroup;
  isSending = false;

  step = 1;

  apps: any[] = [];
  companies: any[] = [];
  users: any[] = [];

  selectedApp: any = null;
  selectedCompany: any = null;
  selectedUser: any = null;

  loadingApps = false;
  loadingCompanies = false;
  loadingUsers = false;

  appCols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  companyCols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'tax_id', header: 'Tax ID', type: 'text' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  userCols: TableColumn[] = [
    { field: 'full_name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

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
      channels: ['PUSH,EMAIL']
    });
  }

  get hasPermission(): boolean {
    return this.authService.checkPermission('securex.notifications.test');
  }

  ngOnInit() {
    if (this.hasPermission) {
      this.loadApps();
    }
  }

  loadApps() {
    this.loadingApps = true;
    this.securexService.getAppsWithCompanies().subscribe({
      next: (res: any) => {
        this.apps = res || [];
        this.loadingApps = false;
      },
      error: () => this.loadingApps = false
    });
  }

  loadCompanies() {
    // Las compañías ya vienen precargadas dentro de la app seleccionada
    this.companies = this.selectedApp?.companies || [];
  }

  loadUsers() {
    this.loadingUsers = true;
    this.securexService.getAdminUsersGql({
      company_uuid: this.selectedCompany.uuid,
      app_uuid: this.selectedApp.uuid
    }).subscribe({
      next: (res: any) => {
        this.users = res || [];
        this.loadingUsers = false;
      },
      error: () => this.loadingUsers = false
    });
  }

  selectApp(app: any) {
    this.selectedApp = app;
    this.step = 2;
    this.companies = app.companies || [];
  }

  selectCompany(company: any) {
    this.selectedCompany = company;
    this.step = 3;
    this.loadUsers();
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.step = 4;
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
    }
  }

  sendTest() {
    if (this.testForm.invalid || !this.selectedApp || !this.selectedCompany || !this.selectedUser) return;

    this.isSending = true;
    const payload = {
      ...this.testForm.value,
      app_uuid: this.selectedApp.uuid,
      company_uuid: this.selectedCompany.uuid,
      user_uuid: this.selectedUser.uuid,
      user_email: this.selectedUser.email
    };

    this.apiService.sendNotificationToAny(payload).subscribe({
      next: () => {
        this.notificationService.showSuccess('Notificación enviada correctamente al usuario.');
        this.isSending = false;
        this.resetWizard();
      },
      error: (err) => {
        this.notificationService.showError('Error al enviar notificación: ' + (err.error?.message || err.message));
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
      channels: 'PUSH,EMAIL'
    });
  }
}
