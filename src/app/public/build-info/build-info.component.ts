import { Component } from '@angular/core';
import { BuildMod } from '../../shared/models/build-mod.model';
import { PhotoViewerImage } from '../../shared/models/photo-viewer.model';

type BuildAngle = 'front' | 'side' | 'rear';
type PartFilter = 'all' | 'exterior' | 'aero' | 'wheels';

interface BuildHotspot {
  id: string;
  part: string;
  angle: BuildAngle;
  category: Exclude<PartFilter, 'all'>;
  x: number;
  y: number;
  detail: string;
}

interface GalleryItem {
  title: string;
  image: string;
}

@Component({
  selector: 'cap-build-info',
  standalone: false,
  templateUrl: './build-info.component.html',
  styleUrl: './build-info.component.scss',
})
export class BuildInfoComponent {
  readonly angles: ReadonlyArray<{ key: BuildAngle; label: string }> = [
    { key: 'front', label: 'Front Slant' },
    { key: 'side', label: 'Side View' },
    { key: 'rear', label: 'Rear Slant' },
  ];

  readonly partFilters: ReadonlyArray<{ key: PartFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'exterior', label: 'Exterior' },
    { key: 'aero', label: 'Aero' },
    { key: 'wheels', label: 'Wheels' },
  ];

  selectedAngle: BuildAngle = 'side';
  selectedPartFilter: PartFilter = 'all';
  selectedHotspotId = '';
  activePhoto: PhotoViewerImage | null = null;

  readonly angleImageMap: Record<BuildAngle, string> = {
    front: 'images/fk8.jpg',
    side: 'images/fk8.jpg',
    rear: 'images/fk8.jpg',
  };

  readonly hotspots: BuildHotspot[] = [
    {
      id: 'hs-front-bumper',
      part: 'Voltex Type 1 Front Bumper',
      angle: 'front',
      category: 'exterior',
      x: 28,
      y: 57,
      detail: 'FRP with aero vents and lower lip add-on.',
    },
    {
      id: 'hs-canards',
      part: 'Seibon Carbon Canards',
      angle: 'front',
      category: 'aero',
      x: 34,
      y: 49,
      detail: 'Pair setup, gloss carbon finish.',
    },
    {
      id: 'hs-hood',
      part: 'Mugen Carbon Hood',
      angle: 'front',
      category: 'exterior',
      x: 51,
      y: 38,
      detail: 'Dry carbon hood with center vent cut.',
    },
    {
      id: 'hs-chin',
      part: 'APR Carbon Chin',
      angle: 'side',
      category: 'aero',
      x: 26,
      y: 55,
      detail: 'Adds front-end stability at speed.',
    },
    {
      id: 'hs-side-skirt',
      part: 'Mugen Side Skirts',
      angle: 'side',
      category: 'aero',
      x: 43,
      y: 62,
      detail: 'FRP side skirt extensions with clean fitment.',
    },
    {
      id: 'hs-wheel-front',
      part: 'Rays Volk CE28 (Front)',
      angle: 'side',
      category: 'wheels',
      x: 34,
      y: 68,
      detail: '18x9.5 +45 with Michelin Pilot Sport 4S.',
    },
    {
      id: 'hs-wing',
      part: 'APR GTC-300 Wing',
      angle: 'side',
      category: 'aero',
      x: 67,
      y: 35,
      detail: '67 in wing with adjustable attack angle.',
    },
    {
      id: 'hs-diffuser',
      part: 'Voltex Carbon Diffuser',
      angle: 'rear',
      category: 'aero',
      x: 69,
      y: 61,
      detail: '5-fin diffuser for rear-end stability.',
    },
    {
      id: 'hs-wheel-rear',
      part: 'Rays Volk CE28 (Rear)',
      angle: 'rear',
      category: 'wheels',
      x: 60,
      y: 68,
      detail: '18x9.5 +45 rear set with 265/35 tires.',
    },
  ];

  readonly gallery: GalleryItem[] = [
    { title: 'Engine Bay Detail', image: 'images/fk8.jpg' },
    { title: 'Interior Cockpit', image: 'images/fk8.jpg' },
    { title: 'Wheel + Brake Close-up', image: 'images/fk8.jpg' },
    { title: 'Rear Diffuser Shot', image: 'images/fk8.jpg' },
    { title: 'Carbon Hood Texture', image: 'images/fk8.jpg' },
    { title: 'Night Photo Set', image: 'images/fk8.jpg' },
  ];

  readonly visualCategories = [
    { key: 'all', label: 'All' },
    { key: 'exterior', label: 'Exterior' },
    { key: 'aero', label: 'Aero' },
    { key: 'wheels', label: 'Wheels & Tires' },
    { key: 'lighting', label: 'Lighting' },
  ] as const;

  readonly buildTags = ['Street Build', 'Turbo', 'FF Platform', 'Track Day Ready'];

  selectedVisualCategory: (typeof this.visualCategories)[number]['key'] = 'all';

  readonly visualMods: BuildMod[] = [
    {
      id: 'mod-front-lip',
      name: 'Carbon Front Lip v2',
      brand: 'Mugen',
      partType: 'Front Lip',
      description:
        'Dry carbon front lip that sharpens the nose profile and improves high-speed front-end stability.',
      image: 'images/parts/front-lip.svg',
      category: 'exterior',
      categoryLabel: 'Exterior',
      categoryTagClass: 'tag-blue',
      specs: [
        { key: 'Material', value: 'Dry Carbon' },
        { key: 'Finish', value: 'Gloss' },
        { key: 'Install', value: 'Bolt-on' },
      ],
      price: 'PHP 68,000',
      source: 'Mugen PH',
    },
    {
      id: 'mod-sideskirt',
      name: 'Aero Side Skirt Set',
      brand: 'Varis',
      partType: 'Side Skirt',
      description:
        'Side skirt extensions that visually lower the car and smooth airflow along the side profile.',
      image: 'images/parts/side-skirt.svg',
      category: 'aero',
      categoryLabel: 'Aero',
      categoryTagClass: 'tag-red',
      specs: [
        { key: 'Material', value: 'Carbon Composite' },
        { key: 'Pieces', value: '2' },
        { key: 'Weight', value: '3.8 kg' },
      ],
      price: 'PHP 92,000',
      source: 'Import Group Buy',
    },
    {
      id: 'mod-wheelset',
      name: 'Forged Wheel Set 18x9.5',
      brand: 'Rays CE28',
      partType: 'Wheel Set',
      description:
        'Lightweight forged setup paired with grippy performance tires for responsive turn-in and daily usability.',
      image: 'images/parts/wheel-set.svg',
      category: 'wheels',
      categoryLabel: 'Wheels',
      categoryTagClass: 'tag-dark',
      specs: [
        { key: 'Offset', value: '+45' },
        { key: 'Tire', value: '265/35R18' },
        { key: 'Weight', value: '8.2 kg ea' },
      ],
      price: 'PHP 178,000',
      source: 'Rays PH',
    },
    {
      id: 'mod-headlights',
      name: 'LED Headlight Retrofit',
      brand: 'Morimoto',
      partType: 'Headlights',
      description:
        'Bi-LED retrofit package with cleaner beam pattern, brighter output, and sequential DRL behavior.',
      image: 'images/parts/headlights.svg',
      category: 'lighting',
      categoryLabel: 'Lighting',
      categoryTagClass: 'tag-yellow',
      specs: [
        { key: 'Projector', value: 'Bi-LED' },
        { key: 'DRL', value: 'Sequential' },
        { key: 'Warranty', value: '1 year' },
      ],
      price: 'PHP 34,000',
      source: 'RetroLab QC',
    },
  ];

  readonly performanceMods: BuildMod[] = [
    {
      id: 'mod-intake',
      name: 'Carbon Intake System',
      brand: 'Eventuri',
      description:
        'High-flow carbon intake system focused on better throttle response and improved top-end breathing.',
      image: 'images/fk8.jpg',
      category: 'performance',
      categoryLabel: 'Performance',
      categoryTagClass: 'tag-green',
      specs: [
        { key: 'Gain', value: '+11 whp' },
        { key: 'Filter', value: 'Dual Cone' },
        { key: 'Fuel', value: '95 RON+' },
      ],
      price: 'PHP 96,000',
      source: 'Eventuri Dealer',
    },
    {
      id: 'mod-intercooler',
      name: 'Front Mount Intercooler',
      brand: 'Mishimoto',
      description:
        'Larger intercooler core that keeps intake temperatures stable through repeated pulls and hot laps.',
      image: 'images/fk8.jpg',
      category: 'cooling',
      categoryLabel: 'Cooling',
      categoryTagClass: 'tag-blue',
      specs: [
        { key: 'Core', value: 'Bar and Plate' },
        { key: 'IAT Drop', value: '-12 C avg' },
        { key: 'Pipe Size', value: '2.5 in' },
      ],
      price: 'PHP 58,000',
      source: 'Mishimoto PH',
    },
    {
      id: 'mod-coils',
      name: 'Track Coilover Kit',
      brand: 'Ohlins DFV',
      description:
        'Dual-use suspension setup tuned for sharper body control while preserving street comfort.',
      image: 'images/fk8.jpg',
      category: 'suspension',
      categoryLabel: 'Suspension',
      categoryTagClass: 'tag-dark',
      specs: [
        { key: 'Spring Rate', value: '8k/10k' },
        { key: 'Damping', value: '20-way' },
        { key: 'Height Adj.', value: 'Yes' },
      ],
      price: 'PHP 146,000',
      source: 'Racewerks Manila',
    },
  ];

  get activeAngleLabel(): string {
    return this.angles.find((item) => item.key === this.selectedAngle)?.label || 'Side View';
  }

  get currentAngleImage(): string {
    return this.angleImageMap[this.selectedAngle];
  }

  get visibleHotspots(): BuildHotspot[] {
    return this.hotspots.filter(
      (hs) =>
        hs.angle === this.selectedAngle &&
        (this.selectedPartFilter === 'all' || hs.category === this.selectedPartFilter),
    );
  }

  get selectedHotspot(): BuildHotspot | null {
    return this.hotspots.find((item) => item.id === this.selectedHotspotId) || null;
  }

  get partCountMap(): Record<PartFilter, number> {
    return {
      all: this.hotspots.filter((hs) => hs.angle === this.selectedAngle).length,
      exterior: this.hotspots.filter((hs) => hs.angle === this.selectedAngle && hs.category === 'exterior').length,
      aero: this.hotspots.filter((hs) => hs.angle === this.selectedAngle && hs.category === 'aero').length,
      wheels: this.hotspots.filter((hs) => hs.angle === this.selectedAngle && hs.category === 'wheels').length,
    };
  }

  get filteredVisualMods(): BuildMod[] {
    if (this.selectedVisualCategory === 'all') {
      return this.visualMods;
    }
    return this.visualMods.filter(
      (mod) => mod.category === this.selectedVisualCategory,
    );
  }

  setAngle(angle: BuildAngle): void {
    this.selectedAngle = angle;
    this.selectedHotspotId = '';
  }

  setPartFilter(filter: PartFilter): void {
    this.selectedPartFilter = filter;
    this.selectedHotspotId = '';
  }

  selectHotspot(id: string): void {
    this.selectedHotspotId = this.selectedHotspotId === id ? '' : id;
  }

  selectVisualCategory(category: (typeof this.visualCategories)[number]['key']): void {
    this.selectedVisualCategory = category;
  }

  openPhotoViewer(src: string, alt: string, caption?: string): void {
    this.activePhoto = { src, alt, caption };
  }

  closePhotoViewer(): void {
    this.activePhoto = null;
  }
}
