import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BuildCarouselSlide } from '../../shared/components/builds-carousel/builds-carousel.component';
import { AuthService } from '../../core/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'cap-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  googleLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngxSpinner: NgxSpinnerService,
  ) {
    this.form = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get emailAddress() {
    return this.form.get('emailAddress')!;
  }
  get password() {
    return this.form.get('password')!;
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = null;

    this.authService.signIn(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/user/add-build']);
        } else {
          this.errorMessage =
            res.errors?.[0] ?? 'Sign in failed. Please try again.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      },
    });
  }

  async signInWithGoogle() {
    if (this.googleLoading) return;
    this.googleLoading = true;
    this.errorMessage = null;
    try {
      this.ngxSpinner.show();

      await this.authService.signInWithGoogle();
      setTimeout(() => {
        this.googleLoading = false;
        this.router.navigate(['/user/add-build']);
        this.ngxSpinner.hide();
      }, 1000);
    } catch {
      this.errorMessage = 'Google sign-in failed. Please try again.';
      this.ngxSpinner.hide();
    } finally {
      this.googleLoading = false;
    }
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
