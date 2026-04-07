import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../../shared/models/auth/user.model';
import { Result } from '../../shared/models/result.model';
import { LocalStorageKey } from '../../shared/enums/local-storage-key.enum';

@Injectable({ providedIn: 'root' })
export class ActiveUserResolver implements Resolve<Result<User>> {
  constructor(private authService: AuthService) {}

  resolve(): Observable<Result<User>> {
    const hasToken = localStorage.getItem(LocalStorageKey.AUTH_TOKEN);
    if (!hasToken) 
        return of(<any>{});
    return this.authService.getActiveUser();
  }
}
