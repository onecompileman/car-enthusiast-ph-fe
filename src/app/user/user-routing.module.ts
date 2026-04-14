import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddBuildComponent } from './add-build/add-build.component';
import { ProfileComponent } from './profile/profile.component';
import { MyBuildsComponent } from './my-builds/my-builds.component';
import { UserBuildInfoResolver } from '../core/resolvers/user-build-info.resolver';

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'add-build',
    component: AddBuildComponent,
  },
   {
    path: 'edit-build/:buildId',
    component: AddBuildComponent,
    resolve: {
      build: UserBuildInfoResolver,
    }
  },
  {
    path: 'my-builds',
    component: MyBuildsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
