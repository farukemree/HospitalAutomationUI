import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UpdateUserRoleDto {
  userId: number;
  newRole: string;
}

interface Doctor {
  id: number;
  fullName: string;
  specialization: string;
  phone: string;
  departmentId: number;
  imageFileKey: string;
}

interface Patient {
  id: number;
  fullName: string;
  birthDate: string;
  gender: string;
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  users: User[] = [];
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  departments: Department[] = [];
  
  selectedRole: { [userId: number]: string } = {};
  activeTab: string = 'users';
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadInitialData();
  }

  // İlk yüklemede tüm verileri getir (sayıları göstermek için)
  loadInitialData(): void {
    this.loadDoctorsForCount();
    this.loadPatientsForCount();
    this.loadDepartmentsForCount();
  }

  // Tab geçiş fonksiyonu - Bu fonksiyon artık doğru çalışacak
  switchTab(tabName: string): void {
    this.activeTab = tabName;
    console.log('Active tab changed to:', tabName); // Debug için
  }

  // Kullanıcıları yükle
  loadUsers(): void {
    this.http.get<{ data: User[] }>('http://localhost:5073/api/User/GetAllUsers')
      .subscribe({
        next: response => {
          this.users = response.data;
          // Kullanıcılar yüklenince sayıları güncelle
          this.updateCounts();
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Kullanıcılar yüklenemedi: ' + err.message,
            confirmButtonText: 'Tamam'
          });
        }
      });
  }

  // Sayıları güncelle (rol değişikliğinde)
  updateCounts(): void {
    this.loadDoctorsForCount();
    this.loadPatientsForCount();
    this.loadDepartmentsForCount();
  }

  // Sadece sayı için doktorları yükle
  loadDoctorsForCount(): void {
    this.http.get<any>('http://localhost:5073/api/Doctor/GetAllDoctors')
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.doctors = response.data;
          }
        },
        error: err => {
          console.error('Doktor sayısı yüklenemedi:', err);
        }
      });
  }

  // Sadece sayı için hastaları yükle
  loadPatientsForCount(): void {
    this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.patients = response.data;
          }
        },
        error: err => {
          console.error('Hasta sayısı yüklenemedi:', err);
        }
      });
  }

  // Sadece sayı için departmanları yükle
  loadDepartmentsForCount(): void {
    this.http.get<{ isSuccess: boolean; data: Department[]; message?: string }>('http://localhost:5073/api/Department/GetAllDepartments')
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.departments = response.data;
          }
        },
        error: err => {
          console.error('Departman sayısı yüklenemedi:', err);
        }
      });
  }

  // Doktorları getir ve doktor sekmesine geç
  getAllDoctors(): void {
    this.http.get<any>('http://localhost:5073/api/Doctor/GetAllDoctors')
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.doctors = response.data;
            this.switchTab('doctors');
            console.log('Doktorlar yüklendi, sekme değiştirildi'); // Debug için
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: response.message,
              confirmButtonText: 'Tamam'
            });
          }
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Doktorlar alınamadı: ' + err.message,
            confirmButtonText: 'Tamam'
          });
        }
      });
  }

  // Hastaları getir ve hasta sekmesine geç
  getAllPatients(): void {
    this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.patients = response.data;
            this.switchTab('patients');
            console.log('Hastalar yüklendi, sekme değiştirildi'); // Debug için
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: response.message,
              confirmButtonText: 'Tamam'
            });
          }
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Hastalar alınamadı: ' + err.message,
            confirmButtonText: 'Tamam'
          });
        }
      });
  }

  // Departmanları getir ve departman sekmesine geç
  getAllDepartments(): void {
    this.http.get<{ isSuccess: boolean; data: Department[]; message?: string }>('http://localhost:5073/api/Department/GetAllDepartments')
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.departments = response.data;
            this.switchTab('departments');
            console.log('Departmanlar yüklendi, sekme değiştirildi'); // Debug için
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: response.message,
              confirmButtonText: 'Tamam'
            });
          }
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Bölümler yüklenemedi: ' + err.message,
            confirmButtonText: 'Tamam'
          });
        }
      });
  }

  // Kullanıcı rolünü güncelle
  updateUserRole(userId: number, newRole: string): void {
    if (!newRole) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı',
        text: 'Lütfen bir rol seçin.',
        confirmButtonText: 'Tamam'
      });
      return;
    }

    const dto = {
      userId: userId,
      newRole: newRole
    };

    this.http.post('http://localhost:5073/api/User/UpdateUserRole', dto)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Rol başarıyla güncellendi.',
            confirmButtonText: 'Tamam'
          });
          // Kullanıcıları yeniden yükle ve sayıları güncelle
          this.loadUsers();
          // Selected role'u temizle
          delete this.selectedRole[userId];
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Rol güncellenemedi: ' + err.message,
            confirmButtonText: 'Tamam'
          });
        }
      });
  }

  // Departman adını ID'den bul
  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(d => d.id === departmentId);
    return department ? department.name : `Departman ID: ${departmentId}`;
  }

  // Tarihi formatla
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  }

  // Cinsiyet formatla
  formatGender(gender: string): string {
    if (!gender) return '';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  }

  // TrackBy fonksiyonu performance için
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  trackByDoctorId(index: number, doctor: Doctor): number {
    return doctor.id;
  }

  trackByPatientId(index: number, patient: Patient): number {
    return patient.id;
  }

  trackByDepartmentId(index: number, department: Department): number {
    return department.id;
  }
}