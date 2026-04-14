import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { BuildDataService } from '../data-services/build.data-service';
import { Build } from '../../shared/models/build/build.model';
import { Result } from '../../shared/models/result.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserBuildInfoResolver implements Resolve<Build | null> {
  constructor(
    private buildDataService: BuildDataService,
    private ngxSpinnerService: NgxSpinnerService,
    private router: Router,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Build | null> {
    const buildId = Number(route.paramMap.get('buildId'));
    if (!Number.isFinite(buildId) || buildId <= 0) {
      return of(null);
    }

    this.ngxSpinnerService.show();
    return this.buildDataService.getUserBuildById(buildId).pipe(
      map((result) => result.data || null),
      catchError(() => {
        this.router.navigate(['/user/my-builds']);
        return of(null);
      }),
      finalize(() => {
        setTimeout(() => this.ngxSpinnerService.hide(), 2000);
      }),
    );
  }
}
