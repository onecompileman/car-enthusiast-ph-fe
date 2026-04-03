import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BuildWizardService } from '../../build-wizard.service';
import { TextFilterService } from '../../../../core/services/text-filter.service';

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
    private wizard: BuildWizardService,
    private textFilter: TextFilterService,
  ) {}

  ngOnInit(): void {
    const info = this.wizard.state.info;
    this.form = this.fb.group({
      title: [info.title, [this.textFilter.profanityValidator]],
      year: [info.year, [this.textFilter.profanityValidator]],
      make: [info.make, [this.textFilter.profanityValidator]],
      model: [info.model, [this.textFilter.profanityValidator]],
      summary: [info.summary, [this.textFilter.profanityValidator]],
      approxCost: [info.approxCost, [this.textFilter.profanityValidator]],
    });

    this.form.valueChanges.subscribe((val) => this.wizard.patchInfo(val));
  }

  get tags(): string[] {
    return this.wizard.state.tags;
  }

  isTagsHasProfanity(): boolean {
    return this.tags.some((tag) => this.textFilter.isProfane(tag));
  }

  fC(formControlName: string) {
    return this.form.get(formControlName);
  }

  onTagsChange(tags: string[]): void {
    this.wizard.setTags(tags);
  }
}
