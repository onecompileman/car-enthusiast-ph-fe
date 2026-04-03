import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface PerformanceModModalFormValue {
  name: string;
  priceEstimate: string;
  description: string;
  shop: string;
}

export interface PerformanceModModalSubmitEvent {
  values: PerformanceModModalFormValue;
}

@Component({
  selector: 'cap-performance-mod-modal',
  standalone: false,
  templateUrl: './performance-mod-modal.component.html',
  styleUrl: './performance-mod-modal.component.scss',
})
export class PerformanceModModalComponent {
  @Output() submitMod = new EventEmitter<PerformanceModModalSubmitEvent>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public bsModalRef: BsModalRef
  ) {
    this.form = this.fb.group({
      name: [''],
      priceEstimate: [''],
      description: [''],
      shop: [''],
    });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

  save(): void {
    const values: PerformanceModModalFormValue = {
      name: this.form.value.name?.trim() || 'Untitled Performance Mod',
      priceEstimate: this.form.value.priceEstimate?.trim() ?? '',
      description: this.form.value.description?.trim() ?? '',
      shop: this.form.value.shop?.trim() ?? '',
    };

    this.submitMod.emit({ values });
    this.bsModalRef.hide();
  }
}
