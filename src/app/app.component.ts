import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToggleService } from './Services/toggle.services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'hospital-frontend-angular';

  showDoctorButtons = false;     
  showOnlyBackToHomeButton = false; 
  showBackToHomeButton = false;


  constructor(private router: Router, private toggleService: ToggleService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      this.showDoctorButtons = url.startsWith('/doctor-home');
      this.showOnlyBackToHomeButton = url.startsWith('/doctor-page');
      this.showBackToHomeButton = url.startsWith('/doctor-medical-record');
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  goToDoctorHome(): void {
    this.router.navigate(['/doctor-home']);
  }

  goToAppointments(): void {
    this.router.navigate(['/doctor-page']);
  }

  goToSettings(): void {
    this.toggleService.toggleEdit();
    this.router.navigate(['/doctor-home']);
  }

  reloadPatients(): void {
    this.toggleService.reloadPatients();
  }

  reloadDoctorInfo(): void {
    this.toggleService.reloadDoctorInfo();
  }
  goToMedicalRecords(): void {
  this.router.navigate(['/doctor-medical-record']);
}

}
