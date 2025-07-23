import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface MedicalRecordDto {
  id: number;
  patientId: number;
  recordDate: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-doctor-medical-record',
  templateUrl: './doctor-medical-record.component.html',
  styleUrls: ['./doctor-medical-record.component.css'],
  imports: [FormsModule, CommonModule]
})
export class DoctorMedicalRecordComponent implements OnInit {

  medicalRecords: MedicalRecordDto[] = [];
  selectedRecord: MedicalRecordDto | null = null;
  newRecord: Partial<MedicalRecordDto> = {
    patientId: 0,
    recordDate: '',
    description: ''
  };
  isEditMode = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  loadMedicalRecords(): void {
    this.http.get<any>('http://localhost:5073/api/MedicalRecord/GetAllMedicalRecords').subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.medicalRecords = res.data;
        } else {
          alert('Kayıtlar yüklenirken hata oluştu: ' + res.message);
        }
      },
      error: (err) => {
        console.error('API Hatası:', err);
        alert('Kayıtlar yüklenemedi.');
      }
    });
  }

  selectRecord(record: MedicalRecordDto): void {
    this.selectedRecord = { ...record };
    this.isEditMode = true;
  }
get activeRecord() {
  if (this.isEditMode) {
    return this.selectedRecord ?? { patientId: 0, doctorId: 0, recordDate: '', description: '' };
  } else {
    return this.newRecord;
  }
}




  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedRecord = null;
    this.resetNewRecord();
  }

  resetNewRecord(): void {
    this.newRecord = {
      patientId: 0,
      recordDate: '',
      description: ''
    };
  }

  addRecord(): void {
    if (!this.newRecord.patientId || !this.newRecord.recordDate) {
      alert('Hasta ID ve Tarih zorunludur.');
      return;
    }
    this.http.post<any>('http://localhost:5073/api/MedicalRecord/AddMedicalRecord', this.newRecord).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          alert('Kayıt eklendi');
          this.loadMedicalRecords();
          this.resetNewRecord();
        } else {
          alert('Kayıt eklenirken hata: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Kayıt eklenemedi.');
      }
    });
  }

  updateRecord(): void {
    if (!this.selectedRecord?.id) return;

    this.http.put<any>(`http://localhost:5073/api/MedicalRecord/UpdateMedicalRecordById/${this.selectedRecord.id}`, this.selectedRecord).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          alert('Kayıt güncellendi');
          this.loadMedicalRecords();
          this.cancelEdit();
        } else {
          alert('Güncelleme hatası: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Güncelleme başarısız.');
      }
    });
  }

  deleteRecord(id: number): void {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    this.http.delete<any>(`http://localhost:5073/api/MedicalRecord/DeleteMedicalRecordById/${id}`).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          alert('Kayıt silindi');
          this.loadMedicalRecords();
        } else {
          alert('Silme hatası: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Silme işlemi başarısız.');
      }
    });
  }

}
