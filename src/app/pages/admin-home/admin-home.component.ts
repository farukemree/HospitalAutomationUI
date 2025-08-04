import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';

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
  imports: [CommonModule, FormsModule,CustomButtonComponent],
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
getAllDoctors(): void {
  this.http.get<any>('http://localhost:5073/api/Doctor/GetAllDoctors')
    .subscribe({
      next: response => {
        if (response.isSuccess) {
          this.doctors = response.data;
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


getAllPatients(): void {
  this.http.get<any>('http://localhost:5073/api/Patient/GetAllPatients')
    .subscribe({
      next: response => {
        if (response.isSuccess) {
          this.patients = response.data;
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


getAllDepartments(): void {
  this.http.get<{ isSuccess: boolean; data: any[]; message?: string }>('http://localhost:5073/api/Department/GetAllDepartments')
    .subscribe({
      next: response => {
        if (response.isSuccess) {
          this.departments = response.data;
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

        this.loadUsers();  
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

}
