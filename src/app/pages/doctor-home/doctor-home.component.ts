import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { ToggleService } from '../../Services/toggle.services';
import Swal from 'sweetalert2';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
import { ChatboxComponent } from '../../shared/chatbox/chatbox.component';
interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  gender: string;
}

@Component({
  selector: 'app-doctor-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButtonComponent, ChatboxComponent],
  templateUrl: './doctor-home.component.html',
  styleUrls: ['./doctor-home.component.css']
})
export class DoctorHomeComponent implements OnInit {
  doctor: any = {};
  doctorId: number | null = null;
  patients: Patient[] = [];
  selectedFile: File | null = null;
  departments: any[] = [];
  editMode: boolean = false;
  imageUrl: string | null = null;
  showPatients: boolean = false;
  constructor(private http: HttpClient, private router: Router,private toggleService: ToggleService, private location: Location) {}

  ngOnInit(): void {
    const idFromStorage = localStorage.getItem('doctorId');
    if (idFromStorage) {
      this.doctorId = Number(idFromStorage); 
      
      this.getDoctorInfo();

    } else {
     Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: "localStorage'da doctorId bulunamadı.",
  confirmButtonText: 'Tamam'
});

    }
    this.toggleService.toggleEdit$.subscribe(() => {
    this.toggleEditMode();
  });
  this.toggleService.reloadDoctorInfo$.subscribe(() => {
    this.getDoctorInfo();
  });
  this.toggleService.reloadPatients$.subscribe(() => {
    this.getAllPatients();
  });
  }



   toggleEditMode() {
    this.editMode = !this.editMode;
  }



getDoctorInfo(): void {
  this.http.get<any>(`http://localhost:5073/api/Doctor/GetDoctorById/${this.doctorId}`)
    .subscribe({
      next: res => {
        this.doctor = res.data;

        if (this.doctor?.imageFileKey) {
          this.imageUrl = `http://localhost:5073/api/Upload/GetUserImage/${this.doctor.imageFileKey}`;
        } else {
          this.imageUrl = 'assets/default-doctor.png';
        }
      },
      error: err => {
       Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Doktor bilgisi yüklenemedi: ' + (err.message || err),
  confirmButtonText: 'Tamam'
});
      }
    });
}


updateDoctor() {
    this.http.put(`http://localhost:5073/api/Doctor/UpdateDoctorById/${this.doctor.id}`, this.doctor)
      .subscribe({
        next: () => {
          Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Doktor bilgileri güncellendi.',
  confirmButtonText: 'Tamam'
});

          this.editMode = false;
          this.getDoctorInfo();
        },
       error: err => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Güncelleme sırasında hata oluştu: ' + err.message,
    confirmButtonText: 'Tamam'
  });
}

      });
  }




  getPatientsByDoctorId(doctorId: string): void {
    this.http.get<any[]>(`http://localhost:5073/api/Patient/GetPatientById/${doctorId}`)
      .subscribe({
        next: (data) => {
          this.patients = data;
        },
        error: (err) => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Hastalar alınamadı: ' + (err.message || err),
    confirmButtonText: 'Tamam'
  });
}

      });
  }

  getAllPatients(): void {
    this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
      .subscribe({
        next: (response) => {
          this.patients = response.data; 
          this.showPatients = true;
        },
        error: (err) => {
          Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Hasta listesi alınamadı: ' + (err.message || err),
  confirmButtonText: 'Tamam'
});
        }
      });
  }
  hidePatients(): void {
  this.showPatients = false;
}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

uploadImage(): void {
  if (!this.selectedFile) {
   Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Lütfen bir dosya seçin.',
  confirmButtonText: 'Tamam'
});

    return;
  }

  const formData = new FormData();
  formData.append("ImageFile", this.selectedFile); // DTO'daki isimle aynı olmalı

  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Oturum doğrulaması bulunamadı.',
  confirmButtonText: 'Tamam'
});

    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.post<any>('http://localhost:5073/api/Upload/UploadFile', formData, { headers })
    .subscribe({
      next: response => {
       Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Resim başarıyla yüklendi.',
  confirmButtonText: 'Tamam'
});

        this.getDoctorInfo(); 
      },
      error: err => {
        Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Resim yüklenemedi.',
  confirmButtonText: 'Tamam'
});

      }
    });
}








  goToAppointments(): void {
    this.router.navigate(['/doctor-page']);
  }

  goToDoctorPage(): void {
    this.router.navigate(['/doctor-page']);
  }

  goBack(): void {
    this.location.back();
  }
}
