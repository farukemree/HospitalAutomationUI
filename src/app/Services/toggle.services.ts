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

  // Hasta listesini yenileme tetikleyicisi
  private reloadPatientsSource = new Subject<void>();
  reloadPatients$ = this.reloadPatientsSource.asObservable();

  // Metotlar: dışarıdan tetiklenir

  toggleEdit(): void {
    this.toggleEditSource.next();
  }

  reloadDoctorInfo(): void {
    this.reloadDoctorInfoSource.next();
  }

  reloadPatients(): void {
    this.reloadPatientsSource.next();
  }
}
