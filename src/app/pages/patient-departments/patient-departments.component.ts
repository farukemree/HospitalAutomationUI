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
  specialization?: string; // opsiyonel
  phone?: string;
  departmentId?: number;
  imageFileKey?: string;
  imageUrl?: string; // frontend için
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.http.get<any>('http://localhost:5073/api/Department/GetAllDepartmentsWithDescriptions')
      .subscribe({
        next: res => {
          if (res.isSuccess) {
            this.departments = res.data;
          } else {
            Swal.fire('Hata', 'Departmanlar yüklenemedi: ' + res.message, 'error');
          }
        },
        error: err => {
          Swal.fire('Hata', 'Departmanlar yüklenirken hata oluştu: ' + err.message, 'error');
        }
      });
  }

  toggleDescription(deptId: number): void {
    if (this.selectedDepartmentDescriptionId === deptId) {
      this.selectedDepartmentDescriptionId = null;
      this.selectedDoctorsDepartmentId = null;
      this.doctors = [];
    } else {
      this.selectedDepartmentDescriptionId = deptId;
      this.selectedDoctorsDepartmentId = null;
      this.doctors = [];
    }
  }

 loadDoctors(departmentId: number): void {
  this.http.get<any>(`http://localhost:5073/api/Doctor/GetDoctorsByDepartmentId/${departmentId}`)
    .subscribe({
      next: res => {
        if (res.isSuccess) {
          // res.data içindeki her doktora imageUrl ekle
          this.doctors = res.data.map((doc: any) => ({
            ...doc,
            name: doc.fullName, // eğer API'den fullName geliyor, sen name ile kullanabilirsin
            imageUrl: doc.imageFileKey 
              ? `http://localhost:5073/api/Upload/GetUserImage/${doc.imageFileKey}`
              : 'assets/default-doctor.png' // varsayılan resim olabilir
          }));
          this.selectedDoctorsDepartmentId = departmentId;
        } else {
          this.doctors = [];
          this.selectedDoctorsDepartmentId = null;
          Swal.fire('Hata', 'Doktorlar yüklenemedi: ' + res.message, 'error');
        }
      },
      error: err => {
        Swal.fire('Hata', 'Doktorlar yüklenirken hata oluştu: ' + err.message, 'error');
      }
    });
}
onImageError(event: Event): void {
  (event.target as HTMLImageElement).src = 'assets/default-doctor.png';
}

}
