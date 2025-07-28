import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
  user: {
    username: '',
    password: '',
    email: ''
  },
  patient: {
    fullName: '',
    birthDate: '',
    gender: ''
  }
};


  constructor(private http: HttpClient, private router: Router) {}

   register() {
    const payload = {
      user: this.registerData.user,
      patient: this.registerData.patient
    };

    this.http.post('http://localhost:5073/api/User/Register', payload)
      .subscribe({
        next: (res) => {
         Swal.fire({
          icon: 'success',
          title: 'Kayıt başarılı!',
          text: 'Giriş sayfasına yönlendiriliyorsunuz...',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        this.router.navigate(['/login']); 
      },
      error: (err) => {
         Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: 'Kayıt sırasında hata oluştu.',
          confirmButtonText: 'Tamam'
        });
      
      }
    });
  }
}