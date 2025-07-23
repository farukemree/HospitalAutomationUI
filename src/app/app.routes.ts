import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DoctorPageComponent } from './pages/doctor-page/doctor-page.component';
import { DoctorHomeComponent } from './pages/doctor-home/doctor-home.component'; 
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { PatientHomeComponent } from './pages/patient-home/patient-home.component';
import { DoctorMedicalRecordComponent } from './pages/doctor-medical-record/doctor-medical-record.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'doctor-page', component: DoctorPageComponent },
  { path: 'doctor-home', component: DoctorHomeComponent },
  { path: 'admin-home', component: AdminHomeComponent},
  { path: 'patient-home', component: PatientHomeComponent},
  { path: 'doctor-medical-record', component: DoctorMedicalRecordComponent },
  
];
