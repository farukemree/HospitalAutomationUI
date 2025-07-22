import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  id: number;
  fullName: string;
  specialization: string;
  phone: string;
  departmentId: number;
  imageFileKey?: string;
  imageUrl?: string; 
}

interface Appointment {
  doctorId: number;
  id?: number;
  patientId: number;
  appointmentDate: string;
  description: string;
  doctorName?: string;  // frontend’de isim göstermek için
}

interface AppointmentResponse {
  data: Appointment[];
  isSuccess: boolean;
  message: string;
}

interface ApiResponse {
  data: Doctor[];
}

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.css']
})
export class PatientHomeComponent implements OnInit {
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];

  appointment: Appointment = {
    doctorId: 0,
    patientId: Number(localStorage.getItem('patientId')),
    appointmentDate: '',
    description: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    
    
  }

  getAllDoctors(): void {
  this.http.get<ApiResponse>('http://localhost:5073/api/Doctor/GetAllDoctors').subscribe({
    next: response => {
      this.doctors = response.data.map((doctor: any) => {
        return {
          ...doctor,
          imageUrl: doctor.imageFileKey
            ? `http://localhost:5073/api/Upload/GetUserImage/${doctor.imageFileKey}`
            : 'assets/default-doctor.png'   
        };
      });
    },
    error: err => {
      alert('Doktorlar yüklenirken hata oluştu: ' + err.message);
    }
  });
}


  addAppointment(): void {
    if (!this.appointment.doctorId || !this.appointment.appointmentDate) {
      alert('Lütfen doktor ve tarih seçin.');
      return;
    }

    this.http.post('http://localhost:5073/api/Appointment/AddAppointment', this.appointment).subscribe({
      next: () => {
        alert('Randevu başarıyla oluşturuldu.');
        this.appointment.appointmentDate = '';
        this.appointment.description = '';
        this.appointment.doctorId = 0;
        this.getMyAppointments();  // randevuları güncelle
      },
      error: err => {
        alert('Randevu oluşturulurken hata oluştu.');
      }
    });
  }

  getMyAppointments(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return;

    this.http.get<AppointmentResponse>(`http://localhost:5073/api/Appointment/GetAppointmentsByPatientId/${patientId}`).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.appointments = response.data.map(app => {
            const doctor = this.doctors.find(d => d.id === app.doctorId);
            return {
              ...app,
              doctorName: doctor ? doctor.fullName : 'Bilinmiyor'
            };
          });
        } else {
          alert('Randevular alınamadı: ' + response.message);
        }
      },
      error: err => {
        alert('Randevular yüklenirken hata oluştu.');
      }
    });
  }
}
