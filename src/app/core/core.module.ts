import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, BsDropdownModule, RouterModule],
  declarations: [NavbarComponent],
  exports: [NavbarComponent],
  providers: [],
})
export class CoreModule {
  // Prevent re-import of CoreModule
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
