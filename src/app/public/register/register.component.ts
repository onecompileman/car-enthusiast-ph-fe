import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BuildCarouselSlide } from '../../shared/components/builds-carousel/builds-carousel.component';
import { AuthService } from '../../core/services/auth.service';
import { TextFilterService } from '../../core/services/text-filter.service';
import { TermsCommunityModalComponent } from '../../shared/components/terms-community-modal/terms-community-modal.component';
import { passwordComplexityValidator } from '../../shared/validators/password-complexity.validator';

@Component({
  selector: 'cap-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  googleLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private textFilter: TextFilterService,
    private modalService: BsModalService,
  ) {
    this.form = this.fb.group(
      {
        firstName: [
          '',
          [Validators.required, this.textFilter.profanityValidator],
        ],
        lastName: [
          '',
          [Validators.required, this.textFilter.profanityValidator],
        ],
        emailAddress: [
          '',
          [
            Validators.required,
            Validators.email,
            this.textFilter.profanityValidator,
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(128),
            passwordComplexityValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordsMatchValidator },
    );
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
  get password() {
    return this.form.get('password')!;
  }
  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }
  get terms() {
    return this.form.get('terms')!;
  }

  onSubmit() {
    if (this.form.invalid || this.loading || this.terms.value === false) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const formValue = this.form.value;
    const payload = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      fullName: `${formValue.firstName} ${formValue.lastName}`.trim(),
      emailAddress: formValue.emailAddress,
      password: formValue.password,
    };

    this.authService.register({ user: payload }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        } else {
          this.errorMessage =
            res.errors?.[0] ?? 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
        this.errorMessage = error.error?.toString() || 'Something went wrong. Please try again.';
      },
    });
  }

  async signUpWithGoogle() {
    if (this.googleLoading) return;
    this.googleLoading = true;
    this.errorMessage = null;

    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/user/add-build']);
    } catch (e) {
      console.error('Google sign-up error:', e);
      this.errorMessage = 'Google sign-up failed. Please try again.';
    } finally {
      this.googleLoading = false;
    }
  }

  openTermsCommunityModal(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.modalService.show(TermsCommunityModalComponent, {
      class: 'modal-lg modal-dialog-scrollable',
      ignoreBackdropClick: true,
    });
  }

  private passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  protected readonly slides: BuildCarouselSlide[] = [
    {
      tag: 'Featured Build',
      kicker: 'Track-ready hatch',
      title: 'Honda FK8 Civic Type R',
      subtitle:
        'Street-tuned aero, forged wheels, and a clean red-on-carbon cockpit.',
      stat: '312 whp',
      meta: 'Manila build log',
      image: './images/fk8.jpg',
    },
    {
      tag: 'Community Pick',
      kicker: 'Stance-focused coupe',
      title: 'Toyota GR86 Stance',
      subtitle:
        'Aggressive fitment, satin bronze wheels, and detail-first body lines.',
      stat: '19-inch setup',
      meta: 'Cavite weekend car',
      image: './images/gr86.jpg',
    },
    {
      tag: 'Garage Spotlight',
      kicker: 'Performance sedan',
      title: 'BMW M3 E92 Track',
      subtitle:
        'Brake cooling, square setup, and a no-drama circuit-ready interior.',
      stat: '2:18 Clark pace',
      meta: 'Track day setup',
      image: './images/m3.jpg',
    },
  ];
}
