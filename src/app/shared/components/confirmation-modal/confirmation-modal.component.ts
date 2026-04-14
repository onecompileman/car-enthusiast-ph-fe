import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, finalize, isObservable, of } from 'rxjs';

export type ConfirmationCallback = () =>
  | Observable<unknown>
  | Promise<unknown>
  | void;

@Component({
  selector: 'cap-confirmation-modal',
  standalone: false,
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
  @Output() confirmed = new EventEmitter<void>();

  title = 'Confirm Action';
  message = 'Are you sure you want to continue?';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  confirmCallback?: ConfirmationCallback;

  isSubmitting = false;
  errorMessage = '';

  constructor(public bsModalRef: BsModalRef) {}

  cancel(): void {
    if (this.isSubmitting) return;
    this.bsModalRef.hide();
  }

  confirm(): void {
    if (this.isSubmitting) return;

    this.errorMessage = '';

    if (!this.confirmCallback) {
      this.confirmed.emit();
      this.bsModalRef.hide();
      return;
    }

    this.isSubmitting = true;

    this.resolveToObservable(this.confirmCallback())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.bsModalRef.hide();
        }),
      )
      .subscribe({
        next: () => {
          this.confirmed.emit();
          this.bsModalRef.hide();
        },
        error: (err: unknown) => {
          this.bsModalRef.hide();
          this.errorMessage = this.getErrorMessage(err);
        },
      });
  }

  private resolveToObservable(
    result: Observable<unknown> | Promise<unknown> | void,
  ): Observable<unknown> {
    if (!result) return of(true);
    if (isObservable(result)) return result;
    return new Observable((subscriber) => {
      Promise.resolve(result)
        .then((value) => {
          subscriber.next(value);
          subscriber.complete();
        })
        .catch((error) => subscriber.error(error));
    });
  }

  private getErrorMessage(err: unknown): string {
    if (typeof err === 'string' && err.trim()) return err;
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
    return 'Unable to complete this action. Please try again.';
  }
}
