    import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
  import { TextFilterService } from '../../../core/services/text-filter.service';

export interface CarInterestOption {
  make: string;
  models: string[];
}

@Component({
  selector: 'cap-car-interest-modal',
  standalone: false,
  templateUrl: './car-interest-modal.component.html',
  styleUrl: './car-interest-modal.component.scss',
})
export class CarInterestModalComponent {
  @Input() isOpen = false;
  @Input({ required: true }) form!: FormGroup;
  @Input() carOptions: CarInterestOption[] = [];
  @Input() availableModels: string[] = [];
  @Input() errorMessage: string | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  localErrorMessage: string | null = null;
  private readonly textFilterService = inject(TextFilterService);

  get useManualEntry(): boolean {
    return this.form.get('useManualEntry')?.value ?? false;
  }

  get displayErrorMessage(): string | null {
    return this.localErrorMessage || this.errorMessage;
  }

  close(): void {
    this.localErrorMessage = null;
    this.closed.emit();
  }

  submit(): void {
    this.localErrorMessage = null;

    if (this.useManualEntry) {
      const manualMake = this.form.get('manualMake')?.value?.trim() || '';
      const manualModel = this.form.get('manualModel')?.value?.trim() || '';

      if (
        this.textFilterService.isProfane(manualMake) ||
        this.textFilterService.isProfaneCustom(manualMake) ||
        this.textFilterService.isProfane(manualModel) ||
        this.textFilterService.isProfaneCustom(manualModel)
      ) {
        this.localErrorMessage = 'Please remove inappropriate words from make/model.';
        return;
      }
    }

    this.submitted.emit();
  }
}
