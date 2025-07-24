import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';



interface DecodedToken {
  sub: string;
  role: string;
  email: string;
  exp: number;
}
@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router:  Router

  ) {}

 handleLogin() {
  const loginData = {
    username: this.username,
    password: this.password
  };

  this.http.post<any>('http://localhost:5073/api/User/Login', loginData)
    .subscribe({
      next: (response) => {
        const token = response.data;
        localStorage.setItem('token', token);

        try {
          const decoded: any = jwtDecode(token);

          const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

  
          localStorage.setItem('userId', userId);

          console.log("Token çözüldü:", decoded);

          if (role.toLowerCase() === 'doctor') {
            localStorage.setItem('doctorId', userId);
            alert('Doktor olarak giriş başarılı!');
            this.router.navigate(['/doctor-home']);
          }
          else if (role.toLowerCase() === 'patient') {
            localStorage.setItem('patientId', userId);
            alert('Hasta olarak giriş başarılı!');
            this.router.navigate(['/patient-home']);
          }
          else if (role.toLowerCase() === 'admin') {
            localStorage.setItem('adminId', userId);
            alert('Admin olarak giriş başarılı!');
            this.router.navigate(['/admin-home']);
          }

        } catch (err) {
          console.error("Token decode edilemedi:", err);
          alert("Token geçersiz!");
        }
      },
      error: (err) => {
        console.error("Giriş hatası:", err);
        alert('Giriş başarısız! Kullanıcı adı veya şifre yanlış olabilir.');
      }
    });
}
goToRegister() {
  this.router.navigate(['/register']);
}
}
