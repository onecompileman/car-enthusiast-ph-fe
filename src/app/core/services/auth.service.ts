import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Result } from '../../shared/models/result.model';
import { TokenResponse } from '../../shared/models/auth/token-response.model';
import { LocalStorageKey } from '../../shared/enums/local-storage-key.enum';
import { User } from '../../shared/models/auth/user.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getInitials } from '../utils/get-initials.util';
import { AuthDataService } from '../data-services/auth.data-service';
import { RegisterModel } from '../../shared/models/auth/register.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  activeUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null,
  );

  constructor(
    private authDataService: AuthDataService,
    private afAuth: AngularFireAuth,
  ) {}

  async signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider as any);

    if (credential.user) {
      const token = await credential.user.getIdToken();
      localStorage.setItem(LocalStorageKey.GOOGLE_TOKEN, token);

      const tokenResponse = await this.signInViaGoogleToken(token).toPromise();

      this.saveToken(<any>tokenResponse);
    }
    return credential.user;
  }

  signInViaGoogleToken(googleToken: string): Observable<Result<TokenResponse>> {
    return this.authDataService
      .signInViaGoogleToken(googleToken)
      .pipe(tap(this.saveToken));
  }

  signIn(credentials: {
    email: string;
    password: string;
  }): Observable<Result<TokenResponse>> {
    return this.authDataService.signIn(credentials).pipe(tap(this.saveToken));
  }

  register(userData: { user: RegisterModel }): Observable<Result<User>> {
    return this.authDataService.register(userData);
  }

  signOut(): Observable<void> {
    return this.authDataService.signOut().pipe(tap(this.clearAuthData));
  }

  getActiveUserFromLocalStorage(): User | null {
    const userInfoStr = localStorage.getItem(LocalStorageKey.USER_INFO);
    if (userInfoStr) {
      return JSON.parse(userInfoStr) as User;
    }
    return null;
  }

  getActiveUser(): Observable<Result<User>> {
    return this.authDataService.getActiveUser().pipe(
      tap((res) => {
        if (res.success && res.data) {
          const userInfo = {
            ...res.data,
            userInitials: getInitials(res.data.fullName),
          };

          localStorage.setItem(
            LocalStorageKey.USER_INFO,
            JSON.stringify(userInfo),
          );
          this.activeUser.next(userInfo);
        }
      }),
    );
  }

  updateProfile(formData: FormData): Observable<Result<User>> {
    return this.authDataService.updateProfile(formData).pipe(
      tap((res) => {
        if (res.success && res.data) {
          const userInfo = {
            ...res.data,
            userInitials: getInitials(res.data.fullName),
          };

          localStorage.setItem(
            LocalStorageKey.USER_INFO,
            JSON.stringify(userInfo),
          );
          this.activeUser.next(userInfo);
        }
      }),
    );
  }

  clearAuthData() {
    localStorage.removeItem(LocalStorageKey.AUTH_TOKEN);
    localStorage.removeItem(LocalStorageKey.USER_INFO);
    this.activeUser.next(null);
  }

  private saveToken(res: Result<TokenResponse>) {
    console.log('AuthService - Save Token:', res.success && res.data);
    if (res.success && res.data) {
      console.log('AuthService - Save Token:', res.data.token);

      localStorage.setItem(LocalStorageKey.AUTH_TOKEN, res.data.token);
    }
  }
}
