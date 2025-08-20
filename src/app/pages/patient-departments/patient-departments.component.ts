import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Department {
  id: number;
  name: string;
  description: string | null;
}

interface Doctor {
  id: number;
  name: string;
  fullName?: string;
  specialization?: string;
  phone?: string;
  departmentId?: number;
  imageFileKey?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-patient-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-departments.component.html',
  styleUrls: ['./patient-departments.component.css']
})
export class PatientDepartmentsComponent implements OnInit {
  departments: Department[] = [];
  doctors: Doctor[] = [];
  selectedDepartmentDescriptionId: number | null = null;
  selectedDoctorsDepartmentId: number | null = null;
  isLoadingDepartments: boolean = false;
  isLoadingDoctors: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.http.get<any>('http://localhost:5073/api/Department/GetAllDepartmentsWithDescriptions')
      .subscribe({
        next: res => {
          this.isLoadingDepartments = false;
          if (res.isSuccess && res.data) {
            this.departments = res.data;
            console.log('Departments loaded:', this.departments);
          } else {
            this.departments = [];
            Swal.fire('Hata', 'Departmanlar yüklenemedi: ' + (res.message || 'Bilinmeyen hata'), 'error');
          }
        },
        error: err => {
          this.isLoadingDepartments = false;
          console.error('Department loading error:', err);
          Swal.fire('Hata', 'Departmanlar yüklenirken hata oluştu: ' + err.message, 'error');
        }
      });
  }

  toggleDescription(deptId: number): void {
    // Eğer aynı departman tıklanıyorsa kapat
    if (this.selectedDepartmentDescriptionId === deptId) {
      this.selectedDepartmentDescriptionId = null;
    } else {
      // Başka departman tıklanıyorsa o departmanı aç
      this.selectedDepartmentDescriptionId = deptId;
    }
    
    // Her durumda doktor listesini temizle
    this.selectedDoctorsDepartmentId = null;
    this.doctors = [];
  }

  loadDoctors(departmentId: number): void {
    this.isLoadingDoctors = true;
    this.selectedDoctorsDepartmentId = departmentId;
    
    this.http.get<any>(`http://localhost:5073/api/Doctor/GetDoctorsByDepartmentId/${departmentId}`)
      .subscribe({
        next: res => {
          this.isLoadingDoctors = false;
          console.log('Doctor API response:', res);
          
          if (res.isSuccess && res.data) {
            this.doctors = res.data.map((doc: any) => ({
              ...doc,
              name: doc.fullName || doc.name || 'Bilinmeyen Doktor',
              imageUrl: doc.imageFileKey 
                ? `http://localhost:5073/api/Upload/GetUserImage/${doc.imageFileKey}`
                : 'assets/default-doctor.png'
            }));
            console.log('Doctors processed:', this.doctors);
          } else {
            this.doctors = [];
            console.log('No doctors found or API error:', res.message);
            if (res.message) {
              Swal.fire('Bilgi', 'Bu departmanda henüz doktor bulunmamaktadır.', 'info');
            }
          }
        },
        error: err => {
          this.isLoadingDoctors = false;
          this.doctors = [];
          console.error('Doctor loading error:', err);
          Swal.fire('Hata', 'Doktorlar yüklenirken hata oluştu: ' + err.message, 'error');
        }
      });
  }

  getDepartmentNameById(id: number | null): string {
    if (!id) return '';
    const dept = this.departments.find(d => d.id === id);
    return dept ? dept.name : '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-doctor.png';
  }

  // Yardımcı metodlar
  hasDoctors(): boolean {
    return this.doctors && this.doctors.length > 0;
  }

  isDepartmentExpanded(deptId: number): boolean {
    return this.selectedDepartmentDescriptionId === deptId;
  }

  isDoctorsLoaded(deptId: number): boolean {
    return this.selectedDoctorsDepartmentId === deptId;
  }

  // TrackBy metodları - Angular performansı için
  trackByDepartmentId(index: number, department: Department): number {
    return department.id;
  }

  trackByDoctorId(index: number, doctor: Doctor): number {
    return doctor.id;
  }
}