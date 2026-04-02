import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BuildWizardService } from '../../build-wizard.service';
import { RequiredPhoto, WizardView } from '../../build-wizard.model';

interface PhotoSlot {
  view: WizardView;
  label: string;
  refHint: string;
  previewPlaceholder: string;
}

@Component({
  selector: 'cap-photos-step',
  standalone: false,
  templateUrl: './photos-step.component.html',
  styleUrl: './photos-step.component.scss',
})
export class PhotosStepComponent {
  readonly slots: PhotoSlot[] = [
    {
      view: 'front',
      label: 'Front Slant (Required)',
      refHint: 'Capture 3/4 front with bumper, hood line, and one full side visible.',
      previewPlaceholder: 'https://placehold.co/600x380/E8E8E8/999?text=Front+Slant+Required',
    },
    {
      view: 'side',
      label: 'Side View (Required)',
      refHint: 'Keep the car centered and level so wheel fitment and stance are clear.',
      previewPlaceholder: 'https://placehold.co/600x380/E8E8E8/999?text=Side+View+Required',
    },
    {
      view: 'rear',
      label: 'Rear Slant (Required)',
      refHint: 'Use 3/4 rear showing diffuser, tail lights, and one side profile.',
      previewPlaceholder: 'https://placehold.co/600x380/E8E8E8/999?text=Rear+Slant+Required',
    },
  ];

  activeRefHint: WizardView | null = null;
  galleryCapped = false;

  constructor(
    private wizard: BuildWizardService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  get requiredPhotos() {
    return this.wizard.state.requiredPhotos;
  }

  get gallery() {
    return this.wizard.state.gallery;
  }

  previewUrl(view: WizardView): string {
    return this.requiredPhotos[view]?.url ?? this.slots.find((s) => s.view === view)!.previewPlaceholder;
  }

  statusText(view: WizardView): string {
    return this.requiredPhotos[view]?.name ?? 'No image selected';
  }

  onRequiredPhoto(view: WizardView, event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const photo: RequiredPhoto = { file, url: URL.createObjectURL(file), name: file.name };
    this.wizard.setRequiredPhoto(view, photo);
  }

  onGalleryChange(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, 10);
    this.galleryCapped = (input.files?.length ?? 0) > 10;
    this.wizard.setGallery(
      files.map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name }))
    );
  }

  toggleRef(view: WizardView): void {
    this.activeRefHint = this.activeRefHint === view ? null : view;
  }
}
