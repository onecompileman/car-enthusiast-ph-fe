import { Component, OnInit } from '@angular/core';
import { BuildWizardService } from './build-wizard.service';
import type { BuildWizardState } from './build-wizard.model';
import { ImageFilterService } from '../../core/services/image-filter.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Build } from '../../shared/models/build/build.model';

@Component({
  selector: 'cap-add-build',
  standalone: false,
  templateUrl: './add-build.component.html',
  styleUrl: './add-build.component.scss',
})
export class AddBuildComponent implements OnInit {
  currentStep = 1;
  readonly totalSteps = 5;

  steps = [
    {
      num: 1,
      label: 'Build Info',
      sub: 'Details',
      isValid: false,
      isTouched: false,
      showErrorMessage: false,
    },
    {
      num: 2,
      label: 'Photos',
      sub: 'Required views',
      isValid: false,
      isTouched: false,
      showErrorMessage: false,
    },
    {
      num: 3,
      label: 'Visual Mods',
      sub: 'Hotspots',
      isValid: true,
      isTouched: false,
      showErrorMessage: false,
    },
    {
      num: 4,
      label: 'Performance',
      sub: 'Add or skip',
      isValid: true,
      isTouched: false,
      showErrorMessage: false,
    },
    {
      num: 5,
      label: 'Review',
      sub: 'Save / Publish',
      isValid: true,
      isTouched: false,
      showErrorMessage: false,
    },
  ];

  statusMessage = '';
  build: Build | null = null;

  constructor(
    private wizardService: BuildWizardService,
    private imageFilter: ImageFilterService,
    private bsModalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.imageFilter.loadModel();
    this.build = this.route.snapshot.data['build'];

    if (this.build) {
      this.wizardService.setIndexDbPersistenceEnabled(false);
      this.wizardService.loadStateFromBuild(this.build);
    } else {
      this.wizardService.setIndexDbPersistenceEnabled(true);
      this.wizardService.initBuild();
    }
  }

  cancelBuild() {
    const title = 'Cancel Build';
    const message =
      'Are you sure you want to cancel? All progress will be lost.';
    const confirmCallback = () => {
      return this.wizardService.resetBuild();
    };

    this.bsModalService.show(ConfirmationModalComponent, {
      class: 'modal-dialog-centered',
      initialState: { title, message, confirmCallback },
    });
  }

  get state(): BuildWizardState {
    return this.wizardService.state;
  }

  goTo(step: number): void {
    this.currentStep = Math.max(1, Math.min(this.totalSteps, step));
    this.statusMessage = '';
  }

  onNext(): void {
    const isCurrentStepValid = this.steps[this.currentStep - 1].isValid;
    const canBypassPhotosStepValidation = !!this.build && this.currentStep === 2;

    if (isCurrentStepValid || canBypassPhotosStepValidation) {
      this.steps[this.currentStep - 1].showErrorMessage = false;
      this.goTo(this.currentStep + 1);
    } else {
      this.steps[this.currentStep - 1].showErrorMessage = true;
    }
  }

  onPrev(): void {
    this.goTo(this.currentStep - 1);
  }

  onStatusMessage(msg: string): void {
    this.statusMessage = msg;
  }
}
