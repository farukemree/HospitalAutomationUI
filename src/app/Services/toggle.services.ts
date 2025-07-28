import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {
  // Ayarları aç/kapat
  private toggleEditSource = new Subject<void>();
  toggleEdit$ = this.toggleEditSource.asObservable();

  // Doktor bilgilerini yenileme tetikleyicisi
  private reloadDoctorInfoSource = new Subject<void>();
  reloadDoctorInfo$ = this.reloadDoctorInfoSource.asObservable();
  private showAppointmentSource = new Subject<void>();
 showAppointments$ = this.showAppointmentSource.asObservable();

  // Hasta listesini yenileme tetikleyicisi
  private reloadPatientsSource = new Subject<void>();
  reloadPatients$ = this.reloadPatientsSource.asObservable();
  
  private showMedicalRecordsSource = new Subject<void>();
 showMedicalRecords$ = this.showMedicalRecordsSource.asObservable();

  toggleEdit(): void {
    this.toggleEditSource.next();
  }

  reloadDoctorInfo(): void {
    this.reloadDoctorInfoSource.next();
  }

  reloadPatients(): void {
    this.reloadPatientsSource.next();
  }
  triggerShowMedicalRecords(): void {
  this.showMedicalRecordsSource.next();
}
triggerShowAppointments(): void {
 this.showAppointmentSource.next();
}

}
