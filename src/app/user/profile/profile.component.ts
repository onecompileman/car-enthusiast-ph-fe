import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ImageFilterService } from '../../core/services/image-filter.service';
import { User, UserCarInterest } from '../../shared/models/auth/user.model';
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
  private readonly maxCarFieldLength = 60;
  private readonly nameMaxLength = 80;
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
  saveError: string | null = null;

  profileFile: File | null = null;
  coverFile: File | null = null;

  isSaving = false;
  saveSuccess = false;
  isCarModalOpen = false;
  carOptions: CarOption[] = [];
  availableModels: string[] = [];

  private subscriptions: { [key: string]: Subscription } = {};
  readonly carInterestForm: FormGroup;
  private readonly textFilterService = inject(TextFilterService);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private imageFilterService: ImageFilterService,
  ) {
    this.form = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.nameMaxLength),
          this.textFilterService.profanityValidator,
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.nameMaxLength),
          this.textFilterService.profanityValidator,
        ],
      ],
      emailAddress: ['', [Validators.required, Validators.email]],
      biography: [
        '',
        [this.textFilterService.profanityValidator, Validators.maxLength(500)],
      ],
      carInterests: [<UserCarInterest[]>[]],
      notifyCarBuildPosts: [true],
    });

    this.carInterestForm = this.fb.group({
      useManualEntry: [false],
      make: ['', [Validators.maxLength(this.maxCarFieldLength)]],
      model: ['', [Validators.maxLength(this.maxCarFieldLength)]],
      manualMake: [
        '',
        [
          Validators.maxLength(this.maxCarFieldLength),
          this.textFilterService.profanityValidator,
        ],
      ],
      manualModel: [
        '',
        [
          Validators.maxLength(this.maxCarFieldLength),
          this.textFilterService.profanityValidator,
        ],
      ],
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
      this.subscriptions['fetchUser'] = this.authService
        .getActiveUser()
        .subscribe();
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
    return this.selectedCarInterestItems.map((item) =>
      `${item.make} ${item.model}`.trim(),
    );
  }

  get selectedCarInterestItems(): UserCarInterest[] {
    return this.form.get('carInterests')?.value || [];
  }

  saveProfile(): void {
    if (this.form.invalid || this.profileError || this.coverError) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    const formData = new FormData();
    formData.append('FullName', formValue.firstName + ' ' + formValue.lastName);
    formData.append('FirstName', formValue.firstName);
    formData.append('LastName', formValue.lastName);
    formData.append('Biography', formValue.biography ?? '');
    if (this.profileFile) {
      formData.append('ProfilePhoto', this.profileFile);
    }
    if (this.coverFile) {
      formData.append('CoverPhoto', this.coverFile);
    }

    // Serialize interests as JSON string
    formData.append(
      'UserCarInterests',
      JSON.stringify(this.selectedCarInterestItems),
    );

    this.isSaving = true;
    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.saveError = null;
        if (!res.success) {
          this.saveError = res.errors?.[0] || 'Failed to update profile.';
        }
      },
      error: () => {
        this.isSaving = false;
        this.saveError = 'Failed to update profile.';
      },
      complete: () => {
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => {
          this.saveSuccess = false;
        }, 2200);
      },
    });
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
    this.carInterestError = this.validateCarInterestInput();
    if (this.carInterestError) {
      return;
    }

    const carLabel = this.useManualEntry
      ? this.buildManualCarLabel()
      : this.buildSelectedCarLabel();

    if (!carLabel) {
      return;
    }

    if (
      this.selectedCarInterestItems.some(
        (item) =>
          `${item.make} ${item.model}`.trim().toLowerCase() ===
          carLabel.toLowerCase(),
      )
    ) {
      this.carInterestError = 'That car interest is already added.';
      return;
    }

    const [make, ...modelParts] = carLabel.split(' ');
    const nextCarInterest: UserCarInterest = {
      id: 0,
      userId: this.userInfo?.id || 0,
      make,
      model: modelParts.join(' '),
    };

    this.form.patchValue({
      carInterests: [...this.selectedCarInterestItems, nextCarInterest],
    });
    this.closeCarInterestModal();
  }

  removeCarInterest(car: UserCarInterest): void {
    this.form.patchValue({
      carInterests: this.selectedCarInterestItems.filter((item) =>
        car.id > 0
          ? item.id !== car.id
          : !(item.make === car.make && item.model === car.model),
      ),
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

    this.profileFile = file;
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

    this.coverFile = file;
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
      userCarInterests: this.selectedCarInterestItems,
      profilePhotoUrl: this.profilePreview || this.userInfo.profilePhotoUrl,
      coverPhotoUrl: this.coverPreview || this.userInfo.coverPhotoUrl,
    };

    this.authService.activeUser.next(updatedUser);
    localStorage.setItem(
      LocalStorageKey.USER_INFO,
      JSON.stringify(updatedUser),
    );

    this.saveSuccess = true;
    setTimeout(() => {
      this.saveSuccess = false;
    }, 2200);
  }

  private patchUser(user: User | null): void {
    if (!user) {
      return;
    }

    const interests = this.extractCarInterests(user);

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

  private extractCarInterests(user: User): UserCarInterest[] {
    if (user.userCarInterests?.length) {
      return user.userCarInterests;
    }

    if (!user.userInterests?.trim()) {
      return [];
    }

    return user.userInterests
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((car, index) => {
        const [make, ...modelParts] = car.split(' ');

        return {
          id: -(index + 1),
          userId: user.id,
          make,
          model: modelParts.join(' '),
        };
      });
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

  private validateCarInterestInput(): string | null {
    if (this.useManualEntry) {
      const make = this.carInterestForm.get('manualMake')?.value?.trim() || '';
      const model =
        this.carInterestForm.get('manualModel')?.value?.trim() || '';

      if (!make || !model) {
        return 'Enter both make and model.';
      }

      if (
        make.length > this.maxCarFieldLength ||
        model.length > this.maxCarFieldLength
      ) {
        return `Make and model must be ${this.maxCarFieldLength} characters or less.`;
      }

      if (this.hasProfanity(make) || this.hasProfanity(model)) {
        return 'Please remove inappropriate words from make/model.';
      }

      return null;
    }

    const make = this.carInterestForm.get('make')?.value?.trim() || '';
    const model = this.carInterestForm.get('model')?.value?.trim() || '';

    if (!make || !model) {
      return 'Select both make and model.';
    }

    const selectedMake = this.carOptions.find((item) => item.make === make);
    if (!selectedMake || !selectedMake.models.includes(model)) {
      return 'Selected make/model is invalid.';
    }

    return null;
  }

  private hasProfanity(value: string): boolean {
    return (
      this.textFilterService.isProfane(value) ||
      this.textFilterService.isProfaneCustom(value)
    );
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

      if (aspectRatio < 1.2 || aspectRatio > 4) {
        return 'Cover photo aspect ratio must be between 1.2 and 4.';
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
