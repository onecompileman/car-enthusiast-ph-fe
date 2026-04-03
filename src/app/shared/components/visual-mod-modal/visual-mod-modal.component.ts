import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TextFilterService } from '../../../core/services/text-filter.service';
import { RequiredPhoto } from '../../../user/add-build/build-wizard.model';

export interface VisualModModalFormValue {
  name: string;
  part: string;
  description: string;
  shop: string;
  priceEstimate: string;
  photo: RequiredPhoto | null;
}

export interface VisualModModalEditValue extends VisualModModalFormValue {
  id: string;
}

export interface VisualModModalSubmitEvent {
  mode: 'create' | 'edit';
  editId: string | null;
  values: VisualModModalFormValue;
}

@Component({
  selector: 'cap-visual-mod-modal',
  standalone: false,
  templateUrl: './visual-mod-modal.component.html',
  styleUrl: './visual-mod-modal.component.scss',
})
export class VisualModModalComponent implements OnInit {
  @Output() submitMod = new EventEmitter<VisualModModalSubmitEvent>();

  mode: 'create' | 'edit' = 'create';
  editId: string | null = null;
  initialMod: VisualModModalEditValue | null = null;
  form: FormGroup;
  modImageFile: File | null = null;
  modImageName = '';
  modImageUrl = '';

  maxFileSizeMB = 5;
  imageTypesAllowed = ['image/png', 'image/jpeg', 'image/webp', 'image/heic'];
  imageErrorMessage = '';

  constructor(
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private textFilter: TextFilterService,
  ) {
    this.form = this.fb.group({
      name: [
        '',
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
      part: [
        '',
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [this.textFilter.profanityValidator, Validators.maxLength(500)],
      ],
      shop: [
        '',
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(100),
        ],
      ],
      priceEstimate: [
        '',
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
    });
  }

  ngOnInit(): void {
    if (!this.initialMod) {
      return;
    }

    this.mode = 'edit';
    this.editId = this.initialMod.id;
    this.form.patchValue({
      name: this.initialMod.name,
      part: this.initialMod.part,
      description: this.initialMod.description,
      shop: this.initialMod.shop,
      priceEstimate: this.initialMod.priceEstimate,
    });
    if (this.initialMod.photo) {
      this.modImageFile = this.initialMod.photo.file;
      this.modImageName = this.initialMod.photo.name;
      this.modImageUrl = this.initialMod.photo.url;
    }
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageErrorMessage = '';

    if (!file) {
      return;
    }

    if (!this.imageTypesAllowed.includes(file.type)) {
      this.imageErrorMessage =
        'Unsupported file type. Please upload a PNG, JPG, WEBP, or HEIC image.';
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.maxFileSizeMB) {
      this.imageErrorMessage = `File size exceeds the maximum limit of ${this.maxFileSizeMB} MB.`;
      return;
    }

    if (!file || !file.type.startsWith('image/')) {
      this.imageErrorMessage =
        'Invalid file type. Please upload an image file.';

      return;
    }

    this.modImageFile = file;
    this.modImageName = file.name;
    this.modImageUrl = URL.createObjectURL(file);
  }

  removeSelectedImage(): void {
    try {
      URL.revokeObjectURL(this.modImageUrl);
    } catch (error) {
      console.error('Error revoking object URL:', error);
    }

    this.modImageFile = null;
    this.modImageName = '';
    this.modImageUrl = '';
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !!this.imageErrorMessage) {
      return;
    }

    const values: VisualModModalFormValue = {
      name: this.form.value.name?.trim() || 'Untitled Visual Mod',
      part: this.form.value.part?.trim() || 'Unspecified Part',
      description: this.form.value.description?.trim() ?? '',
      shop: this.form.value.shop?.trim() ?? '',
      priceEstimate: this.form.value.priceEstimate?.trim() ?? '',
      photo: this.modImageFile
        ? {
            file: this.modImageFile,
            blob: this.modImageFile,
            url: this.modImageUrl,
            name: this.modImageName,
          }
        : null,
    };

    this.submitMod.emit({
      mode: this.mode,
      editId: this.editId,
      values,
    });

    this.bsModalRef.hide();
  }

  fieldError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['profane']) {
      return 'Inappropriate language detected.';
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters.`;
    }

    return '';
  }
}
