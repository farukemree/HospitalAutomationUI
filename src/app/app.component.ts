import { Component, OnInit,Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToggleService } from './Services/toggle.services';
import { HttpClient } from '@angular/common/http';
import { ChatboxComponent } from './shared/chatbox/chatbox.component';
import { SharedModule } from './shared/shared.module';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SharedModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'hospital-frontend-angular';
   patient: any = null; 
  showAdminButtons = false;
  showDoctorButtons = false;
  showOnlyBackToHomeButton = false;
  showBackToHomeButton = false;
  showPatientInfo = false;
  showPatientDepartment = false;
  showRegisterButton = false;
  showAdminDepartmentButtons = false;
  showPatientPageButtons = false;
  showDoctorChat = false;
  showPatientOther = false;

  constructor(private router: Router, private toggleService: ToggleService, private http: HttpClient) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      
      this.showPatientInfo = url.startsWith('/patient-home');
      this.showDoctorChat = url.startsWith('/doctor-chat');
      this.showPatientDepartment = url.startsWith('/patient-department');
      this.showAdminButtons = url.startsWith('/admin-home');
      this.showAdminDepartmentButtons = url.startsWith('/admin-department');
      this.showDoctorButtons = url.startsWith('/doctor-home');
      this.showOnlyBackToHomeButton = url.startsWith('/doctor-page');
      this.showBackToHomeButton = url.startsWith('/doctor-medical-record');
      this.showPatientPageButtons = url.startsWith('/patient-page');
      this.showPatientOther = url.startsWith('/patient-other');
      this.showRegisterButton = url.startsWith('/register') || url.startsWith('/forgot-password') || url.startsWith('/reset-password');

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
        },
        error: (err) => {
          Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Tahmin yapılırken hata oluştu.'
});
        }
      });
  }
  


  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  goToMyDepartmentPage(): void {
    this.router.navigate(['/patient-department']);
  }
   goToDoctorChatPage(): void {
    this.router.navigate(['/doctor-chat']);
  }
  goToPatientOther(): void{
    this.router.navigate(['/patient-other']);
  }
  goToPatientHome(): void {

    this.router.navigate(['/patient-home']);
  }
  goToPatientPage(): void{
    this.router.navigate(['/patient-page']);
  }

  goToDoctorHome(): void {
    this.router.navigate(['/doctor-home']);
  }
  goToAdminHome(): void {
    this.router.navigate(['/admin-home']);
  }
  goToDepartmentPage() {
  this.router.navigate(['/admin-department']);
}

  goToAppointments(): void {
    this.router.navigate(['/doctor-page']);
  }
  goToMyMedicalRecords(): void {
  this.toggleService.triggerShowMedicalRecords();
}
  goToMyAppointments(): void{
    this.toggleService.triggerShowAppointments();
  }
  goToDynamicHome(): void {
  const url = this.router.url; // mevcut URL

  if (url.startsWith('/patient-')) {
    this.router.navigate(['/patient-home']);
  } else if (url.startsWith('/doctor-')) {
    this.router.navigate(['/doctor-home']);
  } else if (url.startsWith('/admin-')) {
    this.router.navigate(['/admin-home']);
  } else {
    this.router.navigate(['/login']); // tanınmayan sayfa
  }
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
