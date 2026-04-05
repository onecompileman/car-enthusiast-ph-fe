import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterModel } from '../../shared/models/auth/register.model';
import { Observable } from 'rxjs';
import { Result } from '../../shared/models/result.model';
import { User } from '../../shared/models/auth/user.model';
import { TokenResponse } from '../../shared/models/auth/token-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthDataService {
  baseUrl = '/Auth';

  constructor(private http: HttpClient) {}

  register(userData: RegisterModel): Observable<Result<User>> {
    return this.http.post<Result<User>>(`${this.baseUrl}/Register`, userData);
  }

  signIn(credentials: {
    emailAddress: string;
    password: string;
  }): Observable<Result<TokenResponse>> {
    return this.http.post<Result<TokenResponse>>(
      `${this.baseUrl}/SignIn`,
      credentials,
    );
  }

  getActiveUser(): Observable<Result<User>> {
    return this.http.get<Result<User>>(`${this.baseUrl}/GetActiveUser`);
  }

  signOut(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/SignOut`, {});
  }

  signInViaGoogleToken(googleToken: string): Observable<Result<TokenResponse>> {
    return this.http.post<Result<TokenResponse>>(
      `${this.baseUrl}/SignInViaGoogleToken`,
      { googleBearerToken: googleToken },
    );
  }
}
