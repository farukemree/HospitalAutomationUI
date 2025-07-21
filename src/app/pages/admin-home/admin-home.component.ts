import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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


@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  users: User[] = [];
  doctors: any[] = [];
  patients: any[] = [];
 departments: { id: number; name: string }[] = [];

  selectedRole: { [userId: number]: string } = {};
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers(); 
  }

  loadUsers(): void {
  this.http.get<{ data: User[] }>('http://localhost:5073/api/User/GetAllUsers')
    .subscribe({
      next: response => {
        this.users = response.data; 
      },
      error: err => alert('Kullanıcılar yüklenemedi: ' + err.message)
    });
}
getAllDoctors(): void {
  this.http.get<any>('http://localhost:5073/api/Doctor/GetAllDoctors')
    .subscribe({
      next: response => {
        if (response.isSuccess) {
          this.doctors = response.data;
        } else {
          alert("Hata: " + response.message);
        }
      },
      error: err => {
        alert("Doktorlar alınamadı: " + err.message);
      }
    });
}


getAllPatients(): void {
  this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
    .subscribe({
      next: response => {
        if (response.isSuccess) {
          this.patients = response.data;
        } else {
          alert("Hata: " + response.message);
        }
      },
      error: err => {
        alert("Hastalar alınamadı: " + err.message);
      }
    });
}


getAllDepartments(): void {
  this.http.get<{ isSuccess: boolean; data: any[]; message?: string }>('http://localhost:5073/api/Department/GetAllDepartments')
    .subscribe({
      next: response => {
        if (response.isSuccess) {
          this.departments = response.data;
        } else {
          alert('Hata: ' + response.message);
        }
      },
      error: err => alert('Bölümler yüklenemedi: ' + err.message)
    });
}



  updateUserRole(userId: number, newRole: string): void {
  if (!newRole) {
    alert('Lütfen bir rol seçin.');
    return;
  }

  const dto = {
    userId: userId,
    newRole: newRole
  };

  this.http.post('http://localhost:5073/api/User/UpdateUserRole', dto)
    .subscribe({
      next: () => {
        alert('Rol başarıyla güncellendi.');
        this.loadUsers();  
      },
      error: err => {
        alert('Rol güncellenemedi: ' + err.message);
      }
    });
}

}
