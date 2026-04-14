import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../shared/models/result.model';
import { Build, BuildStatus } from '../../shared/models/build/build.model';
import { PaginatedRequest } from '../../shared/models/paginated-request.model';
import { PaginatedResult } from '../../shared/models/paginated-result.model';

@Injectable({
  providedIn: 'root',
})
export class BuildDataService {
  baseUrl = '/Build';

  constructor(private http: HttpClient) {}

  shareBuild(formData: FormData): Observable<Result<Build>> {
    return this.http.post<Result<Build>>(
      `${this.baseUrl}/ShareBuild`,
      formData,
    );
  }

  searchBuilds(query: {
    request: PaginatedRequest;
  }): Observable<PaginatedResult<Build>> {
    return this.http.post<PaginatedResult<Build>>(
      `${this.baseUrl}/SearchBuild`,
      query,
    );
  }

  myBuilds(query: { status: BuildStatus | null }): Observable<Result<Build>> {
    return this.http.post<Result<Build>>(`${this.baseUrl}/MyBuilds`, query);
  }

  deleteBuild(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/DeleteBuild`);
  }

  updateBuild(formData: FormData): Observable<Result<Build>> {
    return this.http.post<Result<Build>>(
      `${this.baseUrl}/UpdateBuild`,
      formData,
    );
  }

  getBuildById(buildId: number): Observable<Result<Build>> {
    return this.http.get<Result<Build>>(`${this.baseUrl}/GetBuild/${buildId}`);
  }

  getUserBuildById(buildId: number): Observable<Result<Build>> {
    return this.http.get<Result<Build>>(
      `${this.baseUrl}/GetUserBuild/${buildId}`,
    );
  }

  getAdminUserBuildById(buildId: number): Observable<Result<Build>> {
    return this.http.get<Result<Build>>(
      `${this.baseUrl}/GetAdminBuild/${buildId}`,
    );
  }

  getAllBuildsByAdmin(query: {
    request: PaginatedRequest;
  }): Observable<PaginatedResult<Build>> {
    return this.http.post<PaginatedResult<Build>>(
      `${this.baseUrl}/AllBuildsForAdmin`,
      query,
    );
  }

  rejectBuild(buildId: number, reason: string): Observable<Result<Build>> {
    return this.http.post<Result<Build>>(`${this.baseUrl}/RejectBuild`, {
      buildId,
      reason,
    });
  }

   approveBuild(buildId: number): Observable<Result<Build>> {
    return this.http.post<Result<Build>>(`${this.baseUrl}/ApproveBuild`, {
      buildId,
    });
  }
}
