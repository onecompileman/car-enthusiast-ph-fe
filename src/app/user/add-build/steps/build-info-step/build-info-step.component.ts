import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BuildWizardService } from '../../build-wizard.service';

@Component({
  selector: 'cap-build-info-step',
  standalone: false,
  templateUrl: './build-info-step.component.html',
  styleUrl: './build-info-step.component.scss',
})
export class BuildInfoStepComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wizard: BuildWizardService
  ) {}

  ngOnInit(): void {
    const info = this.wizard.state.info;
    this.form = this.fb.group({
      title: [info.title],
      year: [info.year],
      make: [info.make],
      model: [info.model],
      summary: [info.summary],
      approxCost: [info.approxCost],
    });

    this.form.valueChanges.subscribe((val) => this.wizard.patchInfo(val));
  }
}
