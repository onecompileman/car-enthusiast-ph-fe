import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { BuildListComponent } from './build-list/build-list.component';
import { SharedModule } from '../shared/shared.module';
import { BuildInfoComponent } from './build-info/build-info.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { UserBuildProfileComponent } from './user-build-profile/user-build-profile.component';

@NgModule({
  declarations: [
    PublicComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    BuildListComponent,
    BuildInfoComponent,
    UserBuildProfileComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    SharedModule,
    PopoverModule,
  ],
})
export class PublicModule {}
