import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  email: string = '';
  code: string = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.code = params['code'];
    });
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Şifreler uyuşmuyor.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>('http://localhost:5073/api/PasswordReset/ResetPassword', {
      email: this.email,
      code: this.code,
      newPassword: this.newPassword
    }).subscribe({
      next: res => {
        this.successMessage = 'Şifre başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...';
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Hata oluştu.';
        this.isLoading = false;
      }
    });
  }
}
