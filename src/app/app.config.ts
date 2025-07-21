import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DoctorPageComponent } from './pages/doctor-page/doctor-page.component';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './pages/login/login.component';
import { DoctorHomeComponent } from './pages/doctor-home/doctor-home.component';
import { AdminHomeComponent } from './pages/admin-home/admin-home.component';
import { PatientHomeComponent } from './pages/patient-home/patient-home.component';
import { jwtInterceptor } from '../Helpers/jwt.interceptor';

const routes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'doctor-home', component: DoctorHomeComponent },
  { path: 'doctor-page', component: DoctorPageComponent },
  { path: 'admin-home', component: AdminHomeComponent},
  { path: 'patient-home', component: PatientHomeComponent}
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([jwtInterceptor])), 
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    provideClientHydration(withEventReplay())
  ]
};
