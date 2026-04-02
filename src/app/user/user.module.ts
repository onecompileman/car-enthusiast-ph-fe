import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UserRoutingModule } from './user-routing.module';
import { AddBuildComponent } from './add-build/add-build.component';
import { BuildInfoStepComponent } from './add-build/steps/build-info-step/build-info-step.component';
import { PhotosStepComponent } from './add-build/steps/photos-step/photos-step.component';
import { VisualModsStepComponent } from './add-build/steps/visual-mods-step/visual-mods-step.component';
import { PerformanceStepComponent } from './add-build/steps/performance-step/performance-step.component';
import { ReviewStepComponent } from './add-build/steps/review-step/review-step.component';

@NgModule({
  declarations: [
    AddBuildComponent,
    BuildInfoStepComponent,
    PhotosStepComponent,
    VisualModsStepComponent,
    PerformanceStepComponent,
    ReviewStepComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UserRoutingModule],
})
export class UserModule {}
