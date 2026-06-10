import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-header.component.html',
  styleUrls: ['./welcome-header.component.css']
})
export class WelcomeHeaderComponent implements OnInit {
  private authService = inject(AuthService);
  
  currentUser: any = null;
  today: Date = new Date();

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }
}
