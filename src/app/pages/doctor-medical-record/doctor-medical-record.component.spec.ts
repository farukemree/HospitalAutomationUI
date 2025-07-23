import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorMedicalRecordComponent } from './doctor-medical-record.component';

describe('DoctorMedicalRecordComponent', () => {
  let component: DoctorMedicalRecordComponent;
  let fixture: ComponentFixture<DoctorMedicalRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorMedicalRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMedicalRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
