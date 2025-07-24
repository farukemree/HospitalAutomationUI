import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
        alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        alert('Kayıt sırasında hata oluştu.');
        console.error(err);
      }
    });
  }
}