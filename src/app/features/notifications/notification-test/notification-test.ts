import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationSettingsService } from '@core/services/notification-settings.service';
import { SecurexService } from '@core/services/securex.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, 
    CardModule, InputTextModule, TextareaModule, SelectModule, ButtonModule,
    TableComponent
  ],
  templateUrl: './notification-test.html'
})
export class NotificationTestComponent implements OnInit {
  private apiService = inject(NotificationSettingsService);
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  testForm: FormGroup;
  isSending = false;

  step = 1; // 1: App, 2: Company, 3: User, 4: Message

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
    { field: 'uuid', header: 'UUID', type: 'text' },
    { field: 'acciones', header: 'Seleccionar', type: 'actions' }
  ];

  companyCols: TableColumn[] = [
    { field: 'name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'tax_id', header: 'Tax ID', type: 'text' },
    { field: 'acciones', header: 'Seleccionar', type: 'actions' }
  ];

  userCols: TableColumn[] = [
    { field: 'first_name', header: 'Nombre', type: 'text', sortable: true },
    { field: 'last_name', header: 'Apellido', type: 'text', sortable: true },
    { field: 'email', header: 'Email', type: 'text', sortable: true },
    { field: 'uuid', header: 'UUID', type: 'text' },
    { field: 'acciones', header: 'Seleccionar', type: 'actions' }
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
    this.securexService.getApps().subscribe({
      next: (res: any) => {
        this.apps = res.data || res;
        this.loadingApps = false;
      },
      error: () => this.loadingApps = false
    });
  }

  loadCompanies() {
    this.loadingCompanies = true;
    this.securexService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = res.data || res;
        this.loadingCompanies = false;
      },
      error: () => this.loadingCompanies = false
    });
  }

  loadUsers() {
    this.loadingUsers = true;
    this.securexService.getAdminUsers({ company_uuid: this.selectedCompany.uuid }).subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.users = data.data || data; // Handle pagination if any
        this.loadingUsers = false;
      },
      error: () => this.loadingUsers = false
    });
  }

  selectApp(app: any) {
    this.selectedApp = app;
    this.step = 2;
    if (this.companies.length === 0) {
      this.loadCompanies();
    }
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
      next: (res: any) => {
        this.notificationService.showSuccess('Notificación enviada correctamente al usuario.');
        this.isSending = false;
        // Optionally reset wizard
        this.step = 1;
        this.selectedApp = null;
        this.selectedCompany = null;
        this.selectedUser = null;
      },
      error: (err) => {
        this.notificationService.showError('Error al enviar notificación: ' + (err.error?.message || err.message));
        this.isSending = false;
      }
    });
  }
}
