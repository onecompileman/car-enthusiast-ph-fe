import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../shared/models/result.model';
import { PaginatedResult } from '../../shared/models/paginated-result.model';
import { BuildDto } from '../../shared/models/build/build-dto.model';
import { AddBuildCommand } from '../../shared/models/build/add-build-command.model';
import { GetAllUserBuildsQuery } from '../../shared/models/build/get-all-user-builds-query.model';
import { DeleteBuildCommand } from '../../shared/models/build/delete-build-command.model';

@Injectable({
  providedIn: 'root',
})
export class BuildDataService {
  baseUrl = '/Build';

  constructor(private http: HttpClient) {}

  shareBuild(formData: FormData): Observable<Result<BuildDto>> {
    return this.http.post<Result<BuildDto>>(
      `${this.baseUrl}/ShareBuild`,
      formData
    );
  }

  searchBuilds(query: GetAllUserBuildsQuery): Observable<PaginatedResult<BuildDto>> {
    return this.http.post<PaginatedResult<BuildDto>>(
      `${this.baseUrl}/SearchBuild`,
      query
    );
  }

  myBuilds(query: GetAllUserBuildsQuery): Observable<PaginatedResult<BuildDto>> {
    return this.http.post<PaginatedResult<BuildDto>>(
      `${this.baseUrl}/MyBuilds`,
      query
    );
  }

  deleteBuild(command: DeleteBuildCommand): Observable<Result<BuildDto>> {
    return this.http.delete<Result<BuildDto>>(
      `${this.baseUrl}/DeleteBuild`,
      { body: command }
    );
  }

  updateBuild(formData: FormData): Observable<Result<BuildDto>> {
    return this.http.post<Result<BuildDto>>(
      `${this.baseUrl}/UpdateBuild`,
      formData
    );
  }
}
