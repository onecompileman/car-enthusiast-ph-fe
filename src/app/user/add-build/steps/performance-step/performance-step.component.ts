import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BuildWizardService } from '../../build-wizard.service';
import { PerformanceMod } from '../../build-wizard.model';

@Component({
  selector: 'cap-performance-step',
  standalone: false,
  templateUrl: './performance-step.component.html',
  styleUrl: './performance-step.component.scss',
})
export class PerformanceStepComponent implements OnInit {
  @Output() statusChange = new EventEmitter<string>();

  perfForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wizard: BuildWizardService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.perfForm = this.fb.group({
      name: [''],
      priceEstimate: [''],
      description: [''],
      shop: [''],
    });
  }

  get performanceMods(): PerformanceMod[] {
    return this.wizard.state.performanceMods;
  }

  get performanceSkipped(): boolean {
    return this.wizard.state.performanceSkipped;
  }

  onSkipChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.wizard.setPerformanceSkipped(checked);
    this.statusChange.emit(checked ? 'Performance mods skipped.' : '');
  }

  addMod(): void {
    if (this.performanceSkipped) return;
    const { name, priceEstimate, description, shop } = this.perfForm.value;
    const mod: PerformanceMod = {
      id: this.generateId(),
      name: name?.trim() || 'Untitled Performance Mod',
      priceEstimate: priceEstimate?.trim() ?? '',
      description: description?.trim() ?? '',
      shop: shop?.trim() ?? '',
    };
    this.wizard.addPerformanceMod(mod);
    this.perfForm.reset();
  }

  removeMod(id: string): void {
    this.wizard.removePerformanceMod(id);
  }

  private generateId(): string {
    if (isPlatformBrowser(this.platformId) && typeof crypto?.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
  }
}
