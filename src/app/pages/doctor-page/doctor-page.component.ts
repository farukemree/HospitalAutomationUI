import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
    alert('Doktor bilgisi bulunamadı, işlem yapılamıyor.');
    return;
  }

  this.newAppointment.doctorId = this.doctorId;

  this.http.post<any>('http://localhost:5073/api/Appointment/AddAppointment', this.newAppointment)
    .subscribe({
      next: (res) => {
        alert('Randevu eklendi!');
        this.getAppointments();
        this.resetNewAppointment();
      },
      error: (err) => console.error('Ekleme hatası:', err)
    });
}




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
  
  editDoctor(doctor: any): void {
    console.log("Düzenlenecek doktor:", doctor);
  }

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
  getAppointments(): void {
    if (!this.doctorId) {
    console.warn('doctorId bulunamadı, randevular getirilmedi.');
    return;
  }
  this.http.get<any>(`http://localhost:5073/api/Appointment/GetAppointmentsByDoctorId/${this.doctorId}`)

    .subscribe({
      next: (response) => {
        if(response.isSuccess) {
          this.appointments = response.data;
        } else {
          console.error('Hata:', response.message);
        }
      },
      error: (err) => console.error('API çağrısı hata:', err)
    });
}


  getAppointmentById(): void {
  if (!this.appointmentIdToFetch) {
    alert('Lütfen bir randevu ID girin.');
    return;
  }

  this.http.get<any>(`http://localhost:5073/api/Appointment/GetAppointmentById/${this.appointmentIdToFetch}`)
    .subscribe({
      next: (response) => {
        this.selectedAppointment = response.data; 
        this.appointmentIdToFetch = null;  // input temizle
      },
      error: (err) => {
        console.error('Randevu bulunamadı:', err);
        alert('Randevu bulunamadı.');
      }
    });
}
  closeAppointmentDetails(): void {
  this.selectedAppointment = null;
}
 

  updateAppointmentById(): void {
    if (!this.newAppointment.id) {
      alert('Güncelleme için randevu ID girilmelidir.');
      return;
    }

    this.http.put<any>(`http://localhost:5073/api/Appointment/UpdateAppointmentById/${this.newAppointment.id}`, this.newAppointment)
      .subscribe({
        next: () => {
          alert('Randevu güncellendi!');
          this.getAppointments();
          this.resetNewAppointment();
        },
        error: (err) => console.error('Güncelleme hatası:', err)
      });
  }


  deleteAppointmentById(id: number): void {
    if (id === undefined) {
    console.error('Randevu ID si undefined, silme işlemi iptal edildi.');
    return;
  }
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
      doctorId: this.doctorId || 0,
      appointmentDate: '',
      description: ''
    };
    this.appointmentIdToFetch = null;
  }
}
