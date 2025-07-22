import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {
  private toggleEditSource = new Subject<void>();
  toggleEdit$ = this.toggleEditSource.asObservable();

  toggleEdit() {
    this.toggleEditSource.next();
  }
}
