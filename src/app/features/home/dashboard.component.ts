import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { SelectComponent } from '@shared/components/select/select.component';
import { ToolbarComponent } from '@shared/components/toolbar/toolbar.component';
import { MetricSummaryComponent } from './components/metric-summary/metric-summary.component';
import { LoginAttemptsChartComponent } from './components/login-attempts-chart/login-attempts-chart.component';
import { NotificationsChartComponent } from './components/notifications-chart/notifications-chart.component';
import { ApiStatusSummaryComponent } from './components/api-status-summary/api-status-summary.component';
import { RecentAuditComponent } from './components/recent-audit/recent-audit.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectComponent,
    ToolbarComponent,
    MetricSummaryComponent,
    LoginAttemptsChartComponent,
    NotificationsChartComponent,
    ApiStatusSummaryComponent,
    RecentAuditComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);

  userCompanies = this.authService.userCompanies;
  selectedCompanyUuid = signal<string | null>(null);
  companyControl = new FormControl<string>('');

  ngOnInit() {
    this.companyControl.valueChanges.subscribe((value: string | null) => {
      this.selectedCompanyUuid.set(value || null);
    });
  }
}
