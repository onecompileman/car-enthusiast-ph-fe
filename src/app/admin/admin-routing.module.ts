import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminBuildsComponent } from './builds/admin-builds.component';
import { BuildInfoComponent } from '../shared/components/build-info/build-info.component';
import { AdminBuildInfoResolver } from '../core/resolvers/admin-build-info.resolver';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'builds',
        pathMatch: 'full',
      },
      {
        path: 'builds',
        component: AdminBuildsComponent,
      },
      {
        path: 'build/:buildId',
        component: BuildInfoComponent,
        resolve: {
            build: AdminBuildInfoResolver,
        }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
