import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddBuildComponent } from './add-build/add-build.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'add-build',
    component: AddBuildComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
