import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  doctorName?: string; 
}
interface ResponseGeneric<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;
}

interface AppointmentDto {
  id: number;
  appointmentDate: string;
  patientId: number;
  doctorId: number;
  description: string;
}
interface MedicalRecordDto {
  id: number;
  patientId: number;
  recordDate: string;
  description: string;
}

interface AppointmentListDto {
  data: AppointmentDto[] | null;
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
  patient: any = null;
  editingAppointment: Appointment | null = null;
  medicalRecords: MedicalRecordDto[] = [];
  editingMedicalRecord: MedicalRecordDto | null = null;

  medicalRecordForm: { id?: number, patientId: number, recordDate: string, description: string } = {
  patientId: Number(localStorage.getItem('patientId')),
  recordDate: '',
  description: ''
  
};


  appointment: Appointment = {
    doctorId: 0,
    patientId: Number(localStorage.getItem('patientId')),
    appointmentDate: '',
    description: '',
    id: undefined
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.getPatientInfo();
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login'; 
  }

  getPatientInfo(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return;

    this.http.get<any>(`http://localhost:5073/api/Patient/GetPatientById/${patientId}`).subscribe({
      next: res => {
        this.patient = res.data;
      },
      error: err => {
        console.error('Hasta bilgisi alınamadı:', err);
      }
    });
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
getDiagnosis(description: string): string {
  if (!description) return '';
  const parts = description.split('|');
  const diagnosisPart = parts.find(p => p.trim().startsWith('Tanı:'));
  return diagnosisPart ? diagnosisPart.trim() : description;
}

 getMyMedicalRecords(): void {
  const patientId = localStorage.getItem('patientId');
  if (!patientId) return;

  this.http.get<ResponseGeneric<MedicalRecordDto[]>>(`http://localhost:5073/api/MedicalRecord/GetMedicalRecordsByPatientId/${patientId}`)
    .subscribe({
      next: response => {
        if (response.isSuccess && response.data && response.data.length > 0) {
          this.medicalRecords = response.data;
          console.log(response.data)
        } else {
          alert(response.message || 'Henüz tıbbi kayıt bulunmamaktadır.');
          this.medicalRecords = [];
        }
      },
      error: err => {
        alert('Tıbbi kayıtlar yüklenirken hata oluştu.');
        this.medicalRecords = [];
      }
    });
}


  startEditAppointment(app: Appointment): void {
    this.editingAppointment = { ...app };

    this.appointment = {
      doctorId: this.editingAppointment.doctorId,
      patientId: this.editingAppointment.patientId,
      appointmentDate: this.editingAppointment.appointmentDate,
      description: this.editingAppointment.description,
      id: this.editingAppointment.id
    };
  }

  onSubmit(): void {
    if (this.editingAppointment) {
      this.updateAppointment();
    } else {
      this.addAppointment();
    }
  }

  addAppointment(): void {
    if (!this.appointment.doctorId || !this.appointment.appointmentDate) {
      alert('Lütfen doktor ve tarih seçin.');
      return;
    }

    this.http.post('http://localhost:5073/api/Appointment/AddAppointment', this.appointment).subscribe({
      next: () => {
        alert('Randevu başarıyla oluşturuldu.');
        this.resetAppointmentForm();
        this.getMyAppointments();
      },
      error: err => {
        alert('Randevu oluşturulurken hata oluştu.');
      }
    });
  }

  updateAppointment(): void {
    if (!this.editingAppointment || !this.editingAppointment.id) return;

    this.http.put(`http://localhost:5073/api/Appointment/UpdateAppointmentById/${this.editingAppointment.id}`, this.appointment)
      .subscribe({
        next: () => {
          alert('Randevu başarıyla güncellendi.');
          this.editingAppointment = null;
          this.resetAppointmentForm();
          this.getMyAppointments();
        },
        error: err => {
          alert('Randevu güncellenirken hata oluştu.');
        }
      });
  }

  deleteAppointment(appointmentId: number): void {
    if (!confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return;

    this.http.delete(`http://localhost:5073/api/Appointment/DeleteAppointmentById/${appointmentId}`)
      .subscribe({
        next: () => {
          alert('Randevu başarıyla silindi.');
          this.getMyAppointments();
        },
        error: err => {
          alert('Randevu silinirken hata oluştu.');
        }
      });
  }

getMyAppointments(): void {
  const patientId = localStorage.getItem('patientId');
  if (!patientId) return;

  this.http.get<ResponseGeneric<AppointmentDto[]>>(`http://localhost:5073/api/Appointment/GetAppointmentsByPatientId/${patientId}`)
    .subscribe({
      next: response => {
        if (response.isSuccess && response.data && response.data.length > 0) {
          this.appointments = response.data.map(app => {
            const doctor = this.doctors.find(d => d.id === app.doctorId);
            return {
              ...app,
              doctorName: doctor ? doctor.fullName : 'Bilinmiyor'
            };
          });
        } else {
          alert(response.message || 'Henüz randevunuz yok.');
          this.appointments = [];
        }
      },
      error: err => {
        alert('Randevular yüklenirken hata oluştu.');
        this.appointments = [];
      }
    });
}
  resetAppointmentForm(): void {
    this.appointment = {
      doctorId: 0,
      patientId: Number(localStorage.getItem('patientId')),
      appointmentDate: '',
      description: '',
      id: undefined
    };
  }


}
