import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BuildsCarouselComponent } from './components/builds-carousel/builds-carousel.component';
import { BuildSearchFilterComponent } from './components/build-search-filter/build-search-filter.component';
import { BuildCardComponent } from './components/build-card/build-card.component';
import { BuildHighlightComponent } from './components/build-highlight/build-highlight.component';
import { BuildModCardComponent } from './components/build-mod-card/build-mod-card.component';
import { BuildSectionHeadComponent } from './components/build-section-head/build-section-head.component';
import { PhotoViewerComponent } from './components/photo-viewer/photo-viewer.component';
import { TagInputComponent } from './components/tag-input/tag-input.component';
import { VisualModModalComponent } from './components/visual-mod-modal/visual-mod-modal.component';
import { PerformanceModModalComponent } from './components/performance-mod-modal/performance-mod-modal.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { CarInterestModalComponent } from './components/car-interest-modal/car-interest-modal.component';
import { TermsCommunityModalComponent } from './components/terms-community-modal/terms-community-modal.component';

@NgModule({
  declarations: [
    BuildsCarouselComponent,
    BuildSearchFilterComponent,
    BuildCardComponent,
    BuildHighlightComponent,
    BuildModCardComponent,
    BuildSectionHeadComponent,
    PhotoViewerComponent,
    TagInputComponent,
    VisualModModalComponent,
    PerformanceModModalComponent,
    ConfirmationModalComponent,
    CarInterestModalComponent,
    TermsCommunityModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CarouselModule,
    ModalModule.forRoot(),
  ],
  exports: [
    BuildsCarouselComponent,
    BuildSearchFilterComponent,
    BuildCardComponent,
    BuildHighlightComponent,
    BuildModCardComponent,
    BuildSectionHeadComponent,
    PhotoViewerComponent,
    TagInputComponent,
    VisualModModalComponent,
    PerformanceModModalComponent,
    ConfirmationModalComponent,
    CarInterestModalComponent,
    TermsCommunityModalComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
