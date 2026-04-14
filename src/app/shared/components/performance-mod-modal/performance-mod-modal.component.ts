import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TextFilterService } from '../../../core/services/text-filter.service';

interface PerformanceModGroup {
  group: string;
  mods: string[];
}

export interface PerformanceModModalFormValue {
  name: string;
  part: string;
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
export class PerformanceModModalComponent implements OnInit {
  @Output() submitMod = new EventEmitter<PerformanceModModalSubmitEvent>();

  form: FormGroup;
  performanceModGroups: PerformanceModGroup[] = [];

  constructor(
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    private http: HttpClient,
    private textFilter: TextFilterService,
  ) {
    this.form = this.fb.group({
      name: ['', [this.textFilter.profanityValidator, Validators.required, Validators.maxLength(100)]],
      part: ['', [Validators.required]],
      priceEstimate: ['', [this.textFilter.profanityValidator, Validators.maxLength(50)]],
      description: ['', [this.textFilter.profanityValidator, Validators.maxLength(500)]],
      shop: ['', [this.textFilter.profanityValidator, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.http.get<{ performanceMods: PerformanceModGroup[] }>('json/mod-types.json').subscribe({
      next: (data) => { this.performanceModGroups = data?.performanceMods || []; },
      error: () => { this.performanceModGroups = []; },
    });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const values: PerformanceModModalFormValue = {
      name: this.form.value.name?.trim() || 'Untitled Performance Mod',
      part: this.form.value.part?.trim() || 'Unspecified Part',
      priceEstimate: this.form.value.priceEstimate?.trim() ?? '',
      description: this.form.value.description?.trim() ?? '',
      shop: this.form.value.shop?.trim() ?? '',
    };

    this.submitMod.emit({ values });
    this.bsModalRef.hide();
  }

  fieldError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['required']) return 'This field is required.';
    if (control.errors['profane']) return 'Inappropriate language detected.';
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters.`;
    return '';
  }
}
