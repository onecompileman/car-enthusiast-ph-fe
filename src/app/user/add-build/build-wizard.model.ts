export interface HotspotPoint {
  x: number;
  y: number;
}

export interface HotspotMap {
  front: HotspotPoint | null;
  side: HotspotPoint | null;
  rear: HotspotPoint | null;
}

export interface VisualMod {
  id: string;
  name: string;
  part: string;
  description: string;
  shop: string;
  priceEstimate: string;
  imageName: string;
  hotspots: HotspotMap;
}

export interface PerformanceMod {
  id: string;
  name: string;
  description: string;
  shop: string;
  priceEstimate: string;
}

export interface RequiredPhoto {
  file: File;
  url: string;
  name: string;
}

export interface GalleryPhoto {
  file: File;
  url: string;
  name: string;
}

export interface BuildInfoForm {
  title: string;
  year: string;
  make: string;
  model: string;
  summary: string;
  approxCost: string;
}

export interface BuildWizardState {
  info: BuildInfoForm;
  requiredPhotos: {
    front: RequiredPhoto | null;
    side: RequiredPhoto | null;
    rear: RequiredPhoto | null;
  };
  gallery: GalleryPhoto[];
  visualMods: VisualMod[];
  performanceMods: PerformanceMod[];
  performanceSkipped: boolean;
}

export type WizardView = 'front' | 'side' | 'rear';
export const WIZARD_VIEWS: WizardView[] = ['front', 'side', 'rear'];
