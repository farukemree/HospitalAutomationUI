import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDepartmentsComponent } from './patient-departments.component';

describe('PatientDepartmentsComponent', () => {
  let component: PatientDepartmentsComponent;
  let fixture: ComponentFixture<PatientDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDepartmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
