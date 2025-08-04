import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule,CustomButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  code: string = '';
  isLoading = false;
  isCodeSent = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  sendResetCode() {
    this.isLoading = true;

    this.http.post<any>('http://localhost:5073/api/PasswordReset/ForgotPassword', { email: this.email }).subscribe({
      next: response => {
        this.successMessage = 'Şifre sıfırlama kodu gönderildi!';
        this.isCodeSent = true;
        this.isLoading = false;
        localStorage.setItem('resetEmail', this.email);
      },
      error: err => {
        this.errorMessage = 'Kod gönderilemedi: ' + (err.error?.message || 'Hata oluştu.');
        this.isLoading = false;
      }
    });
  }

  verifyCode() {
    const email = localStorage.getItem('resetEmail') ?? this.email;

    this.http.post<any>('http://localhost:5073/api/PasswordReset/VerifyCode', {
      email,
      code: this.code
    }).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.router.navigate(['/reset-password'], {
            queryParams: {
              email: email,
              code: this.code
            }
          });
        } else {
          this.errorMessage = response.message || 'Kod doğrulanamadı.';
        }
      },
      error: err => {
        this.errorMessage = 'Hata: ' + (err.error?.message || 'Sunucu hatası');
      }
    });
  }
}
