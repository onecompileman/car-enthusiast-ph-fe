import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { BuildWizardService } from '../../build-wizard.service';
import { PerformanceMod } from '../../build-wizard.model';
import {
  PerformanceModModalComponent,
  PerformanceModModalSubmitEvent,
} from '../../../../shared/components/performance-mod-modal/performance-mod-modal.component';

@Component({
  selector: 'cap-performance-step',
  standalone: false,
  templateUrl: './performance-step.component.html',
  styleUrl: './performance-step.component.scss',
})
export class PerformanceStepComponent {
  @Output() statusChange = new EventEmitter<string>();
  private modalRef?: BsModalRef<PerformanceModModalComponent>;

  constructor(
    private wizard: BuildWizardService,
    private modalService: BsModalService
  ) {}

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

  openAddModModal(): void {
    if (this.performanceSkipped) return;

    this.modalRef = this.modalService.show(PerformanceModModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: true,
    });

    const content = this.modalRef.content;
    if (!content) return;

    content.submitMod.pipe(take(1)).subscribe((event) => this.addMod(event));
  }

  addMod(event: PerformanceModModalSubmitEvent): void {
    if (this.performanceSkipped) return;

    const mod: PerformanceMod = {
      id: this.generateId(),
      ...event.values,
    };
    this.wizard.addPerformanceMod(mod);
    this.statusChange.emit('Performance mod added.');
  }

  removeMod(id: string): void {
    this.wizard.removePerformanceMod(id);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
