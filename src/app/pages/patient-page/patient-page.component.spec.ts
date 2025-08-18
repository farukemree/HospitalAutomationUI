import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientChatComponent } from './patient-page.component';

describe('PatientPageComponent', () => {
  let component: PatientChatComponent;
  let fixture: ComponentFixture<PatientChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
