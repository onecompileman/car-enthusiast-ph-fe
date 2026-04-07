import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuildWizardService } from '../../build-wizard.service';
import { TextFilterService } from '../../../../core/services/text-filter.service';
import {
  combineLatest,
  debounceTime,
  filter,
  startWith,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { IndexDbService } from '../../../../core/services/index-db.service';
import { BuildInfoForm, BuildWizardState } from '../../build-wizard.model';

@Component({
  selector: 'cap-build-info-step',
  standalone: false,
  templateUrl: './build-info-step.component.html',
  styleUrl: './build-info-step.component.scss',
})
export class BuildInfoStepComponent implements OnInit, OnChanges, OnDestroy {
  @Input() showErrorMessage = false;
  @Output() formChange = new EventEmitter<FormGroup>();

  form!: FormGroup;
  private readonly minYear = 1980;
  private readonly maxYear = new Date().getFullYear() + 1;
  private readonly maxTitleLength = 200;
  private readonly maxTextLength = 80;
  private readonly maxSummaryLength = 800;
  private readonly maxCost = 100000000;

  subscriptions: { [key: string]: Subscription } = {};

  constructor(
    private fb: FormBuilder,
    private wizard: BuildWizardService,
    private textFilter: TextFilterService,
    private indexDb: IndexDbService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showErrorMessage'] && this.showErrorMessage) {
      this.form.markAllAsTouched();
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }

  get tags(): string[] {
    return this.wizard.state.tags;
  }

  isTagsHasProfanity(): boolean {
    return this.tags.some((tag) => this.textFilter.isProfaneCustom(tag));
  }

  fC(formControlName: string) {
    return this.form.get(formControlName);
  }

  fieldError(controlName: string): string {
    const control = this.fC(controlName);
    if (!control || !control.touched || !control.errors) return '';

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['profane']) {
      return 'Inappropriate language detected.';
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters.`;
    }

    if (control.errors['min']) {
      if (controlName === 'year') {
        return `Year must be ${this.minYear} or later.`;
      }
      return `Value must be at least ${control.errors['min'].min}.`;
    }

    if (control.errors['max']) {
      if (controlName === 'year') {
        return `Year must be ${this.maxYear} or earlier.`;
      }
      if (controlName === 'approxCost') {
        return `Approx build cost must not exceed PHP ${this.maxCost.toLocaleString()}.`;
      }
      return `Value must not exceed ${control.errors['max'].max}.`;
    }

    return '';
  }

  onTagsChange(tags: string[]): void {
    this.wizard.setTags(tags);
  }

  private initForm() {
    this.createForm();

    this.subscriptions['formInit'] = combineLatest([
      this.wizard.state$,
      this.indexDb.isDbInitialized,
    ]).subscribe(([state, isDbInitialized]) => {
      if (!isDbInitialized) return;

      const info = state.info;
      this.createForm(info);

      this.formChange.emit(this.form);
      this.listenToFormChanges();

      if (
        info.title ||
        info.year ||
        info.make ||
        info.model ||
        info.summary ||
        info.approxCost
      ) {
        this.form.markAllAsTouched();
      }
    });
  }

  private listenToFormChanges() {
    this.subscriptions['formChanges'] = this.form.valueChanges
      .pipe(debounceTime(300))
      .subscribe((val) => {
        this.wizard.patchInfo(val);
        this.formChange.emit(this.form);
      });
  }

  private createForm(info?: BuildInfoForm) {
    this.form = this.fb.group({
      title: [
        info?.title,
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(this.maxTitleLength),
        ],
      ],
      year: [
        info?.year,
        [
          Validators.required,
          Validators.min(this.minYear),
          Validators.max(this.maxYear),
        ],
      ],
      make: [
        info?.make,
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(this.maxTextLength),
        ],
      ],
      model: [
        info?.model,
        [
          this.textFilter.profanityValidator,
          Validators.required,
          Validators.maxLength(this.maxTextLength),
        ],
      ],
      summary: [
        info?.summary,
        [
          this.textFilter.profanityValidator,
          Validators.maxLength(this.maxSummaryLength),
        ],
      ],
      approxCost: [
        info?.approxCost,
        [Validators.required, Validators.min(0), Validators.max(this.maxCost)],
      ],
    });
  }
}
