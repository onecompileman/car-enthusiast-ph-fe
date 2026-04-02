import { Component } from '@angular/core';
import { BuildWizardService } from './build-wizard.service';
import { BuildWizardState } from './build-wizard.model';

@Component({
  selector: 'cap-add-build',
  standalone: false,
  templateUrl: './add-build.component.html',
  styleUrl: './add-build.component.scss',
})
export class AddBuildComponent {
  currentStep = 1;
  readonly totalSteps = 5;

  readonly steps = [
    { num: 1, label: 'Build Info', sub: 'Details' },
    { num: 2, label: 'Photos', sub: 'Required views' },
    { num: 3, label: 'Visual Mods', sub: 'Hotspots' },
    { num: 4, label: 'Performance', sub: 'Add or skip' },
    { num: 5, label: 'Review', sub: 'Save / Publish' },
  ];

  statusMessage = '';

  constructor(private wizardService: BuildWizardService) {}

  get state(): BuildWizardState {
    return this.wizardService.state;
  }

  goTo(step: number): void {
    this.currentStep = Math.max(1, Math.min(this.totalSteps, step));
    this.statusMessage = '';
  }

  onNext(): void {
    this.goTo(this.currentStep + 1);
  }

  onPrev(): void {
    this.goTo(this.currentStep - 1);
  }

  onStatusMessage(msg: string): void {
    this.statusMessage = msg;
  }
}
