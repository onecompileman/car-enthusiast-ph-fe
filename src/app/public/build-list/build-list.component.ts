import { Component } from '@angular/core';
import { BuildFilter, BuildListing } from '../../shared/models/build-listing.model';
import { BuildHighlight } from '../../shared/models/build-highlight.model';

@Component({
  selector: 'cap-build-list',
  standalone: false,
  templateUrl: './build-list.component.html',
  styleUrl: './build-list.component.scss',
})
export class BuildListComponent {
  sort: 'saved' | 'cost-high' | 'cost-low' | 'recent' = 'saved';
  filter: BuildFilter = { make: '', model: '', style: 'all' };

  protected readonly highlight: BuildHighlight = {
    image: './images/fk8.jpg',
    imageAlt: 'Featured build lineup — Build Highlight of the Month',
    title: 'Honda FK8 Civic Type R',
    caption: 'Track-ready street build · 312 whp · forged wheels · Manila',
    ownerInitials: 'JR',
    ownerName: 'Juan Reyes',
  };

  readonly allBuilds: BuildListing[] = [
    {
      id: 1,
      make: 'Honda',
      model: 'Civic Type R FK8',
      year: 2020,
      style: 'track',
      cost: 685000,
      saves: 312,
      recentDate: '2026-03-01',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/d/d3/2017_Honda_Civic_Type_R_FK8_in_Championship_White%2C_front_right%2C_08-04-2024.jpg',
      description:
        'Full aero street-track setup with forged wheels, carbon hood, APR wing, tuned K20C, and brake package.',
      tags: [
        { label: 'Track', colorClass: 'tag-red' },
        { label: 'Turbo', colorClass: 'tag-blue' },
        { label: 'Aero', colorClass: 'tag-dark' },
      ],
      specs: [
        { key: 'Power', value: '320 whp' },
        { key: 'Wheels', value: 'Rays CE28' },
      ],
      builder: '@mk_builds',
      location: 'Quezon City, PH',
    },
    {
      id: 2,
      make: 'Toyota',
      model: 'GR86 Premium',
      year: 2023,
      style: 'street',
      cost: 420000,
      saves: 248,
      recentDate: '2026-03-10',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/50/2022_Toyota_GR86_Premium_in_Halo%2C_Front_Right%2C_04-10-2022.jpg',
      description:
        'OEM+ street build with TE37 wheels, coilovers, front lip, carbon ducktail, and subtle interior trim.',
      tags: [
        { label: 'Street', colorClass: 'tag-green' },
        { label: 'NA', colorClass: 'tag-yellow' },
        { label: 'OEM+', colorClass: 'tag-gray' },
      ],
      specs: [
        { key: 'Power', value: '245 hp' },
        { key: 'Suspension', value: 'HKS Hipermax' },
      ],
      builder: '@adrian.garage',
      location: 'Pasig City, PH',
    },
    {
      id: 3,
      make: 'BMW',
      model: 'M3 E92 Widebody',
      year: 2011,
      style: 'show',
      cost: 960000,
      saves: 201,
      recentDate: '2026-02-18',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/a/a8/Action_Day_Renntaxi_Drift_BMW_M3_mod-3907.jpg',
      description:
        'Luxury show-car setup with Liberty Walk body kit, air suspension, forged three-piece wheels, and Alcantara interior.',
      tags: [
        { label: 'Show', colorClass: 'tag-yellow' },
        { label: 'Widebody', colorClass: 'tag-blue' },
        { label: 'Air', colorClass: 'tag-dark' },
      ],
      specs: [
        { key: 'Power', value: '420 hp' },
        { key: 'Suspension', value: 'Air Lift 3P' },
      ],
      builder: '@germanmetal',
      location: 'Makati, PH',
    },
    {
      id: 4,
      make: 'Nissan',
      model: '370Z Nismo',
      year: 2016,
      style: 'stance',
      cost: 510000,
      saves: 178,
      recentDate: '2026-01-30',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/2/2f/2016_Nissan_370Z_Nismo_%2819826%29.jpg',
      description:
        'Aggressive stance fitment with Work Meister wheels, overfenders, titanium exhaust, and custom rear diffuser.',
      tags: [
        { label: 'Stance', colorClass: 'tag-blue' },
        { label: 'VQ', colorClass: 'tag-red' },
        { label: 'Static', colorClass: 'tag-gray' },
      ],
      specs: [
        { key: 'Wheels', value: 'Work Meister' },
        { key: 'Exhaust', value: 'Armytrix' },
      ],
      builder: '@zchassis.ian',
      location: 'Cebu, PH',
    },
    {
      id: 5,
      make: 'Subaru',
      model: 'WRX STI VA',
      year: 2018,
      style: 'track',
      cost: 735000,
      saves: 294,
      recentDate: '2026-03-12',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/b1/Subaru_WRX_STI%2C_Geneva_2014.jpg',
      description:
        'Track-focused AWD setup with forged internals, Ohlins DFV, carbon wing, and endurance brake package.',
      tags: [
        { label: 'Track', colorClass: 'tag-red' },
        { label: 'AWD', colorClass: 'tag-blue' },
        { label: 'Time Attack', colorClass: 'tag-dark' },
      ],
      specs: [
        { key: 'Power', value: '410 whp' },
        { key: 'Turbo', value: 'Garrett GTX' },
      ],
      builder: '@boosted.ralph',
      location: 'Davao, PH',
    },
    {
      id: 6,
      make: 'Mazda',
      model: 'MX-5 ND Roadster',
      year: 2022,
      style: 'street',
      cost: 310000,
      saves: 156,
      recentDate: '2026-02-25',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/b7/Mazda_MX-5_%28ND%29_1X7A7471.jpg',
      description:
        'Lightweight canyon setup with Advan wheels, front splitter, axle-back exhaust, and understated roadster styling.',
      tags: [
        { label: 'Street', colorClass: 'tag-green' },
        { label: 'NA', colorClass: 'tag-yellow' },
        { label: 'Roadster', colorClass: 'tag-gray' },
      ],
      specs: [
        { key: 'Weight', value: '1,050 kg' },
        { key: 'Wheels', value: 'Advan TC4' },
      ],
      builder: '@ndweekender',
      location: 'Taguig, PH',
    },
    {
      id: 7,
      make: 'Mitsubishi',
      model: 'Evolution X',
      year: 2015,
      style: 'track',
      cost: 880000,
      saves: 226,
      recentDate: '2026-03-14',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/5/5c/2011_Mitsubishi_Lancer_Evolution_MR_in_Wicked_White%2C_Front_Left%2C_05-29-2022.jpg',
      description:
        'Circuit-ready sedan with Varis aero, forged engine setup, motorsport seats, and track-day cooling upgrades.',
      tags: [
        { label: 'Track', colorClass: 'tag-red' },
        { label: 'AWD', colorClass: 'tag-blue' },
        { label: 'Forged', colorClass: 'tag-dark' },
      ],
      specs: [
        { key: 'Power', value: '480 whp' },
        { key: 'Aero', value: 'Varis' },
      ],
      builder: '@evo.ron',
      location: 'Clark, PH',
    },
    {
      id: 8,
      make: 'Toyota',
      model: 'Corolla Altis',
      year: 2021,
      style: 'show',
      cost: 265000,
      saves: 112,
      recentDate: '2026-01-12',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/4/46/2008_Toyota_Corolla_Altis_1.6_V_20221008.jpg',
      description:
        'Clean show-car sedan with lip kit, polished wheels, air suspension, and a tan interior detail package.',
      tags: [
        { label: 'Show', colorClass: 'tag-yellow' },
        { label: 'VIP Touch', colorClass: 'tag-gray' },
        { label: 'Street', colorClass: 'tag-green' },
      ],
      specs: [
        { key: 'Suspension', value: 'Air Lift' },
        { key: 'Wheels', value: 'SSR Vienna' },
      ],
      builder: '@altisdaily',
      location: 'Bacolod, PH',
    },
  ];

  get filteredBuilds(): BuildListing[] {
    const { make, model, style } = this.filter;
    const results = this.allBuilds.filter((b) => {
      const matchesMake =
        !make || b.make.toLowerCase().includes(make.toLowerCase());
      const matchesModel =
        !model || b.model.toLowerCase().includes(model.toLowerCase());
      const matchesStyle = style === 'all' || b.style === style;
      return matchesMake && matchesModel && matchesStyle;
    });

    return [...results].sort((a, b) => {
      switch (this.sort) {
        case 'cost-high':
          return b.cost - a.cost;
        case 'cost-low':
          return a.cost - b.cost;
        case 'recent':
          return (
            new Date(b.recentDate).getTime() - new Date(a.recentDate).getTime()
          );
        default:
          return b.saves - a.saves;
      }
    });
  }

  onFilterChange(filter: BuildFilter): void {
    this.filter = filter;
  }
}
