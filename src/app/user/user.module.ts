import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { AddBuildComponent } from './add-build/add-build.component';
import { BuildInfoStepComponent } from './add-build/steps/build-info-step/build-info-step.component';
import { VisualModsStepComponent } from './add-build/steps/visual-mods-step/visual-mods-step.component';
import { VisualModItemComponent } from './add-build/steps/visual-mods-step/visual-mod-item/visual-mod-item.component';
import { PerformanceStepComponent } from './add-build/steps/performance-step/performance-step.component';
import { PhotosStepComponent } from './add-build/steps/photos-step/photos-step.component';
import { ReviewStepComponent } from './add-build/steps/review-step/review-step.component';
import { provideHttpClient } from '@angular/common/http';
import { ProfileComponent } from './profile/profile.component';
import { MyBuildsComponent } from './my-builds/my-builds.component';

@NgModule({
  declarations: [
    AddBuildComponent,
    BuildInfoStepComponent,
    PerformanceStepComponent,
    VisualModsStepComponent,
    VisualModItemComponent,
    PhotosStepComponent,
    ReviewStepComponent,
    ProfileComponent,
    MyBuildsComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, UserRoutingModule],
  providers: [provideHttpClient()],
})
export class UserModule {}
