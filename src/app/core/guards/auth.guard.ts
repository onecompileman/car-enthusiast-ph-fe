import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { LocalStorageKey } from '../../shared/enums/local-storage-key.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private readonly router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.checkAccess();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAccess();
  }

  private checkAccess(): boolean | UrlTree {
    const token = localStorage.getItem(LocalStorageKey.AUTH_TOKEN);

    if (token) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}