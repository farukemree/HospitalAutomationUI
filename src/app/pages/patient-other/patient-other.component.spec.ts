import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOtherComponent } from './patient-other.component';

describe('PatientOtherComponent', () => {
  let component: PatientOtherComponent;
  let fixture: ComponentFixture<PatientOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientOtherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
