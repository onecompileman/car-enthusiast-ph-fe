import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  canActivate(): boolean | UrlTree {
    return this.checkAccess();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAccess();
  }

  private checkAccess(): boolean | UrlTree {
    if (this.authService.isAdmin()) {
      return true;
    }
    return this.router.createUrlTree(['/']);
  }
}
