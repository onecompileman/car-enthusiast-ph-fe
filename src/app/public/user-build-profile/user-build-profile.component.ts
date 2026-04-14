import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { BuildListing } from '../../shared/models/build/build-listing.model';

@Component({
  selector: 'cap-user-build-profile',
  standalone: false,
  templateUrl: './user-build-profile.component.html',
  styleUrl: './user-build-profile.component.scss',
})
export class UserBuildProfileComponent {
  private readonly followedOwnersStorageKey = 'ceph-followed-owners';
  private readonly ownerId = 'owner-jun-reyes-public';
  private readonly baseFollowerCount = 1420;

  readonly profile = {
    initials: 'JR',
    name: 'Jun Reyes',
    handle: '@junreyes_fk8',
    location: 'Manila, PH',
    bio: 'Civic Type R owner and track-day regular. I document practical street and weekend setups with alignment notes, cost breakdowns, and lessons learned from each stage so other builders can skip expensive mistakes.',
    following: 318,
    totalBuildViews: '5.8M',
  };

  readonly publishedBuilds: BuildListing[] = [
    {
      id: 101,
      make: 'Honda',
      model: 'Civic Type R FK8 Street Aero Setup',
      year: 2020,
      style: 'street',
      cost: 320000,
      saves: 214,
      recentDate: '2026-03-18',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/d/d3/2017_Honda_Civic_Type_R_FK8_in_Championship_White%2C_front_right%2C_08-04-2024.jpg',
      description:
        'Balanced street setup with splitter, side skirts, and daily-friendly ride height for Manila roads.',
      tags: [
        { label: 'Street', colorClass: 'tag-green' },
        { label: 'Aero', colorClass: 'tag-dark' },
        { label: 'OEM+', colorClass: 'tag-gray' },
      ],
      specs: [
        { key: 'Suspension', value: 'Tein Flex Z' },
        { key: 'Wheels', value: '18 in forged' },
      ],
      builder: '@junreyes_fk8',
      location: 'Manila, PH',
    },
    {
      id: 102,
      make: 'BMW',
      model: 'M3 F80 Weekend Grip Build',
      year: 2018,
      style: 'track',
      cost: 640000,
      saves: 183,
      recentDate: '2026-02-26',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/a/a8/Action_Day_Renntaxi_Drift_BMW_M3_mod-3907.jpg',
      description:
        'Focused on brake consistency and suspension geometry for short circuit sessions and weekend lapping.',
      tags: [
        { label: 'Track', colorClass: 'tag-red' },
        { label: 'Grip', colorClass: 'tag-blue' },
        { label: 'Sedan', colorClass: 'tag-gray' },
      ],
      specs: [
        { key: 'Brakes', value: 'Endless 6-pot' },
        { key: 'Coilovers', value: 'Ohlins R&T' },
      ],
      builder: '@junreyes_fk8',
      location: 'Manila, PH',
    },
    {
      id: 103,
      make: 'Toyota',
      model: 'GR86 Daily + Touge Spec',
      year: 2023,
      style: 'street',
      cost: 280000,
      saves: 167,
      recentDate: '2026-01-12',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/50/2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg',
      description:
        'Clean wheel and tire package, mild camber, and OEM+ interior functionality tuned for mountain drives.',
      tags: [
        { label: 'Street', colorClass: 'tag-green' },
        { label: 'Touge', colorClass: 'tag-yellow' },
        { label: 'OEM+', colorClass: 'tag-gray' },
      ],
      specs: [
        { key: 'Tires', value: '245/40R18 PS4' },
        { key: 'Alignment', value: '-2.0 front camber' },
      ],
      builder: '@junreyes_fk8',
      location: 'Manila, PH',
    },
  ];

  isFollowing = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isFollowing = this.loadFollowedOwners().includes(this.ownerId);
  }

  get followersCount(): number {
    return this.baseFollowerCount + (this.isFollowing ? 1 : 0);
  }

  get publishedCountLabel(): string {
    const count = this.publishedBuilds.length;
    return `${count} build${count === 1 ? '' : 's'}`;
  }

  toggleFollow(): void {
    this.isFollowing = !this.isFollowing;
    const owners = this.loadFollowedOwners();
    const alreadyFollowing = owners.includes(this.ownerId);

    if (this.isFollowing && !alreadyFollowing) {
      owners.push(this.ownerId);
    }

    if (!this.isFollowing && alreadyFollowing) {
      const index = owners.indexOf(this.ownerId);
      owners.splice(index, 1);
    }

    this.saveFollowedOwners(owners);
  }

  private loadFollowedOwners(): string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(this.followedOwnersStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === 'string')
        : [];
    } catch {
      return [];
    }
  }

  private saveFollowedOwners(owners: string[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.localStorage.setItem(
      this.followedOwnersStorageKey,
      JSON.stringify(owners),
    );
  }
}
