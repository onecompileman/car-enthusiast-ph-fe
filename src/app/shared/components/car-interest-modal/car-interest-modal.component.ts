    import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

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

  get useManualEntry(): boolean {
    return this.form.get('useManualEntry')?.value ?? false;
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    this.submitted.emit();
  }
}
