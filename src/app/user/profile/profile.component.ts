import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ImageFilterService } from '../../core/services/image-filter.service';
import { User } from '../../shared/models/auth/user.model';
import { LocalStorageKey } from '../../shared/enums/local-storage-key.enum';
import { TextFilterService } from '../../core/services/text-filter.service';

interface CarOption {
  make: string;
  models: string[];
}

@Component({
  selector: 'cap-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly maxProfileSize = 2 * 1024 * 1024;
  private readonly maxCoverSize = 4 * 1024 * 1024;
  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
  ];

  form: FormGroup;
  userInfo: User | null = null;

  profilePreview: string | null = null;
  coverPreview: string | null = null;
  profileFileName = '';
  coverFileName = '';
  profileError: string | null = null;
  coverError: string | null = null;
  carInterestError: string | null = null;

  saveSuccess = false;
  isCarModalOpen = false;
  carOptions: CarOption[] = [];
  availableModels: string[] = [];

  private subscriptions: { [key: string]: Subscription } = {};
  readonly carInterestForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private imageFilterService: ImageFilterService,
    private textFilterService: TextFilterService,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, this.textFilterService.profanityValidator]],
      firstName: ['', [Validators.required, this.textFilterService.profanityValidator]],
      lastName: ['', [Validators.required, this.textFilterService.profanityValidator]],
      emailAddress: ['', [Validators.required, Validators.email]],
      biography: ['', [this.textFilterService.profanityValidator, Validators.maxLength(500)]],
      carInterests: [<string[]>[]],
      notifyCarBuildPosts: [true],
    });

    this.carInterestForm = this.fb.group({
      useManualEntry: [false],
      make: [''],
      model: [''],
      manualMake: [''],
      manualModel: [''],
    });
  }

  ngOnInit(): void {
    this.loadCarOptions();

    this.subscriptions['activeUser'] = this.authService.activeUser.subscribe(
      (user) => {
        this.userInfo = user;
        this.patchUser(user);
      },
    );

    this.subscriptions['carMakeChange'] = this.carInterestForm
      .get('make')!
      .valueChanges.subscribe((make) => {
        const selectedMake = this.carOptions.find((item) => item.make === make);
        this.availableModels = selectedMake?.models || [];
        this.carInterestForm.patchValue({ model: '' }, { emitEvent: false });
      });

    if (!this.authService.activeUser.value) {
      this.subscriptions['fetchUser'] = this.authService.getActiveUser().subscribe();
    }
  }

  ngOnDestroy(): void {
    Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
  }

  get fullName() {
    return this.form.get('fullName')!;
  }

  get firstName() {
    return this.form.get('firstName')!;
  }

  get lastName() {
    return this.form.get('lastName')!;
  }

  get emailAddress() {
    return this.form.get('emailAddress')!;
  }

  get useManualEntry() {
    return this.carInterestForm.get('useManualEntry')!.value;
  }

  get selectedCarInterests(): string[] {
    return this.form.get('carInterests')?.value || [];
  }

  openCarInterestModal(): void {
    this.carInterestError = null;
    this.isCarModalOpen = true;
    this.carInterestForm.reset({
      useManualEntry: false,
      make: '',
      model: '',
      manualMake: '',
      manualModel: '',
    });
    this.availableModels = [];
  }

  closeCarInterestModal(): void {
    this.isCarModalOpen = false;
    this.carInterestError = null;
  }

  addCarInterest(): void {
    const carLabel = this.useManualEntry
      ? this.buildManualCarLabel()
      : this.buildSelectedCarLabel();

    if (!carLabel) {
      this.carInterestError = this.useManualEntry
        ? 'Enter both make and model.'
        : 'Select both make and model.';
      return;
    }

    if (this.selectedCarInterests.includes(carLabel)) {
      this.carInterestError = 'That car interest is already added.';
      return;
    }

    this.form.patchValue({
      carInterests: [...this.selectedCarInterests, carLabel],
    });
    this.closeCarInterestModal();
  }

  removeCarInterest(car: string): void {
    this.form.patchValue({
      carInterests: this.selectedCarInterests.filter((item) => item !== car),
    });
  }

  async onProfileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.profileError = await this.validateImage(file, this.maxProfileSize);
    if (this.profileError) {
      this.profileFileName = '';
      input.value = '';
      return;
    }

    this.profileFileName = file.name;
    this.readFilePreview(file, (preview) => {
      this.profilePreview = preview;
    });
  }

  async onCoverSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.coverError = await this.validateImage(file, this.maxCoverSize, true);
    if (this.coverError) {
      this.coverFileName = '';
      input.value = '';
      return;
    }

    this.coverFileName = file.name;
    this.readFilePreview(file, (preview) => {
      this.coverPreview = preview;
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.userInfo) {
      return;
    }

    const formValue = this.form.value;
    const updatedUser: User = {
      ...this.userInfo,
      fullName: formValue.fullName,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      emailAddress: formValue.emailAddress,
      biography: formValue.biography || '',
      userInterests: this.selectedCarInterests.join(', '),
      profilePhotoUrl: this.profilePreview || this.userInfo.profilePhotoUrl,
      coverPhotoUrl: this.coverPreview || this.userInfo.coverPhotoUrl,
    };

    this.authService.activeUser.next(updatedUser);
    localStorage.setItem(LocalStorageKey.USER_INFO, JSON.stringify(updatedUser));

    this.saveSuccess = true;
    setTimeout(() => {
      this.saveSuccess = false;
    }, 2200);
  }

  private patchUser(user: User | null): void {
    if (!user) {
      return;
    }

    const interests = this.extractCarInterests(user.userInterests);

    this.form.patchValue({
      fullName: user.fullName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      emailAddress: user.emailAddress || '',
      biography: user.biography || '',
      carInterests: interests,
    });

    this.profilePreview = user.profilePhotoUrl || null;
    this.coverPreview = user.coverPhotoUrl || null;
  }

  private extractCarInterests(interests?: string): string[] {
    if (!interests?.trim()) {
      return [];
    }

    return interests
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private loadCarOptions(): void {
    this.subscriptions['carOptions'] = this.http
      .get<CarOption[]>('json/cars.json')
      .subscribe({
        next: (cars) => {
          this.carOptions = cars;
        },
        error: () => {
          this.carOptions = [];
        },
      });
  }

  private buildSelectedCarLabel(): string | null {
    const make = this.carInterestForm.get('make')!.value?.trim();
    const model = this.carInterestForm.get('model')!.value?.trim();

    if (!make || !model) {
      return null;
    }

    return `${make} ${model}`;
  }

  private buildManualCarLabel(): string | null {
    const make = this.carInterestForm.get('manualMake')!.value?.trim();
    const model = this.carInterestForm.get('manualModel')!.value?.trim();

    if (!make || !model) {
      return null;
    }

    return `${make} ${model}`;
  }

  private readFilePreview(file: File, setValue: (value: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => {
      setValue(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  }

  private async validateImage(
    file: File,
    maxSize: number,
    validateCoverAspectRatio = false,
  ): Promise<string | null> {
    if (!this.allowedImageTypes.includes(file.type)) {
      return 'Allowed file types: JPEG, PNG, WEBP, and HEIC.';
    }

    if (file.size > maxSize) {
      const sizeMb = Math.round(maxSize / (1024 * 1024));
      return `Image must be ${sizeMb}MB or less.`;
    }

    try {
      const isNSFW = await this.imageFilterService.isNSFW(file);

      if (isNSFW) {
        return 'NSFW images are not allowed.';
      }
    } catch {
      return 'Unable to validate image content. Please try another image.';
    }

    if (validateCoverAspectRatio) {
      const aspectRatio = await this.getImageAspectRatio(file);

      if (aspectRatio === null) {
        return 'Unable to read image dimensions.';
      }

      if (aspectRatio < 1.5 || aspectRatio > 4) {
        return 'Cover photo aspect ratio must be between 1.5 and 4.';
      }
    }

    return null;
  }

  private getImageAspectRatio(file: File): Promise<number | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          if (!image.width || !image.height) {
            resolve(null);
            return;
          }

          resolve(image.width / image.height);
        };

        image.onerror = () => resolve(null);
        image.src = typeof reader.result === 'string' ? reader.result : '';
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}
