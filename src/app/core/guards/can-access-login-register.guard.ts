import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { LocalStorageKey } from '../../shared/enums/local-storage-key.enum';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CanAccessLoginRegisterGuard implements CanActivate, CanActivateChild {
  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  canActivate(): boolean | UrlTree {
    return this.checkAccess();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAccess();
  }

  private checkAccess(): boolean | UrlTree {
    const token = localStorage.getItem(LocalStorageKey.AUTH_TOKEN);

    if (token) {
      return this.router.createUrlTree(['/user/profile']);
    }

     return true;
  }
}