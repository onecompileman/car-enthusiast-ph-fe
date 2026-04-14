import { Component, OnInit } from '@angular/core';
import { BuildDataService } from '../../core/data-services/build.data-service';
import { Build, BuildStatus } from '../../shared/models/build/build.model';
import { Result } from '../../shared/models/result.model';

export interface UserBuild {
  id: string;
  title: string;
  year?: number;
  make?: string;
  model?: string;
  status: 'draft' | 'published';
  summary?: string;
  approxCost?: number;
  coverPhoto?: string;
  updatedAt?: string;
}

@Component({
  selector: 'cap-my-builds',
  standalone: false,
  templateUrl: './my-builds.component.html',
  styleUrl: './my-builds.component.scss',
})
export class MyBuildsComponent implements OnInit {
  builds: UserBuild[] = [];
  filteredBuilds: UserBuild[] = [];
  activeTab: 'all' | 'draft' | 'published' = 'all';
  buildCount = 0;
  loading = false;
  errorMessage = '';

  constructor(private buildDataService: BuildDataService) {}

  ngOnInit(): void {
    this.loadBuilds();
  }

  loadBuilds(): void {
    this.loading = true;
    this.errorMessage = '';

    const status = this.mapTabToStatus(this.activeTab);

    this.buildDataService.myBuilds({ status }).subscribe({
      next: (result: Result<Build>) => {
        const apiBuilds = this.extractBuilds(result);
        this.builds = apiBuilds.map((build: Build) => this.mapBuildToUserBuild(build));
        this.filteredBuilds = this.builds;
        this.buildCount = this.filteredBuilds.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.builds = [];
        this.filteredBuilds = [];
        this.buildCount = 0;
        this.errorMessage = 'Failed to load your builds. Please try again.';
      },
    });
  }

  selectTab(tab: 'all' | 'draft' | 'published'): void {
    this.activeTab = tab;
    this.loadBuilds();
  }

  getVehicleLabel(build: UserBuild): string {
    const parts = [build.year, build.make, build.model].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Vehicle not specified';
  }

  getCoverImage(build: UserBuild): string {
    return (
      build.coverPhoto ||
      'https://placehold.co/900x520/1D2129/F5F7FA?text=Build+Photo'
    );
  }

  formatCost(cost?: number): string {
    if (!cost) return 'No estimate';
    return (
      'PHP ' + cost.toLocaleString('en-PH', { maximumFractionDigits: 0 })
    );
  }

  formatDate(date?: string): string {
    if (!date) return 'Unknown update';
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private mapTabToStatus(tab: 'all' | 'draft' | 'published'): BuildStatus | null {
    if (tab === 'draft') return BuildStatus.Draft;
    if (tab === 'published') return BuildStatus.Published;
    return null;
  }

  private extractBuilds(result: Result<Build>): Build[] {
    const payload = result?.data as unknown;
    if (Array.isArray(payload)) {
      return payload as Build[];
    }
    if (payload && typeof payload === 'object') {
      return [payload as Build];
    }
    return [];
  }

  private mapBuildToUserBuild(build: Build): UserBuild {
    return {
      id: String(build.id),
      title: build.title || `${build.year} ${build.make} ${build.model}`.trim(),
      year: build.year,
      make: build.make,
      model: build.model,
      status: build.status === BuildStatus.Draft ? 'draft' : 'published',
      summary: build.buildSummary || '',
      approxCost: build.approxBuildCost,
      coverPhoto:
        build.frontSlantPhotoUrl ||
        build.sidePhotoUrl ||
        build.rearSlantPhotoUrl ||
        build.gallery?.[0]?.photoURL ||
        undefined,
      updatedAt: build.createdAt,
    };
  }
}
