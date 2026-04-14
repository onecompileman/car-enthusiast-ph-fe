export type BuildModCategory =
  | 'Bodykits'
  | 'Aero'
  | 'Paint & Decals'
  | 'Wheels'
  | 'Others Visual Mods'
  | 'Engine & Power'
  | 'Drivetrain & Transmission'
  | 'Suspension & Handling';

export interface BuildModSpec {
  key: string;
  value: string;
}

export interface BuildMod {
  id: string;
  name: string;
  brand: string;
  description: string;
  partType?: string;
  image: string;
  category: BuildModCategory;
  categoryLabel: string;
  categoryTagClass: string;
  specs?: BuildModSpec[];
  price: string;
  source: string;
}
