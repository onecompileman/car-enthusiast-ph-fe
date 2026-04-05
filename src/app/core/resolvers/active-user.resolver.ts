import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../../shared/models/auth/user.model';
import { Result } from '../../shared/models/result.model';

@Injectable({ providedIn: 'root' })
export class ActiveUserResolver implements Resolve<Result<User>> {
  constructor(private authService: AuthService) {}

  resolve(): Observable<Result<User>> {
    return this.authService.getActiveUser();
  }
}
