import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './Helpers/jwt.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; 

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),  // Eğer bu varsa, provideHttpClient eklemen gerekmeyebilir
    provideHttpClient(withInterceptors([jwtInterceptor])), // Bu satırı ekle
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
