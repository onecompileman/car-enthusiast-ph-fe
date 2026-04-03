import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BuildWizardService } from '../../build-wizard.service';
import {
  RequiredPhoto,
  ValidatedPhoto,
  WizardView,
} from '../../build-wizard.model';
import { ImageFilterService } from '../../../../core/services/image-filter.service';

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
  @Input() showErrorMessage = false;
  @Output() isValidStep = new EventEmitter<boolean>();

  readonly slots: PhotoSlot[] = [
    {
      view: 'front',
      label: 'Front Slant (Required)',
      refHint:
        'Capture 3/4 front with bumper, hood line, and one full side visible.',
      previewPlaceholder:
        'https://placehold.co/600x380/E8E8E8/999?text=Front+Slant+Required',
    },
    {
      view: 'side',
      label: 'Side View (Required)',
      refHint:
        'Keep the car centered and level so wheel fitment and stance are clear.',
      previewPlaceholder:
        'https://placehold.co/600x380/E8E8E8/999?text=Side+View+Required',
    },
    {
      view: 'rear',
      label: 'Rear Slant (Required)',
      refHint:
        'Use 3/4 rear showing diffuser, tail lights, and one side profile.',
      previewPlaceholder:
        'https://placehold.co/600x380/E8E8E8/999?text=Rear+Slant+Required',
    },
  ];

  activeRefHint: WizardView | null = null;
  galleryCapped = false;
  isGalleryDragging = false;

  requiredPhotoMaxSizeMB = 5;
  requiredPhotoMinWidthPx = 1280;
  requiredPhotoMinHeightPx = 600;
  requiredPhotoMinAspectRatio = 1.3;
  requiredPhotoFileTypes = ['image/jpeg'];

  galleryPhotoMaxSizeMB = 5;
  galleryPhotoMinWidthPx = 800;
  galleryPhotoMinHeightPx = 600;
  galleryPhotoMaxAspectRatioX = 3;
  galleryPhotoMaxAspectRatioY = 3;
  galleryPhotoFileTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
  ];

  private requiredPhotoMetaByName = new Map<
    string,
    { width: number; height: number; type: string; sizeMB: number }
  >();
  private galleryPhotoMetaByName = new Map<
    string,
    { width: number; height: number; type: string; sizeMB: number }
  >();

  constructor(
    private wizard: BuildWizardService,
    private imageFilter: ImageFilterService,
  ) {}

  get requiredPhotos() {
    return this.wizard.state.requiredPhotos;
  }

  get gallery() {
    return this.wizard.state.gallery;
  }

  get requiredPhotoRequirementLines(): string[] {
    return [
      'Allowed file types: JPG/JPEG, PNG, WEBP, HEIC',
      `Max file size: ${this.requiredPhotoMaxSizeMB}MB`,
      `Minimum dimensions: ${this.requiredPhotoMinWidthPx}x${this.requiredPhotoMinHeightPx}px`,
    ];
  }

  get galleryRequirementLines(): string[] {
    return [
      'Allowed file types: JPG/JPEG, PNG, WEBP, HEIC',
      `Max file size: ${this.galleryPhotoMaxSizeMB}MB`,
      `Minimum dimensions: ${this.galleryPhotoMinWidthPx}x${this.galleryPhotoMinHeightPx}px`,
    ];
  }

  previewUrl(view: WizardView): string {
    return (
      this.requiredPhotos[view]?.photo.url ??
      this.slots.find((s) => s.view === view)!.previewPlaceholder
    );
  }

  statusText(view: WizardView): string {
    const item = this.requiredPhotos[view];
    if (!item) return 'No image selected';
    if (this.getValidationErrors(item, true).length > 0)
      return `Invalid: ${item.photo.name}`;
    return item.photo.name;
  }

  requiredPhotoErrors(view: WizardView): string[] {
    const item = this.requiredPhotos[view];
    return item ? this.getValidationErrors(item, true) : [];
  }

  galleryPhotoErrors(index: number): string[] {
    const item = this.gallery[index];
    return item ? this.getValidationErrors(item, false) : [];
  }

  async onRequiredPhoto(view: WizardView, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const photo: RequiredPhoto = {
      file,
      blob: file,
      url: URL.createObjectURL(file),
      name: file.name,
    };

    const validation = await this.validateRequiredPhoto(file);
    console.log(validation);
    const image = await this.getFileAsImage(file);
    this.requiredPhotoMetaByName.set(photo.name, {
      width: image.width,
      height: image.height,
      type: file.type,
      sizeMB: file.size / (1024 * 1024),
    });

    this.wizard.setRequiredPhoto(view, {
      photo,
      ...validation,
    });

    this.checkIfValidStep();
  }

  async onGalleryChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    await this.processGalleryFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  onGalleryDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isGalleryDragging = true;
  }

  onGalleryDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isGalleryDragging = false;
  }

  async onGalleryDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isGalleryDragging = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    await this.processGalleryFiles(files);
  }

  removeGalleryItem(index: number): void {
    const item = this.wizard.state.gallery[index];
    if (item) this.galleryPhotoMetaByName.delete(item.photo.name);
    const updated = this.wizard.state.gallery.filter((_, i) => i !== index);
    this.wizard.setGallery(updated);
    this.galleryCapped = false;
  }

  toggleRef(view: WizardView): void {
    this.activeRefHint = this.activeRefHint === view ? null : view;
  }

  private checkIfValidStep(): void {
    const requiredPhotos = this.wizard.state.requiredPhotos;
    let isValid = Object.values(requiredPhotos).every(
      (photo) =>
        photo !== null && this.getValidationErrors(photo, true).length === 0,
    );

    isValid =
      isValid &&
      this.wizard.state.gallery.every(
        (photo) => this.getValidationErrors(photo, false).length === 0,
      );

    this.isValidStep.emit(isValid);
  }

  private async validateRequiredPhoto(file: File): Promise<{
    isCarPhoto: boolean;
    isValidSize: boolean;
    isValidType: boolean;
    isValidDimensions: boolean;
    isValidAspectRatio: boolean;
  }> {
    const validation = {
      isValidSize: true,
      isValidType: true,
      isValidDimensions: true,
      isValidAspectRatio: true,
      isCarPhoto: true,
    };
    const fileSizeMB = file.size / (1024 * 1024);
    const fileType = file.type;

    if (fileSizeMB > this.requiredPhotoMaxSizeMB)
      validation.isValidSize = false;
    if (!this.requiredPhotoFileTypes.includes(fileType))
      validation.isValidType = false;

    const image = await this.getFileAsImage(file);
    const width = image.width;
    const height = image.height;
    const aspectRatio = width / height;

    if (aspectRatio < this.requiredPhotoMinAspectRatio)
      validation.isValidAspectRatio = false;

    if (
      width < this.requiredPhotoMinWidthPx ||
      height < this.requiredPhotoMinHeightPx
    )
      validation.isValidDimensions = false;

    if (validation.isValidType) {
      const isCarPhoto = await this.imageFilter.isCarPhotoAsync(file);
      if (!isCarPhoto) validation.isCarPhoto = false;
    }

    return validation;
  }

  private async validateGalleryPhoto(file: File): Promise<{
    isValidSize: boolean;
    isValidType: boolean;
    isValidDimensions: boolean;
    isValidAspectRatio: boolean;
    isCarPhoto: boolean;
  }> {
    const validation = {
      isValidSize: true,
      isValidType: true,
      isValidDimensions: true,
      isValidAspectRatio: true,
      isCarPhoto: true,
    };
    const fileSizeMB = file.size / (1024 * 1024);
    const fileType = file.type;

    if (fileSizeMB > this.galleryPhotoMaxSizeMB) validation.isValidSize = false;
    if (!this.galleryPhotoFileTypes.includes(fileType))
      validation.isValidType = false;

    const image = await this.getFileAsImage(file);
    const width = image.width;
    const height = image.height;
    const aspectRatioX = width / height;
    const aspectRatioY = height / width;

    if (
      aspectRatioX > this.galleryPhotoMaxAspectRatioX ||
      aspectRatioY > this.galleryPhotoMaxAspectRatioY
    )
      validation.isValidAspectRatio = false;

    if (
      width < this.galleryPhotoMinWidthPx ||
      height < this.galleryPhotoMinHeightPx
    )
      validation.isValidDimensions = false;

    if (validation.isValidType) {
      const isCarPhoto = await this.imageFilter.isCarPhotoAsync(file);
      if (!isCarPhoto) validation.isCarPhoto = false;
    }

    return validation;
  }

  private async getFileAsImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });
  }

  private async processGalleryFiles(files: File[]): Promise<void> {
    files = files.slice(0, 10 - this.wizard.state.gallery.length);

    const cappedFiles = files.slice(0, 10);
    this.galleryCapped = files.length > 10;

    if (this.wizard.state.gallery.length === 10) {
      return;
    }

    const galleryItems$ = cappedFiles.map(async (f) => {
      const photo = {
        file: f,
        blob: f,
        url: URL.createObjectURL(f),
        name: f.name,
      };

      const image = await this.getFileAsImage(f);
      this.galleryPhotoMetaByName.set(photo.name, {
        width: image.width,
        height: image.height,
        type: f.type,
        sizeMB: f.size / (1024 * 1024),
      });

      const validation = await this.validateGalleryPhoto(f);
      return { photo, ...validation };
    });
    const galleryItems = await Promise.all(galleryItems$);

    this.wizard.setGallery(galleryItems);

    this.checkIfValidStep();
  }

  private getValidationErrors(
    item: ValidatedPhoto,
    isRequired: boolean,
  ): string[] {
    const errors: string[] = [];
    const meta = isRequired
      ? this.requiredPhotoMetaByName.get(item.photo.name)
      : this.galleryPhotoMetaByName.get(item.photo.name);

    if (!item.isValidType) {
      if (isRequired) {
        errors.push(
          `Invalid file type (${meta?.type || 'unknown'}). Required photo must be JPEG (.jpg/.jpeg).`,
        );
      } else {
        errors.push(
          `Invalid file type (${meta?.type || 'unknown'}). Allowed: JPG/JPEG, PNG, WEBP, HEIC.`,
        );
      }
    }

    if (!item.isValidSize) {
      const maxSize = isRequired
        ? this.requiredPhotoMaxSizeMB
        : this.galleryPhotoMaxSizeMB;
      errors.push(
        `File is too large (${(meta?.sizeMB ?? 0).toFixed(2)}MB). Max ${maxSize}MB.`,
      );
    }

    if (!item.isValidDimensions) {
      if (isRequired) {
        errors.push(
          `Image is too small (${meta?.width ?? '?'}x${meta?.height ?? '?'}). Minimum ${this.requiredPhotoMinWidthPx}x${this.requiredPhotoMinHeightPx}px.`,
        );
      } else {
        errors.push(
          `Image is too small (${meta?.width ?? '?'}x${meta?.height ?? '?'}). Minimum ${this.galleryPhotoMinWidthPx}x${this.galleryPhotoMinHeightPx}px.`,
        );
      }
    }

    if (!item.isValidAspectRatio) {
      if (isRequired) {
        errors.push(
          `Image aspect ratio is too narrow. Minimum is ${this.requiredPhotoMinAspectRatio}:1 (current ${((meta?.width ?? 0) / Math.max(meta?.height ?? 1, 1) || 0).toFixed(2)}:1).`,
        );
      } else {
        errors.push(
          `Image ratio is out of range. Keep it between about 1:3 and 2:1 (current ${((meta?.width ?? 0) / Math.max(meta?.height ?? 1, 1) || 0).toFixed(2)}:1).`,
        );
      }
    }

    if (!item.isCarPhoto) {
      errors.push('Image does not appear to contain a car.');
    }

    return errors;
  }
}
