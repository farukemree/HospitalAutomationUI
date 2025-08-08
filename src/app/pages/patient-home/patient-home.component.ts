import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ToggleService } from '../../Services/toggle.services';
import { CustomButtonComponent } from "../../shared/custom-button/custom-button.component";
import { ChatboxComponent } from '../../shared/chatbox/chatbox.component';
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
interface ApiResponseWithMessage<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;  // Bu endpoint için backend böyle dönüyor
}


@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatboxComponent],
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.css']
})
export class PatientHomeComponent implements OnInit {
  doctors: Doctor[] = [];
  allAppointments: AppointmentDto[] = [];
  appointments: Appointment[] = [];
  patient: any = null;
  editingAppointment: Appointment | null = null;
  medicalRecords: MedicalRecordDto[] = [];
  editingMedicalRecord: MedicalRecordDto | null = null;
  appointmentsOnSelectedDate: AppointmentDto[] = [];
  availableTimeSlots: { time: string; disabled: boolean }[] = [];
  selectedDepartmentId: number = 0;
  predictedDisease: string | null = null;
  symptomInput: string = '';

  selectedDate: string = '';
  selectedTime: string = '';
  selectedDoctorName: string = '';

  timeSlots: string[] = [];

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

  constructor(private http: HttpClient, private router: Router,private toggleService: ToggleService) {}

  ngOnInit() {
     this.generateTimeSlots();
     this.availableTimeSlots = this.timeSlots.map(t => ({ time: t, disabled: false }));
     this.getPatientInfo();
     this.getAllAppointments();
     this.getAllDoctors();
      this.toggleService.showMedicalRecords$.subscribe(() => {
    this.getMyMedicalRecords(); });
   this.toggleService.showAppointments$.subscribe(() => {
    this.getMyAppointments();});
  }
   predictDisease() {
    if (!this.symptomInput.trim()) {
      alert("Lütfen semptomları giriniz.");
      return;
    }

    this.http.post<any>('http://localhost:5073/api/DiseasePrediction/Predict', {
      symptoms: this.symptomInput
    }).subscribe({
      next: response => {
        this.predictedDisease = response.predictedDisease;
      },
      error: err => {
Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Tahmin yapılırken hata oluştu.'
});
      }
    });
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login'; 
  }
  getDoctorsByDepartmentId(): void {
  if (!this.selectedDepartmentId || this.selectedDepartmentId <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Uyarı',
      text: 'Lütfen geçerli bir departman ID girin.',
      confirmButtonText: 'Tamam'
    });
    return;
  }

this.http.get<ApiResponse>(`http://localhost:5073/api/Doctor/GetDoctorsByDepartmentId/${this.selectedDepartmentId}`)
  .subscribe({
    next: response => {
      if (response.data && response.data.length > 0) {
       

        this.doctors = response.data.map((doctor: any) => {
        

          return {
            ...doctor,
            imageUrl: doctor.imageFileKey
              ? `http://localhost:5073/api/Upload/GetUserImage/${doctor.imageFileKey}`
              : 'assets/default-doctor.png'
          };
        });
      }
    },
    error: err => {
      Swal.fire({
        icon: 'info',
        title: 'Bilgi',
        text: 'Bu departmanda henüz doktor bulunmamaktadır.',
        confirmButtonText: 'Tamam'
      });
      this.doctors = [];
    }
  });

}

  

generateTimeSlots(): void {
  this.timeSlots = []
  const startHour = 9;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    this.timeSlots.push(this.formatTime(hour, 0));   
    this.timeSlots.push(this.formatTime(hour, 30));  
  }
}
private formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}
onDoctorNameChange(): void {
  const selectedDoctor = this.doctors.find(doc => doc.fullName === this.selectedDoctorName);
  if (selectedDoctor) {
    this.appointment.doctorId = selectedDoctor.id;
    this.selectedTime = ''; 
    this.appointment.description = ''; 
    this.selectedDate = ''; 
    this.onDateChange(); 
  } else {
    this.appointment.doctorId = 0;
    console.warn('Doktor bulunamadı');
  }
}


  getPatientInfo(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return;

    this.http.get<any>(`http://localhost:5073/api/Patient/GetPatientById/${patientId}`).subscribe({
      next: res => {
        this.patient = res.data;
      },
      error: err => {
     Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Hasta bilgisi alınamadı: ' + (err.message || err),
  confirmButtonText: 'Tamam'
});
      }
    });
  }
  getAllAppointments(): void {
  this.http.get<ResponseGeneric<AppointmentDto[]>>(`http://localhost:5073/api/Appointment/GetAllAppointments`)
    .subscribe({
      next: response => {
        if (response.isSuccess && response.data) {
          this.allAppointments = response.data;
          this.onDateChange();
        } else {
          this.allAppointments = [];
        }
      },
      error: () => {
        this.allAppointments = [];
      }
    });
}
isDoctorAlreadyBooked(doctorId: number): boolean {
  if (!this.selectedDate) return false; 

  return this.allAppointments.some(appt => {
    const [date] = appt.appointmentDate.split('T');
    return appt.doctorId === doctorId && date === this.selectedDate;
  });
}

onDateChange(): void {
  this.availableTimeSlots = this.timeSlots.map(time => ({
    time,
    disabled: false
  }));

  this.selectedTime = ''; 

  const selectedDateISO = this.selectedDate;
  const selectedDoctorId = this.appointment.doctorId;
  if (!selectedDoctorId) return;

  for (let slot of this.availableTimeSlots) {
    const isSlotTaken = this.allAppointments.some(appt => {
      const [date, time] = appt.appointmentDate.split('T');
      const formattedTime = time.substring(0, 5);
      return (
        date === selectedDateISO &&
        formattedTime === slot.time &&
        appt.doctorId === selectedDoctorId 
      );
    });

    if (isSlotTaken) {
      slot.disabled = true;
    }
  }
}



updateAvailableTimeSlots(): void {
  this.availableTimeSlots = this.timeSlots.map(slot => {
    const isTaken = this.appointmentsOnSelectedDate.some(app => {
      const appTime = app.appointmentDate.substring(11,16);
      return appTime === slot;
    });
    return { time: slot, disabled: isTaken };
  });
}

isTimeSlotAvailable(dateTime: string): boolean {
  return !this.allAppointments.some(app => 
    app.appointmentDate === dateTime && app.doctorId === this.appointment.doctorId
  );
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
        Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Doktorlar yüklenirken hata oluştu: ' + err.message,
  confirmButtonText: 'Tamam'
});

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
        } else {
          Swal.fire({
  icon: 'info',
  title: 'Bilgi',
  text: response.message || 'Henüz tıbbi kayıt bulunmamaktadır.',
  confirmButtonText: 'Tamam'
});

          this.medicalRecords = [];
        }
      },
      error: err => {
        Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Tıbbi kayıtlar yüklenirken hata oluştu.',
  confirmButtonText: 'Tamam'
});

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
  if (!this.selectedDate || !this.selectedTime) {
    Swal.fire({
      icon: 'warning',
      title: 'Uyarı',
      text: 'Lütfen tarih ve saat seçin.',
      confirmButtonText: 'Tamam'
    });
    this.resetAppointmentForm();
    return;
  }

  const fullDateTime = `${this.selectedDate}T${this.selectedTime}:00`;

  if (!this.isTimeSlotAvailable(fullDateTime)) {
    Swal.fire({
      icon: 'error',
      title: 'Dolu Zaman',
      text: 'Seçilen tarih ve saat için başka bir randevu zaten alınmış.',
      confirmButtonText: 'Tamam'
    });
    return;
  }

  this.appointment.appointmentDate = fullDateTime;

  if (this.editingAppointment) {
    this.updateAppointment();
  } else {
    this.addAppointment();
  }
}


 addAppointment(): void {
  if (!this.appointment.doctorId || !this.appointment.appointmentDate) {
    Swal.fire({
      icon: 'warning',
      title: 'Uyarı',
      text: 'Lütfen doktor ve tarih seçin.',
      confirmButtonText: 'Tamam'
    });
    return;
  }

  this.http.post('http://localhost:5073/api/Appointment/AddAppointment', this.appointment).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Randevu başarıyla oluşturuldu.',
        confirmButtonText: 'Tamam'
      });

      this.resetAppointmentForm();
      this.selectedDate = '';
      this.selectedTime = '';
      this.getAllAppointments(); 
      this.onDateChange(); 
      this.getMyAppointments();
     
    },
    error: err => {
      Swal.fire({
        icon: 'error',
        title: 'Hata',
        text: 'Randevu oluşturulurken hata oluştu.',
        confirmButtonText: 'Tamam'
      });
    }
  });
}

  updateAppointment(): void {
    if (!this.editingAppointment || !this.editingAppointment.id) return;

    this.http.put(`http://localhost:5073/api/Appointment/UpdateAppointmentById/${this.editingAppointment.id}`, this.appointment)
      .subscribe({
        next: () => {
          Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Randevu başarıyla güncelendi.',
  confirmButtonText: 'Tamam'
});
          this.editingAppointment = null;
          this.resetAppointmentForm();
          this.getMyAppointments();
        },
        error: err => {
         Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Randevu güncellenirken hata oluştu.',
  confirmButtonText: 'Tamam'
});
        }
      });
  }

  deleteAppointment(appointmentId: number): void {
    if (!confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return;

    this.http.delete(`http://localhost:5073/api/Appointment/DeleteAppointmentById/${appointmentId}`)
      .subscribe({
        next: () => {
         Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Randevu başarıyla silindi.',
  confirmButtonText: 'Tamam'
});
          this.getMyAppointments();
        },
        error: err => {
         Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Randevu silinirken hata oluştu.',
  confirmButtonText: 'Tamam'
});
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
          Swal.fire({
icon: 'info',
title:'Uyarı',
text: response.message || 'Henüz randevunuz yok.',
confirmButtonText:'Tamam'
});
          this.appointments = [];
        }
      },
      error: err => {
       Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Randevular yüklenirken hata oluştu.',
  confirmButtonText: 'Tamam'
});
        this.appointments = [];
      }
    });
}
  
resetAppointmentForm(): void {
   this.selectedDoctorName = '';
    this.appointment = {
      doctorId: 0,
      patientId: Number(localStorage.getItem('patientId')),
      appointmentDate: '',
      description: '',
      id: undefined
    };
  }


}
