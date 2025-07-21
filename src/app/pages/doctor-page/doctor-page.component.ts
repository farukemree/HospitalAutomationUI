import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  reason: string;
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
  appointments: Appointment[] = [];
  appointmentIdToFetch: number | null = null;

  newAppointment: Partial<Appointment> = {
    patientId: 0,
    doctorId: 0,
    date: '',
    reason: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadDoctors();
  }
  isUpdateMode: boolean = false;  // Güncelleme modunu kontrol eder

startUpdate(appointment: Appointment): void {
  this.newAppointment = { ...appointment }; // Seçilen randevuyu form alanına kopyala
  this.isUpdateMode = true;
}

cancelUpdate(): void {
  this.isUpdateMode = false;
  this.resetNewAppointment(); // Formu sıfırla
}



  // Doktor listesini yükle
  loadDoctors(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);

    this.http.get<any[]>('http://localhost:5073/api/Doctor/GetAllDoctors', { headers })
      .subscribe({
        next: (data) => {
          console.log("Gelen veri:", data);
          this.doctors = Array.isArray(data) ? data : [];
        },
        error: (err) => console.error("Doktorları çekerken hata:", err)
      });
  }
  

  // Doktoru düzenlemek için placeholder (İstersen genişletebilirsin)
  editDoctor(doctor: any): void {
    console.log("Düzenlenecek doktor:", doctor);
  }

  // Doktoru sil
  deleteDoctor(id: number): void {
    if (!confirm("Bu doktoru silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);

    this.http.delete(`http://localhost:5073/api/Doctor/DeleteDoctor/${id}`, { headers })
      .subscribe({
        next: () => {
          this.doctors = this.doctors.filter(d => d.id !== id);
          alert('Doktor silindi!');
        },
        error: (err) => console.error("Silme hatası:", err)
      });
  }

  // Tüm randevuları getir
  getAllAppointments(): void {
    this.http.get<any>('http://localhost:5073/api/Appointment/GetAllAppointments')
      .subscribe({
        next: (response) => {
          this.appointments = response.data || [];
          console.log('Tüm randevular:', response);
        },
        error: (err) => console.error('Randevular alınamadı:', err)
      });
  }

  // ID ile randevu getir
  getAppointmentById(): void {
    if (!this.appointmentIdToFetch) {
      alert('Lütfen bir randevu ID girin.');
      return;
    }

    this.http.get<any>(`http://localhost:5073/api/Appointment/GetAppointmentById/${this.appointmentIdToFetch}`)
      .subscribe({
        next: (response) => {
          console.log('Seçilen randevu:', response.data);
          alert(`Randevu bilgisi konsola yazdırıldı.`);
        },
        error: (err) => console.error('Randevu bulunamadı:', err)
      });
  }

  // Yeni randevu ekle
  addAppointment(): void {
    this.http.post<any>('http://localhost:5073/api/Appointment/AddAppointment', this.newAppointment)
      .subscribe({
        next: (res) => {
          alert('Randevu eklendi!');
          this.getAllAppointments(); // Listeyi güncelle
          this.resetNewAppointment();
        },
        error: (err) => console.error('Ekleme hatası:', err)
      });
  }

  // Randevu güncelle
  updateAppointmentById(): void {
    if (!this.newAppointment.id) {
      alert('Güncelleme için randevu ID girilmelidir.');
      return;
    }

    this.http.put<any>(`http://localhost:5073/api/Appointment/UpdateAppointmentById/${this.newAppointment.id}`, this.newAppointment)
      .subscribe({
        next: () => {
          alert('Randevu güncellendi!');
          this.getAllAppointments();
          this.resetNewAppointment();
        },
        error: (err) => console.error('Güncelleme hatası:', err)
      });
  }


  deleteAppointmentById(id: number): void {
    if (!confirm('Bu randevuyu silmek istiyor musunuz?')) return;

    this.http.delete(`http://localhost:5073/api/Appointment/DeleteAppointmentById/${id}`)
      .subscribe({
        next: () => {
          alert('Randevu silindi!');
          this.appointments = this.appointments.filter(a => a.id !== id);
        },
        error: (err) => console.error('Silme hatası:', err)
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
      doctorId: 0,
      date: '',
      reason: ''
    };
    this.appointmentIdToFetch = null;
  }
}
