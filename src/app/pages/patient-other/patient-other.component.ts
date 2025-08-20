import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Doctor {
  id: number;
  fullName: string;
  specialization?: string;
  phone?: string;
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

interface AppointmentDto {
  id: number;
  doctorId: number;
  patientId: number;
  appointmentDate: string;
  description: string;
}

interface MedicalRecordDto {
  id: number;
  patientId: number;
  recordDate: string;
  description: string;
}

interface ResponseGeneric<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;
}

@Component({
  selector: 'app-patient-other',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-other.component.html',
  styleUrls: ['./patient-other.component.css']
})
export class PatientOtherComponent implements OnInit {
  doctors: Doctor[] = [];
  allAppointments: AppointmentDto[] = [];
  appointments: Appointment[] = [];
  medicalRecords: MedicalRecordDto[] = [];
  editingAppointment: Appointment | null = null;

  selectedDoctorName: string = '';
  selectedDate: string = '';
  selectedTime: string = '';
  timeSlots: string[] = [];
  availableTimeSlots: { time: string; disabled: boolean }[] = [];

  appointment: Appointment = {
    doctorId: 0,
    patientId: Number(localStorage.getItem('patientId')),
    appointmentDate: '',
    description: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generateTimeSlots();
    this.availableTimeSlots = this.timeSlots.map(t => ({ time: t, disabled: false }));
    this.getAllDoctors();
    this.getAllAppointments();
    this.getMyAppointments();
    this.getMyMedicalRecords();
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      this.timeSlots.push(this.formatTime(hour, 0));
      this.timeSlots.push(this.formatTime(hour, 30));
    }
  }

  private formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
  }

  getAllDoctors(): void {
    this.http.get<ResponseGeneric<Doctor[]>>('http://localhost:5073/api/Doctor/GetAllDoctors')
      .subscribe(res => {
        this.doctors = res.data?.map(d => ({
          ...d,
          imageUrl: d.imageFileKey
            ? `http://localhost:5073/api/Upload/GetUserImage/${d.imageFileKey}`
            : 'assets/default-doctor.png'
        })) || [];
      });
  }

  getAllAppointments(): void {
    this.http.get<ResponseGeneric<AppointmentDto[]>>('http://localhost:5073/api/Appointment/GetAllAppointments')
      .subscribe(res => {
        this.allAppointments = res.data || [];
        this.onDateChange();
      });
  }

  getMyAppointments(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return;

    this.http.get<ResponseGeneric<AppointmentDto[]>>(`http://localhost:5073/api/Appointment/GetAppointmentsByPatientId/${patientId}`)
      .subscribe(res => {
        this.appointments = res.data?.map(app => {
          const doctor = this.doctors.find(d => d.id === app.doctorId);
          return { ...app, doctorName: doctor?.fullName || 'Bilinmiyor' };
        }) || [];
      });
  }

  getMyMedicalRecords(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return;

    this.http.get<ResponseGeneric<MedicalRecordDto[]>>(`http://localhost:5073/api/MedicalRecord/GetMedicalRecordsByPatientId/${patientId}`)
      .subscribe(res => {
        this.medicalRecords = res.data || [];
      });
  }

  onDoctorNameChange(): void {
    const selectedDoctor = this.doctors.find(d => d.fullName === this.selectedDoctorName);
    if (!selectedDoctor) {
      this.appointment.doctorId = 0;
      return;
    }
    this.appointment.doctorId = selectedDoctor.id;
    this.selectedTime = '';
    this.selectedDate = '';
    this.onDateChange();
  }

  onDateChange(): void {
    this.availableTimeSlots = this.timeSlots.map(t => ({ time: t, disabled: false }));

    if (!this.selectedDate || !this.appointment.doctorId) return;

    for (let slot of this.availableTimeSlots) {
      const isTaken = this.allAppointments.some(appt => {
        const [date, time] = appt.appointmentDate.split('T');
        return date === this.selectedDate && time.substring(0,5) === slot.time && appt.doctorId === this.appointment.doctorId;
      });
      if (isTaken) slot.disabled = true;
    }
  }

  isTimeSlotAvailable(dateTime: string): boolean {
    return !this.allAppointments.some(app => app.appointmentDate === dateTime && app.doctorId === this.appointment.doctorId);
  }

  onSubmit(): void {
    if (!this.selectedDate || !this.selectedTime) {
      Swal.fire({ icon:'warning', title:'Uyarı', text:'Lütfen tarih ve saat seçin.' });
      return;
    }

    const fullDateTime = `${this.selectedDate}T${this.selectedTime}:00`;

    if (!this.isTimeSlotAvailable(fullDateTime)) {
      Swal.fire({ icon:'error', title:'Dolu Zaman', text:'Seçilen tarih ve saatte randevu zaten alınmış.' });
      return;
    }

    this.appointment.appointmentDate = fullDateTime;

    if (this.editingAppointment) this.updateAppointment();
    else this.addAppointment();
  }

  addAppointment(): void {
    this.http.post('http://localhost:5073/api/Appointment/AddAppointment', this.appointment)
      .subscribe(() => {
        Swal.fire('Başarılı','Randevu oluşturuldu','success');
        this.resetAppointmentForm();
        this.getAllAppointments();
        this.getMyAppointments();
      });
  }

  updateAppointment(): void {
    if (!this.editingAppointment?.id) return;

    this.http.put(`http://localhost:5073/api/Appointment/UpdateAppointmentById/${this.editingAppointment.id}`, this.appointment)
      .subscribe(() => {
        Swal.fire('Başarılı','Randevu güncellendi','success');
        this.editingAppointment = null;
        this.resetAppointmentForm();
        this.getMyAppointments();
      });
  }

  deleteAppointment(appointmentId: number): void {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu randevuyu silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet',
      cancelButtonText: 'Hayır'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:5073/api/Appointment/DeleteAppointmentById/${appointmentId}`)
          .subscribe({
            next: () => {
              Swal.fire('Başarılı', 'Randevu başarıyla silindi.', 'success');
              this.getMyAppointments();
            },
            error: (err) => {
              Swal.fire('Hata', 'Randevu silinirken hata oluştu.', 'error');
            }
          });
      }
    });
  }

  startEditAppointment(app: Appointment): void {
    this.editingAppointment = { ...app };
    this.appointment = { ...app };
    this.selectedDate = app.appointmentDate.split('T')[0];
    this.selectedTime = app.appointmentDate.split('T')[1].substring(0,5);
    this.selectedDoctorName = app.doctorName || '';
    this.onDateChange();
  }

  resetAppointmentForm(): void {
    this.editingAppointment = null;
    this.selectedDoctorName = '';
    this.selectedDate = '';
    this.selectedTime = '';
    this.appointment = {
      doctorId: 0,
      patientId: Number(localStorage.getItem('patientId')),
      appointmentDate: '',
      description: ''
    };
  }

  isDoctorAlreadyBooked(doctorId: number): boolean {
    if (!this.selectedDate) return false;
    return this.allAppointments.some(appt => {
      const [date] = appt.appointmentDate.split('T');
      return appt.doctorId === doctorId && date === this.selectedDate;
    });
  }

  getDiagnosis(description: string): string {
    if (!description) return '';
    const parts = description.split('|');
    const diagnosisPart = parts.find(p => p.trim().startsWith('Tanı:'));
    return diagnosisPart ? diagnosisPart.trim() : description;
  }
}
