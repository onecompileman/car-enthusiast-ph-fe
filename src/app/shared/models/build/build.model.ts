import { User } from "../auth/user.model";


export enum BuildStatus {
  Draft = 'Draft',
  Published = 'Published',
  ForApproval = 'ForApproval',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum BuildPhotoType {
  FrontSlant = 'FrontSlant',
  RearSlant = 'RearSlant',
  Side = 'Side'
}

export interface BuildHotspot {
  id: number;
  visualModId: number;
  buildPhotoType: BuildPhotoType;
  x: number;
  y: number;
}

export interface BuildGallery {
  id: number;
  photoURL: string;
  buildId: number;
}

export interface BuildVisualMod {
  id: number;
  buildId: number;
  modName: string;
  partType: string;
  description: string;
  source: string;
  price: number;
  modPhotoUrl?: string | null;
  hotspots: BuildHotspot[];
}

export interface BuildPerformanceMod {
  id: number;
  buildId: number;
  modName: string;
  partType?: string;
  description: string;
  source: string;
  price: number;
}

export interface Build {
  id: number;
  userId: number;
  title: string;
  year: number;
  make: string;
  model: string;
  buildSummary?: string | null;
  buildTags?: string | null;
  approxBuildCost: number;
  frontSlantPhotoUrl?: string | null;
  rearSlantPhotoUrl?: string | null;
  sidePhotoUrl?: string | null;
  status: BuildStatus;
  rejectReason?: string | null;
  rejectedDateTime?: string | null;
  createdAt: string;
  updatedAt: string;
  totalHearts: number;
  totalFollows: number;
  user: User;
  gallery: BuildGallery[];
  visualMods: BuildVisualMod[];
  performanceMods: BuildPerformanceMod[];
}