import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  description: string;
}

@Component({
  selector: 'app-doctor-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-page.component.html',
  styleUrls: ['./doctor-page.component.css']
})
export class DoctorPageComponent implements OnInit {
  doctors: any[] = [];
  appointments: Partial<Appointment>[] = [];
  appointmentIdToFetch: number | null = null;
  selectedAppointment: any = null;
  doctorId: number | null = null;


  newAppointment: Partial<Appointment> = {
    patientId: 0,
    doctorId: 0,
    appointmentDate: '',
    description: ''
  };

  constructor(private http: HttpClient, private router: Router) {
    const idFromStorage = localStorage.getItem('doctorId'); 
    this.doctorId = idFromStorage ? Number(idFromStorage) : null;
  }

  ngOnInit(): void {
    this.doctorId = Number(localStorage.getItem('doctorId'));
    this.loadDoctors();
  }
  isUpdateMode: boolean = false;  

startUpdate(appointment: Partial<Appointment>): void {
  this.newAppointment = { ...appointment }; 
  this.isUpdateMode = true;
}

cancelUpdate(): void {
  this.isUpdateMode = false;
  this.resetNewAppointment(); 
}


addAppointment(): void {
  if (!this.doctorId) {
    Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Doktor bilgisi bulunamadı, işlem yapılamıyor.',
  confirmButtonText: 'Tamam'
});

    return;
  }

  this.newAppointment.doctorId = this.doctorId;

  this.http.post<any>('http://localhost:5073/api/Appointment/AddAppointment', this.newAppointment)
    .subscribe({
      next: (res) => {
        Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Randevu eklendi!',
  confirmButtonText: 'Tamam'
});

        this.getAppointments();
        this.resetNewAppointment();
      },
     error: (err) => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Ekleme hatası: ' + (err.message || err),
    confirmButtonText: 'Tamam'
  });
}

    });
}




loadDoctors(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);

    this.http.get<any[]>('http://localhost:5073/api/Doctor/GetAllDoctors', { headers })
      .subscribe({
        next: (data) => {
       
          this.doctors = Array.isArray(data) ? data : [];
        },
      error: (err) => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Doktorları çekerken hata oluştu: ' + (err.message || err),
    confirmButtonText: 'Tamam'
  });
}

      });
  }
  
  editDoctor(doctor: any): void {
    console.log("Düzenlenecek doktor:", doctor);
  }

  deleteDoctor(id: number): void {
  Swal.fire({
    title: 'Emin misiniz?',
    text: 'Bu doktoru silmek istediğinize emin misiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Evet, sil',
    cancelButtonText: 'Hayır, iptal'
  }).then((result) => {
    if (result.isConfirmed) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);

      this.http.delete(`http://localhost:5073/api/Doctor/DeleteDoctor/${id}`, { headers })
        .subscribe({
          next: () => {
            this.doctors = this.doctors.filter(d => d.id !== id);
            Swal.fire({
              icon: 'success',
              title: 'Başarılı',
              text: 'Doktor silindi!',
              confirmButtonText: 'Tamam'
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: 'Silme işlemi başarısız oldu.',
              confirmButtonText: 'Tamam'
            });
          }
        });
    }
  });
}

  getAppointments(): void {
    if (!this.doctorId) {
   Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'doctorId bulunamadı, randevular getirilmedi.',
  confirmButtonText: 'Tamam'
});
    return;
  }
  this.http.get<any>(`http://localhost:5073/api/Appointment/GetAppointmentsByDoctorId/${this.doctorId}`)

    .subscribe({
      next: (response) => {
        if(response.isSuccess) {
          this.appointments = response.data;
        } else {
        Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: response.message,
  confirmButtonText: 'Tamam'
});
        }
      },
     error: (err) => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'API çağrısı sırasında hata oluştu: ' + (err.message || err),
    confirmButtonText: 'Tamam'
  });
}

    });
}


  getAppointmentById(): void {
  if (!this.appointmentIdToFetch) {
   Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Lütfen bir randevu ID girin.',
  confirmButtonText: 'Tamam'
});

    return;
  }

  this.http.get<any>(`http://localhost:5073/api/Appointment/GetAppointmentById/${this.appointmentIdToFetch}`)
    .subscribe({
      next: (response) => {
        this.selectedAppointment = response.data; 
        this.appointmentIdToFetch = null;  // input temizle
      },
      error: (err) => {
        Swal.fire({
  icon: 'info',
  title: 'Bilgi',
  text: 'Randevu bulunamadı.',
  confirmButtonText: 'Tamam'
});

      }
    });
}
  closeAppointmentDetails(): void {
  this.selectedAppointment = null;
}
 

  updateAppointmentById(): void {
    if (!this.newAppointment.id) {
    Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Güncelleme için randevu ID girilmelidir.',
  confirmButtonText: 'Tamam'
});

      return;
    }

    this.http.put<any>(`http://localhost:5073/api/Appointment/UpdateAppointmentById/${this.newAppointment.id}`, this.newAppointment)
      .subscribe({
        next: () => {
         Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Randevu güncellendi!',
  confirmButtonText: 'Tamam'
});

          this.getAppointments();
          this.resetNewAppointment();
        },
       error: (err) => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Güncelleme hatası: ' + (err.message || err),
    confirmButtonText: 'Tamam'
  });
}

      });
  }


  deleteAppointmentById(id: number): void {
    if (id === undefined) {
  
Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Randevu ID si undefined, silme işlemi iptal edildi.',
  confirmButtonText: 'Tamam'
});
    return;
  }
    if (!confirm('Bu randevuyu silmek istiyor musunuz?')) return;

    this.http.delete(`http://localhost:5073/api/Appointment/DeleteAppointmentById/${id}`)
      .subscribe({
        next: () => {
        Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Randevu silindi!',
  confirmButtonText: 'Tamam'
});

          this.appointments = this.appointments.filter(a => a.id !== id);
        },
       error: (err) => {
  console.error('Silme hatası:', err);
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: 'Silme işlemi sırasında hata oluştu: ' + (err.message || err),
    confirmButtonText: 'Tamam'
  });
}

      });
  }

  // Ana sayfaya git
  goToDoctorHome(): void {
    this.router.navigate(['/doctor-home']);
  }

  // Yeni randevu formunu sıfırla
  private resetNewAppointment(): void {
    this.newAppointment = {
      patientId: 0,
      doctorId: this.doctorId || 0,
      appointmentDate: '',
      description: ''
    };
    this.appointmentIdToFetch = null;
  }
}
