import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildDataService } from '../../core/data-services/build.data-service';
import { Build, BuildStatus } from '../../shared/models/build/build.model';
import { PaginatedResult } from '../../shared/models/paginated-result.model';
import { FilterMatch } from '../../shared/models/paginated-request.model';

type StatusFilter = 'all' | 'ForApproval' | 'Rejected' | 'Published';

@Component({
  selector: 'cap-admin-builds',
  standalone: false,
  templateUrl: './admin-builds.component.html',
  styleUrl: './admin-builds.component.scss',
})
export class AdminBuildsComponent implements OnInit {
  builds: Build[] = [];
  loading = false;
  errorMessage = '';

  totalCount = 0;
  pendingCount = 0;
  publishedCount = 0;

  activeFilter: StatusFilter = 'all';

  readonly filters: { label: string; value: StatusFilter }[] = [
    { label: 'All Builds', value: 'all' },
    { label: 'Pending Approval', value: 'ForApproval' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Published', value: 'Published' },
  ];

  constructor(
    private buildDataService: BuildDataService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const status = params['status'] as StatusFilter | undefined;
      this.activeFilter = status ?? 'all';
      this.loadBuilds();
    });
  }

  loadBuilds(): void {
    this.loading = true;
    this.errorMessage = '';

    const statusFilter = this.activeFilter !== 'all' ? this.activeFilter : undefined;

    this.buildDataService
      .getAllBuildsByAdmin({
        request: {
          page: 1,
          itemsPerPage: 50,
          sortOrder: 'desc',
          sortColumn: 'createdAt',
          filters: statusFilter
            ? [
                {
                  column: 'Status',
                  value: statusFilter,
                  match: FilterMatch.Equals
                },
              ]
            : [],
        },
      })
      .subscribe({
        next: (result: PaginatedResult<Build>) => {
          this.builds = result.items ?? [];
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.builds = [];
          this.errorMessage = 'Failed to load builds. Please try again.';
        },
      });
  }

  selectFilter(filter: StatusFilter): void {
    this.activeFilter = filter;
    this.loadBuilds();
  }

  getStatusLabel(status: BuildStatus): string {
    const map: Record<BuildStatus, string> = {
      [BuildStatus.Draft]: 'Draft',
      [BuildStatus.Published]: 'Published',
      [BuildStatus.ForApproval]: 'Pending',
      [BuildStatus.Approved]: 'Approved',
      [BuildStatus.Rejected]: 'Rejected',
    };
    return map[status] ?? status;
  }

  getStatusKey(status: BuildStatus): string {
    if (status === BuildStatus.ForApproval || status === BuildStatus.Draft) return 'pending';
    if (status === BuildStatus.Rejected) return 'rejected';
    if (status === BuildStatus.Published || status === BuildStatus.Approved) return 'published';
    return 'pending';
  }

  getCoverPhoto(build: Build): string {
    return (
      build.frontSlantPhotoUrl ||
      build.sidePhotoUrl ||
      build.rearSlantPhotoUrl ||
      'https://placehold.co/220x220/E7E7E8/9CA3AF?text=No+Photo'
    );
  }

  countByStatus(status: string): number {
    return this.builds.filter((b) => b.status === status).length;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
