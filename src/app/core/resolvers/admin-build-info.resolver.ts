import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of } from 'rxjs';
import { BuildDataService } from '../data-services/build.data-service';
import { Build } from '../../shared/models/build/build.model';
import { Result } from '../../shared/models/result.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({ providedIn: 'root' })
export class AdminBuildInfoResolver implements Resolve<Result<Build> | null> {
  constructor(
    private buildDataService: BuildDataService,
    private ngxSpinnerService: NgxSpinnerService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Result<Build> | null> {
    const buildId = Number(route.paramMap.get('buildId'));
    if (!Number.isFinite(buildId) || buildId <= 0) {
      return of(null);
    }

    this.ngxSpinnerService.show();
    return this.buildDataService.getAdminUserBuildById(buildId).pipe(
      catchError(() => of(null)),
      finalize(() => this.ngxSpinnerService.hide()),
    );
  }
}
