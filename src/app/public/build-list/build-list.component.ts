import { Component, OnInit } from '@angular/core';
import { BuildFilter, BuildListing, BuildTag } from '../../shared/models/build/build-listing.model';
import { BuildHighlight } from '../../shared/models/build/build-highlight.model';
import { BuildDataService } from '../../core/data-services/build.data-service';
import { Build } from '../../shared/models/build/build.model';
import { Filter, FilterMatch, PaginatedRequest } from '../../shared/models/paginated-request.model';

@Component({
  selector: 'cap-build-list',
  standalone: false,
  templateUrl: './build-list.component.html',
  styleUrl: './build-list.component.scss',
})
export class BuildListComponent implements OnInit {
  sort: 'saved' | 'cost-high' | 'cost-low' | 'recent' = 'recent';
  filter: BuildFilter = { make: '', model: '', style: 'all' };

  builds: BuildListing[] = [];
  totalCount = 0;
  loading = false;

  protected readonly highlight: BuildHighlight = {
    image: './images/fk8.jpg',
    imageAlt: 'Featured build lineup — Build Highlight of the Month',
    title: 'Honda FK8 Civic Type R',
    caption: 'Track-ready street build · 312 whp · forged wheels · Manila',
    ownerInitials: 'JR',
    ownerName: 'Juan Reyes',
  };

  constructor(private buildDataService: BuildDataService) {}

  ngOnInit(): void {
    this.fetch();
  }

  get filteredBuilds(): BuildListing[] {
    return this.builds;
  }

  onFilterChange(filter: BuildFilter): void {
    this.filter = filter;
    this.fetch();
  }

  onSortChange(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;

    const filters: Filter[] = [];

    if (this.filter.make) {
      filters.push({ column: 'Make', value: this.filter.make, match: FilterMatch.Contains });
    }
    if (this.filter.model) {
      filters.push({ column: 'Model', value: this.filter.model, match: FilterMatch.Contains });
    }
    if (this.filter.style && this.filter.style !== 'all') {
      filters.push({ column: 'BuildTags', value: this.filter.style, match: FilterMatch.Contains });
    }

    const sortMap: Record<string, { sortColumn: string; sortOrder: 'asc' | 'desc' }> = {
      'saved':     { sortColumn: 'totalFollows',    sortOrder: 'desc' },
      'cost-high': { sortColumn: 'approxBuildCost', sortOrder: 'desc' },
      'cost-low':  { sortColumn: 'approxBuildCost', sortOrder: 'asc'  },
      'recent':    { sortColumn: 'createdAt',       sortOrder: 'desc' },
    };

    const { sortColumn, sortOrder } = sortMap[this.sort];

    const request: PaginatedRequest = {
      page: 1,
      itemsPerPage: 50,
      sortColumn,
      sortOrder,
      filters,
    };

    this.buildDataService.searchBuilds({ request }).subscribe({
      next: (result) => {
        this.builds = result.items?.map((b) => this.toListingItem(b));
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private toListingItem(build: Build): BuildListing {
    const tagLabels = build.buildTags?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];
    const tags: BuildTag[] = tagLabels.map((label) => ({
      label,
      colorClass: this.resolveTagColor(label),
    }));

    const styleTag = tagLabels.find((t) =>
      ['street', 'track', 'stance', 'show'].includes(t.toLowerCase()),
    );
    const style = (styleTag?.toLowerCase() as BuildListing['style']) ?? 'street';

    return {
      id: build.id,
      make: build.make,
      model: build.model,
      year: build.year,
      style,
      cost: build.approxBuildCost,
      saves: build.totalFollows,
      recentDate: build.createdAt,
      image: build.frontSlantPhotoUrl ?? build.gallery?.[0]?.photoURL ?? '',
      description: build.buildSummary ?? '',
      tags,
      specs: build.visualMods?.slice(0, 2).map((m) => ({ key: m.partType, value: m.modName })) ?? [],
      builder: build.user?.fullName ?? '',
      location: 'Philippines',
    };
  }

  private resolveTagColor(label: string): string {
    const map: Record<string, string> = {
      track: 'tag-red',
      street: 'tag-green',
      stance: 'tag-blue',
      show: 'tag-yellow',
      turbo: 'tag-blue',
      supercharged: 'tag-blue',
      awd: 'tag-blue',
      na: 'tag-yellow',
      widebody: 'tag-blue',
      air: 'tag-dark',
      forged: 'tag-dark',
      aero: 'tag-dark',
    };
    return map[label.toLowerCase()] ?? 'tag-gray';
  }
}
