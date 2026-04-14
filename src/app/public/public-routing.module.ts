import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from './public.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { BuildListComponent } from './build-list/build-list.component';
import { BuildInfoComponent } from '../shared/components/build-info/build-info.component';
import { UserBuildProfileComponent } from './user-build-profile/user-build-profile.component';
import { NotFoundComponent } from '../shared/components/not-found/not-found.component';
import { CanAccessLoginRegisterGuard } from '../core/guards/can-access-login-register.guard';
import { BuildPublicInfoResolver } from '../core/resolvers/build-public-info.resolver';

const routes: Routes = [{
  path: '',
  component: PublicComponent,
  children: [
    {
      path: '',
      component: HomeComponent,
    },
    {
      path: 'register',
      component: RegisterComponent,
      canActivate: [CanAccessLoginRegisterGuard]
    },
    {
      path: 'login',
      component: LoginComponent,
      canActivate: [CanAccessLoginRegisterGuard]
    },
    {
      path: 'browse-builds',
      component: BuildListComponent
    },
    {
      path: 'build-info/:buildId',
      component: BuildInfoComponent,
      resolve: {
        build: BuildPublicInfoResolver,
      },
    },
    {
      path: 'build-share',
      component: BuildInfoComponent
    },
    {
      path: 'user-build-profile',
      component: UserBuildProfileComponent
    },
 
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
