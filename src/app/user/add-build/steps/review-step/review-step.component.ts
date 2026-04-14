import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BuildWizardService } from '../../build-wizard.service';
import { BuildWizardState, WIZARD_VIEWS } from '../../build-wizard.model';
import { BuildService } from '../../../../core/services/build/build.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { BuildStatus } from '../../../../shared/models/build/build.model';
import { Router } from '@angular/router';

@Component({
  selector: 'cap-review-step',
  standalone: false,
  templateUrl: './review-step.component.html',
  styleUrl: './review-step.component.scss',
})
export class ReviewStepComponent {
  @Input() stepsStatus!: {
    num: number;
    label: string;
    sub: string;
    isValid: boolean;
    isTouched: boolean;
    showErrorMessage: boolean;
  }[];
  @Output() statusChange = new EventEmitter<string>();

  saveErrorMessage = '';

  constructor(
    private wizard: BuildWizardService,
    private buildService: BuildService,
    private ngxSpinner: NgxSpinnerService,
    private modalService: BsModalService,
    private router: Router,
  ) {}

  get state(): BuildWizardState {
    return this.wizard.state;
  }

  get buildTitle(): string {
    return this.state.info.title || 'Untitled Build';
  }

  get buildOverview(): string {
    const { title, year, make, model, summary } = this.state.info;
    const titleStr = title || 'Untitled Build';
    const makeModel = `${year || ''} ${make || ''} ${model || ''}`.trim();
    return `${titleStr}${makeModel ? ` (${makeModel})` : ''}. ${summary || 'No summary yet.'}`;
  }

  get photoLines(): string[] {
    return WIZARD_VIEWS.map((view) => {
      const p = this.state.requiredPhotos[view];
      return `${view}: ${p ? p.photo.name : 'Missing required image'}`;
    });
  }

  get modLines(): string[] {
    if (this.state.visualMods.length === 0)
      return ['No visual mods added yet.'];
    return this.state.visualMods.map((mod) => {
      const mapped =
        WIZARD_VIEWS.filter((v) => Boolean(mod.hotspots[v])).join(', ') ||
        'no hotspots yet';
      return `${mod.name} (${mod.part}) — ${mapped}`;
    });
  }

  get perfLines(): string[] {
    if (this.state.performanceSkipped) return ['Performance mods skipped.'];
    if (this.state.performanceMods.length === 0)
      return ['No performance mods added yet.'];
    return this.state.performanceMods.map(
      (m) =>
        `${m.name} — ${m.shop || 'No shop'} — ${m.priceEstimate || 'No estimate'}`,
    );
  }

  get galleryCount(): string {
    return `${this.state.gallery.length} image(s)`;
  }

  get isStepsAllValid(): boolean {
    return this.stepsStatus.every((s) => s.isValid);
  }

  get invalidSteps(): string[] {
    return this.stepsStatus
      .filter((s) => !s.isValid)
      .map((s) => `${s.num}. ${s.label}`);
  }

  saveDraft(): void {
    if (this.isStepsAllValid) {
      this.saveBuild(BuildStatus.Draft).subscribe();
    }
  }

  publish(): void {
    this.confirmPublish(this.saveBuild(BuildStatus.Published));
  }

  private saveBuild(status: BuildStatus): Observable<any> {
    return new Observable((observer) => {
      this.ngxSpinner.show();

      (!this.wizard.isIndexDbPersistenceEnabled
        ? this.buildService.updateBuild(this.wizard.state, status)
        : this.buildService.addBuild(this.wizard.state, status)
      ).subscribe({
        next: async (result) => {
          if (result.success) {
            await this.wizard.resetBuild();

            Swal.fire({
              icon: 'success',
              title:
                status === BuildStatus.Published
                  ? 'Build Submitted for Review!'
                  : 'Build Saved as Draft!',
              text:
                status === BuildStatus.Published
                  ? 'Your build has been submitted for Admin review.'
                  : 'Your build has been saved as a draft.',
            });
            this.router.navigate(['/user/my-builds']);
            this.saveErrorMessage = '';
          } else {
            this.saveErrorMessage =
              result.errors[0] || 'An error occurred while saving.';
          }
          observer.complete();
          this.ngxSpinner.hide();
        },
        error: (err) => {
          this.saveErrorMessage =
            err.message || 'An unexpected error occurred while saving.';
          observer.complete();
          this.ngxSpinner.hide();
        },
      });
    });
  }

  private confirmPublish(callback: Observable<unknown>) {
    const title = 'Confirm Publish';
    const message =
      'Are you sure you want to publish this build? Once published, it will be visible to everyone.';
    const confirmText = 'Yes, publish it!';
    const cancelText = 'No, review again';

    this.modalService.show(ConfirmationModalComponent, {
      class: 'modal-dialog-centered',
      initialState: {
        title,
        message,
        confirmText,
        cancelText,
        confirmCallback: () => callback,
      },
    });
  }
}
