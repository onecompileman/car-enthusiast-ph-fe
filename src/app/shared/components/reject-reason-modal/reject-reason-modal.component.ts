import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, finalize, isObservable, of } from 'rxjs';

export type RejectReasonCallback = (
  reason: string,
) => Observable<unknown> | Promise<unknown> | void;

@Component({
  selector: 'cap-reject-reason-modal',
  standalone: false,
  templateUrl: './reject-reason-modal.component.html',
  styleUrl: './reject-reason-modal.component.scss',
})
export class RejectReasonModalComponent {
  @Output() rejected = new EventEmitter<string>();

  title = 'Reject Build';
  message = 'Please provide a reason for rejecting this build.';
  confirmText = 'Reject';
  cancelText = 'Cancel';
  reasonPlaceholder = 'Enter reject reason';
  maxLength = 300;
  rejectCallback?: RejectReasonCallback;

  reason = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(public bsModalRef: BsModalRef) {}

  get reasonLength(): number {
    return this.reason.trim().length;
  }

  cancel(): void {
    if (this.isSubmitting) return;
    this.bsModalRef.hide();
  }

  reject(): void {
    if (this.isSubmitting) return;

    const reason = this.reason.trim();
    if (!reason) {
      this.errorMessage = 'Reject reason is required.';
      return;
    }

    this.errorMessage = '';

    if (!this.rejectCallback) {
      this.rejected.emit(reason);
      this.bsModalRef.hide();
      return;
    }

    this.isSubmitting = true;

    this.resolveToObservable(this.rejectCallback(reason))
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.rejected.emit(reason);
          this.bsModalRef.hide();
        },
        error: (err: unknown) => {
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
    return 'Unable to reject build. Please try again.';
  }
}
