import { Component, Input, Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fbutton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-button.component.html',
  styleUrl: './custom-button.component.css'
})
export class CustomButtonComponent {
  @Input() label: string = 'FButon';
  @Input() disabled: boolean = false;
  @Input() icon: string = ''; 
  @Output() onClick= new EventEmitter<void>();
  @Input() tooltip: string = '';
  @Input() class: string = '';

handleClick(){
  this.onClick.emit();
}

}
