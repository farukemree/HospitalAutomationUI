import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from './custom-button/custom-button.component';

@NgModule({
  imports: [
    CommonModule,
    CustomButtonComponent // ✅ standalone component bu şekilde eklenir
  ],
  exports: [
    CustomButtonComponent // ✅ başka modüllerde kullanılabilsin diye
  ]
})
export class SharedModule {}
