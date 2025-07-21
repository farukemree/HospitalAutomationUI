import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  constructor(private http: HttpClient, private router: Router, private location: Location) {}

  ngOnInit(): void {
    const idFromStorage = localStorage.getItem('doctorId');
    if (idFromStorage) {
      this.doctorId = Number(idFromStorage); 
      
      this.getDoctorInfo();

    } else {
      console.warn("localStorage'da doctorId bulunamadı.");
    }
  }
   toggleEditMode() {
    this.editMode = !this.editMode;
  }

 getDoctorInfo(): void {
  const userId = Number(localStorage.getItem('userId')); 
  this.http.get<any>(`http://localhost:5073/api/Doctor/GetDoctorById/${userId}`)
    .subscribe({
      next: response => {
        if (response.isSuccess && response.data) {
          this.doctor = response.data;
        } else {
          console.error("Doktor bulunamadı:", response.message);  
        }
      },
      error: err => {
        console.error("Doktor bilgisi alınamadı:", err);
      }
    });
}
updateDoctor() {
    // Burada update API çağrısını yap, örnek:
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

  deleteDoctor(): void {
    if (!this.doctorId) return;
    const confirmed = confirm("Doktor hesabınızı silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    this.http.delete(`http://localhost:5073/api/Doctor/DeleteDoctor/${this.doctorId}`)
      .subscribe({
        next: () => {
          alert("Doktor silindi.");
          this.doctor = null;
        },
        error: (err) => console.error("Silme hatası:", err)
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
  formData.append('imageFile', this.selectedFile);

  this.http.post<any>('http://localhost:5073/api/Upload/UploadFile', formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    }
  }).subscribe({
    next: (res) => {
      alert("Resim başarıyla yüklendi.");
    },
    error: (err) => {
      alert("Yükleme hatası");
      console.error(err);
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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('doctorId');
    this.router.navigate(['/login']);
  }
}
