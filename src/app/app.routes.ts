import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DoctorPageComponent } from './pages/doctor-page/doctor-page.component';
import { DoctorHomeComponent } from './pages/doctor-home/doctor-home.component'; 
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { PatientHomeComponent } from './pages/patient-home/patient-home.component';
import { DoctorMedicalRecordComponent } from './pages/doctor-medical-record/doctor-medical-record.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminDepartmentComponent } from './pages/admin-department/admin-department.component';
import { PatientDepartmentsComponent } from './pages/patient-departments/patient-departments.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { PatientChatComponent } from './pages/patient-page/patient-page.component';
import { DoctorChatComponent } from './pages/doctor-chat/doctor-chat.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'doctor-page', component: DoctorPageComponent },
  { path: 'doctor-home', component: DoctorHomeComponent },
  { path: 'admin-home', component: AdminHomeComponent},
  { path: 'patient-home', component: PatientHomeComponent},
  { path: 'doctor-medical-record', component: DoctorMedicalRecordComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'admin-department', component: AdminDepartmentComponent},
  { path: 'patient-department', component: PatientDepartmentsComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'patient-page', component: PatientChatComponent},
  { path: 'doctor-chat', component: DoctorChatComponent}
];
