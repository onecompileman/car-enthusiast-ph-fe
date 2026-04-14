import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { finalize, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../../shared/models/auth/user.model';
import { Result } from '../../shared/models/result.model';
import { LocalStorageKey } from '../../shared/enums/local-storage-key.enum';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({ providedIn: 'root' })
export class ActiveUserResolver implements Resolve<Result<User>> {
  constructor(
    private authService: AuthService,
    private ngxSpinnerService: NgxSpinnerService,
  ) {}

  resolve(): Observable<Result<User>> {
    const hasToken = localStorage.getItem(LocalStorageKey.AUTH_TOKEN);
    if (!hasToken) return of(<any>{});

    this.ngxSpinnerService.show();
    return this.authService.getActiveUser().pipe(
      finalize(() => this.ngxSpinnerService.hide())
    );
  }
}
