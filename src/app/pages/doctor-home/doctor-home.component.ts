import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { ToggleService } from '../../Services/toggle.services';

interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  gender: string;
}

@Component({
  selector: 'app-doctor-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  constructor(private http: HttpClient, private router: Router,private toggleService: ToggleService, private location: Location) {}

  ngOnInit(): void {
    const idFromStorage = localStorage.getItem('doctorId');
    if (idFromStorage) {
      this.doctorId = Number(idFromStorage); 
      
      this.getDoctorInfo();

    } else {
      console.warn("localStorage'da doctorId bulunamadı.");
    }
    this.toggleService.toggleEdit$.subscribe(() => {
    this.toggleEditMode();
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
          console.log('imageUrl:', this.imageUrl);
        } else {
          this.imageUrl = 'assets/default-doctor.png';
        }
      },
      error: err => {
        console.error('Doktor bilgisi yüklenemedi', err);
      }
    });
}


updateDoctor() {
    this.http.put(`http://localhost:5073/api/Doctor/UpdateDoctorById/${this.doctor.id}`, this.doctor)
      .subscribe({
        next: () => {
          alert('Doktor bilgileri güncellendi.');
          this.editMode = false;
          this.getDoctorInfo();
        },
        error: err => alert('Güncelleme sırasında hata oluştu: ' + err.message)
      });
  }




  getPatientsByDoctorId(doctorId: string): void {
    this.http.get<any[]>(`http://localhost:5073/api/Patient/GetPatientById/${doctorId}`)
      .subscribe({
        next: (data) => {
          this.patients = data;
          console.log('Doktora ait hastalar:', data);
        },
        error: (err) => console.error('Hastalar alınamadı:', err)
      });
  }

  getAllPatients(): void {
    this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
      .subscribe({
        next: (response) => {
          console.log("API cevabı:", response);
          this.patients = response.data; 
        },
        error: (err) => {
          console.error("Hasta listesi alınamadı:", err);
        }
      });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

uploadImage(): void {
  if (!this.selectedFile) {
    alert("Lütfen bir dosya seçin.");
    return;
  }

  const formData = new FormData();
  formData.append("ImageFile", this.selectedFile); // DTO'daki isimle aynı olmalı

  const token = localStorage.getItem('token');
  if (!token) {
    alert("Oturum doğrulaması bulunamadı.");
    return;
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  this.http.post<any>('http://localhost:5073/api/Upload/UploadFile', formData, { headers })
    .subscribe({
      next: response => {
        alert("Resim başarıyla yüklendi.");
        this.getDoctorInfo(); 
      },
      error: err => {
        console.error("Resim yüklenemedi:", err);
        alert("Resim yüklenemedi.");
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
