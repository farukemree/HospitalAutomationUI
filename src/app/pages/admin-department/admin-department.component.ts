import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-department',
  imports: [CommonModule,FormsModule],
  standalone: true,
  templateUrl: './admin-department.component.html',
  styleUrls: ['./admin-department.component.css']
})
export class AdminDepartmentComponent {
  departments: any[] = [];
  newDepartmentName: string = '';
  showAddForm = false;
  editDepartmentId: number | null = null;
  editDepartmentName: string = '';

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.getAllDepartments();
  }

   getAllDepartments(): void {
    this.http.get<any>('http://localhost:5073/api/Department/GetAllDepartments')
      .subscribe({
        next: res => {
          this.departments = res.data;  
          
        },
        error: err => {
        }
      });
  }

 addDepartment() {
  const newDep = { name: this.newDepartmentName };
  this.http.post<any>('http://localhost:5073/api/Department/AddDepartment', newDep)
    .subscribe({
      next: (response) => {
       Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: response.message || 'Departman başarıyla eklendi.',
  confirmButtonText: 'Tamam'});

        this.getAllDepartments();
        this.newDepartmentName = '';
        this.showAddForm = false;
      },
      error: err => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Departman eklenemedi: ' + err.message,
    confirmButtonText: 'Tamam'
  });
}

    });
}


 deleteDepartment(id: number) {
  this.http.delete<any>(`http://localhost:5073/api/Department/DeleteDepartmentById/${id}`)
    .subscribe({
      next: (response) => {
       Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: response.message || 'Departman başarıyla silindi.',
  confirmButtonText: 'Tamam'
});

        this.getAllDepartments();
      },
     error: err => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Departman silinemedi: ' + err.message,
    confirmButtonText: 'Tamam'
  });
}

    });
}
startEdit(dep: any) {
  this.editDepartmentId = dep.id;
  this.editDepartmentName = dep.name;
}

cancelEdit() {
  this.editDepartmentId = null;
  this.editDepartmentName = '';
}

updateDepartment(id: number) {
  const updatedDep = { name: this.editDepartmentName };  
  this.http.put<any>(`http://localhost:5073/api/Department/UpdateDepartmentById/${id}`, updatedDep)
    .subscribe({
      next: (response) => {
       Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: response.message || 'Departman başarıyla güncellendi.',
  confirmButtonText: 'Tamam'
});

        this.getAllDepartments();
        this.cancelEdit();
      },
     error: err => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Departman güncellenemedi: ' + err.message,
    confirmButtonText: 'Tamam'
  });
}

    });
}



}
