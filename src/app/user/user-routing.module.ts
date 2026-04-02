import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddBuildComponent } from './add-build/add-build.component';

const routes: Routes = [
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
