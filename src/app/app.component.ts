import { Component, OnInit,Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToggleService } from './Services/toggle.services';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'hospital-frontend-angular';
   patient: any = null; 

  showDoctorButtons = false;
  showOnlyBackToHomeButton = false;
  showBackToHomeButton = false;
  showPatientInfo = false;
  showRegisterButton = false;

  constructor(private router: Router, private toggleService: ToggleService, private http: HttpClient) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      
      this.showPatientInfo = url.startsWith('/patient-home');
      this.showDoctorButtons = url.startsWith('/doctor-home');
      this.showOnlyBackToHomeButton = url.startsWith('/doctor-page');
      this.showBackToHomeButton = url.startsWith('/doctor-medical-record');
      this.showRegisterButton = url.startsWith('/register');
     if (this.showPatientInfo) {
      this.loadPatientInfo();
     }
    });
  }

  ngOnInit(): void {
     this.loadPatientInfo();
  }

   loadPatientInfo() {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return;

    this.http.get<any>(`http://localhost:5073/api/Patient/GetPatientById/${patientId}`)
      .subscribe({
        next: (res) => {
          this.patient = res.data;
          console.log(res.data)
        },
        error: (err) => {
          console.error('Hasta bilgisi alınamadı:', err);
        }
      });
  }


  logout(): void {
    localStorage.clear();
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
