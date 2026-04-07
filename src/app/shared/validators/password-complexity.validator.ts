import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export function passwordComplexityValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = (control.value ?? '') as string;

  if (!value) {
    return null;
  }

  const errors: ValidationErrors = {};

  if (!/[0-9]/.test(value)) {
    errors['missingDigit'] = true;
  }

  if (!/[a-z]/.test(value)) {
    errors['missingLowercase'] = true;
  }

  if (!/[A-Z]/.test(value)) {
    errors['missingUppercase'] = true;
  }

  if (!/\W/.test(value)) {
    errors['missingSpecialChar'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}

export const passwordValidators = [
  Validators.required,
  Validators.minLength(8),
  Validators.maxLength(128),
  passwordComplexityValidator,
];

export function passwordsMatchValidator(
  passwordControlName: string,
  confirmPasswordControlName: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const passwordControl = group.get(passwordControlName);
    const confirmPasswordControl = group.get(confirmPasswordControlName);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    if (!confirmPasswordControl.value) {
      return null;
    }

    return passwordControl.value === confirmPasswordControl.value
      ? null
      : { passwordMismatch: true };
  };
}
