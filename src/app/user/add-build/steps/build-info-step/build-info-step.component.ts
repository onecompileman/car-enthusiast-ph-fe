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
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuildWizardService } from '../../build-wizard.service';
import { TextFilterService } from '../../../../core/services/text-filter.service';
import { combineLatest, debounceTime, startWith, Subscription } from 'rxjs';
import { IndexDbService } from '../../../../core/services/index-db.service';
import { BuildInfoForm, BuildWizardState } from '../../build-wizard.model';

interface CarOption {
  make: string;
  models: string[];
}

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
  carOptions: CarOption[] = [];
  availableModels: string[] = [];
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
    private http: HttpClient,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showErrorMessage'] && this.showErrorMessage) {
      this.form.markAllAsTouched();
    }
  }

  ngOnInit(): void {
    this.loadCarOptions();
    this.initForm();
  }

  ngOnDestroy(): void {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }

  get tags(): string[] {
    return this.wizard.state.tags;
  }

  get useManualEntry(): boolean {
    return !!this.fC('useManualEntry')?.value;
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

  setCarEntryMode(useManualEntry: boolean): void {
    if (this.useManualEntry === useManualEntry) {
      return;
    }

    this.fC('useManualEntry')?.patchValue(useManualEntry);

    if (!useManualEntry) {
      this.syncAvailableModels();
      this.clearInvalidSelectedCar();
    }
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
  this.reconcileCarEntryMode(info);

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
    this.subscriptions['formChanges']?.unsubscribe();
    this.subscriptions['carFieldChanges']?.unsubscribe();

    this.subscriptions['carFieldChanges'] = combineLatest([
      this.fC('useManualEntry')!.valueChanges.pipe(
        startWith(this.fC('useManualEntry')!.value),
      ),
      this.fC('make')!.valueChanges.pipe(startWith(this.fC('make')!.value)),
    ]).subscribe(([useManualEntry]) => {
      if (useManualEntry) {
        this.syncAvailableModels();
        return;
      }

      this.syncAvailableModels();
      this.clearInvalidSelectedCar();
    });

    this.subscriptions['formChanges'] = this.form.valueChanges
      .pipe(debounceTime(300))
      .subscribe((val) => {
        this.wizard.patchInfo({
          title: val.title,
          year: val.year,
          make: val.make,
          model: val.model,
          summary: val.summary,
          approxCost: val.approxCost,
          useManualEntry: val.useManualEntry,
        });
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
      useManualEntry: [info?.useManualEntry ?? false],
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

  private loadCarOptions(): void {
    this.subscriptions['carOptions'] = this.http
      .get<CarOption[]>('json/cars.json')
      .subscribe({
        next: (cars) => {
          this.carOptions = cars || [];
          this.reconcileCarEntryMode(this.form?.value);
        },
        error: () => {
          this.carOptions = [];
          this.availableModels = [];
          this.fC('useManualEntry')?.patchValue(true, { emitEvent: false });
        },
      });
  }

  private reconcileCarEntryMode(info?: Partial<BuildInfoForm>): void {
    if (!this.form) {
      return;
    }

    if (!this.carOptions.length) {
      this.availableModels = [];
      this.fC('useManualEntry')?.patchValue(true, { emitEvent: false });
      return;
    }

    const make = `${info?.make ?? this.fC('make')?.value ?? ''}`.trim();
    const model = `${info?.model ?? this.fC('model')?.value ?? ''}`.trim();
    const selectedMake = this.carOptions.find((item) => item.make === make);
    const isKnownMakeModel = !!selectedMake && (!model || selectedMake.models.includes(model));

    if (make && !isKnownMakeModel && info?.useManualEntry == null) {
      this.fC('useManualEntry')?.patchValue(true, { emitEvent: false });
    }

    this.syncAvailableModels();

    if (!this.useManualEntry) {
      this.clearInvalidSelectedCar();
    }
  }

  private syncAvailableModels(): void {
    const make = `${this.fC('make')?.value ?? ''}`.trim();
    const selectedMake = this.carOptions.find((item) => item.make === make);
    this.availableModels = selectedMake?.models || [];
  }

  private clearInvalidSelectedCar(): void {
    const make = `${this.fC('make')?.value ?? ''}`.trim();
    const model = `${this.fC('model')?.value ?? ''}`.trim();
    const selectedMake = this.carOptions.find((item) => item.make === make);

    if (!selectedMake) {
      if (make || model) {
        this.form.patchValue({ make: '', model: '' }, { emitEvent: false });
      }
      return;
    }

    if (model && !selectedMake.models.includes(model)) {
      this.fC('model')?.patchValue('', { emitEvent: false });
    }
  }
}
