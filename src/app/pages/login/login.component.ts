import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
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

            if (role.toLowerCase() === 'doctor') {
              localStorage.setItem('doctorId', userId);
             Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Doktor olarak giriş başarılı!',
  confirmButtonText: 'Tamam'
});

              this.router.navigate(['/doctor-home']);
            }
            else if (role.toLowerCase() === 'patient') {
              localStorage.setItem('patientId', userId);
           Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Hasta olarak giriş başarılı!',
  confirmButtonText: 'Tamam'
});

              this.router.navigate(['/patient-home']);
            }
            else if (role.toLowerCase() === 'admin') {
              localStorage.setItem('adminId', userId);
              Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Admin olarak giriş başarılı!',
  confirmButtonText: 'Tamam'
});

              this.router.navigate(['/admin-home']);
            }
          } catch (err) {
            Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Token geçersiz!',
  confirmButtonText: 'Tamam'
});

          }
        },
        error: (err) => {
         Swal.fire({
  icon: 'error',
  title: 'Giriş Başarısız',
  text: 'Kullanıcı adı veya şifre yanlış olabilir.',
  confirmButtonText: 'Tamam'
});

        }
      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
