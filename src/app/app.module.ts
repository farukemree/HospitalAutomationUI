import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from './shared/custom-button/custom-button.component';

@NgModule({
  imports: [
    CommonModule,
    CustomButtonComponent // ✅ standalone olduğu için imports içine koyuyoruz
  ],
  exports: [
    CustomButtonComponent // ✅ diğer modüllerde kullanılabilsin diye
  ]
})
export class SharedModule {}
