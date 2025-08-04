import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CustomButtonComponent } from '../../shared/custom-button/custom-button.component';

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
  selectedRecordId: number | null = null;
  medicalRecords: MedicalRecordDto[] = [];
  searchKeyword: string = '';
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
        Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Kayıtlar yüklenirken hata oluştu: ' + res.message,
  confirmButtonText: 'Tamam'
});

        }
      },
      error: (err) => {
        Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Kayıtlar yüklenemedi.',
  confirmButtonText: 'Tamam'
});

      }
    });
  }

 selectRecord(record: MedicalRecordDto): void {
  console.log('Seçilen record id:', record.id);
  this.selectedRecord = { ...record };
  this.selectedRecordId = record.id;
  this.isEditMode = true;
}



get activeRecord() {
  if (this.isEditMode) {
    return this.selectedRecord ?? { patientId: 0, doctorId: 0, recordDate: '', description: '' };
  } else {
    return this.newRecord;
  }
}
searchMedicalRecords(): void {
  if (!this.searchKeyword || this.searchKeyword.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Uyarı',
      text: 'Lütfen anahtar kelime girin.',
      confirmButtonText: 'Tamam'
    });
    return;
  }

  this.http.get<any>(`http://localhost:5073/api/MedicalRecord/SearchMedicalRecords?keyword=${this.searchKeyword}`)
    .subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.medicalRecords = res.data;
          Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Arama sonuçları listelendi.',
            confirmButtonText: 'Tamam'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: res.message,
            confirmButtonText: 'Tamam'
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: 'Arama sırasında hata oluştu.',
          confirmButtonText: 'Tamam'
        });
      }
    });
}



  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedRecord = null;
    this.selectedRecordId = null;
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
      Swal.fire({
  icon: 'warning',
  title: 'Uyarı',
  text: 'Hasta ID ve Tarih zorunludur.',
  confirmButtonText: 'Tamam'
});

      return;
    }
    this.http.post<any>('http://localhost:5073/api/MedicalRecord/AddMedicalRecord', this.newRecord).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Kayıt eklendi',
  confirmButtonText: 'Tamam'
});

          this.loadMedicalRecords();
          this.resetNewRecord();
        } else {
         Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Kayıt eklenirken hata: ' + res.message,
  confirmButtonText: 'Tamam'
});

        }
      },
      error: (err) => {
       Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Kayıt eklenemedi.',
  confirmButtonText: 'Tamam'
});
      }
    });
  }

  updateRecord(): void {
    if (!this.selectedRecord?.id) return;

    this.http.put<any>(`http://localhost:5073/api/MedicalRecord/UpdateMedicalRecordById/${this.selectedRecord.id}`, this.selectedRecord).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          Swal.fire({
  icon: 'success',
  title: 'Başarılı',
  text: 'Kayıt güncellendi',
  confirmButtonText: 'Tamam'
});

          this.loadMedicalRecords();
          this.cancelEdit();
        } else {
          Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Güncelleme hatası: ' + res.message,
  confirmButtonText: 'Tamam'
});

        }
      },
      error: (err) => {
        console.error(err);
      Swal.fire({
  icon: 'error',
  title: 'Hata',
  text: 'Güncelleme başarısız.',
  confirmButtonText: 'Tamam'
});

      }
    });
  }

  deleteRecord(id: number): void {
  Swal.fire({
    title: 'Emin misiniz?',
    text: 'Bu kaydı silmek istediğinize emin misiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Evet, sil',
    cancelButtonText: 'Hayır, iptal'
  }).then((result) => {
    if (result.isConfirmed) {
      this.http.delete<any>(`http://localhost:5073/api/MedicalRecord/DeleteMedicalRecordById/${id}`).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            Swal.fire({
              icon: 'success',
              title: 'Başarılı',
              text: 'Kayıt silindi',
              confirmButtonText: 'Tamam'
            });
            this.loadMedicalRecords();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Hata',
              text: 'Silme hatası: ' + res.message,
              confirmButtonText: 'Tamam'
            });
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Silme işlemi başarısız.',
            confirmButtonText: 'Tamam'
          });
        }
      });
    }
  });
}


}
