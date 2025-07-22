import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';  
import { ToggleService } from './Services/toggle.services';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],  // CommonModule eklendi
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  showDoctorButtons = false;
  title = 'hospital-frontend-angular';

  constructor(private router: Router,private toggleService: ToggleService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showDoctorButtons = event.urlAfterRedirects.startsWith('/doctor-home');
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

goToSettings() {
  this.toggleService.toggleEdit();
  this.router.navigate(['/doctor-home']);
}

}
