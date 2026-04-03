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
  photo: RequiredPhoto | null;
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
  blob: Blob;
  url: string;
  name: string;
}

export interface GalleryPhoto {
  file: File;
  blob: Blob;
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
  tags: string[];
  requiredPhotos: {
    front: ValidatedPhoto | null;
    side: ValidatedPhoto | null;
    rear: ValidatedPhoto | null;
  };
  gallery: ValidatedPhoto[];
  visualMods: VisualMod[];
  performanceMods: PerformanceMod[];
  performanceSkipped: boolean;
}

export interface ValidatedPhoto {
    photo: RequiredPhoto;
    isCarPhoto: boolean;
    isValidSize: boolean;
    isValidType: boolean;
    isValidDimensions: boolean;
    isValidAspectRatio: boolean;
}

export type WizardView = 'front' | 'side' | 'rear';
export const WIZARD_VIEWS: WizardView[] = ['front', 'side', 'rear'];
