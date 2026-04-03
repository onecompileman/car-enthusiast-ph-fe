import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface VisualModModalFormValue {
  name: string;
  part: string;
  description: string;
  shop: string;
  priceEstimate: string;
  imageName: string;
  imageUrl: string;
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
  modImageName = '';
  modImageUrl = '';

  constructor(
    private fb: FormBuilder,
    public bsModalRef: BsModalRef
  ) {
    this.form = this.fb.group({
      name: [''],
      part: [''],
      description: [''],
      shop: [''],
      priceEstimate: [''],
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
    this.modImageName = this.initialMod.imageName;
    this.modImageUrl = this.initialMod.imageUrl;
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !file.type.startsWith('image/')) {
      input.value = '';
      return;
    }

    this.modImageName = file.name;
    this.modImageUrl = URL.createObjectURL(file);
  }

  removeSelectedImage(): void {
    this.modImageName = '';
    this.modImageUrl = '';
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

  save(): void {
    const values: VisualModModalFormValue = {
      name: this.form.value.name?.trim() || 'Untitled Visual Mod',
      part: this.form.value.part?.trim() || 'Unspecified Part',
      description: this.form.value.description?.trim() ?? '',
      shop: this.form.value.shop?.trim() ?? '',
      priceEstimate: this.form.value.priceEstimate?.trim() ?? '',
      imageName: this.modImageName,
      imageUrl: this.modImageUrl,
    };

    this.submitMod.emit({
      mode: this.mode,
      editId: this.editId,
      values,
    });

    this.bsModalRef.hide();
  }
}
