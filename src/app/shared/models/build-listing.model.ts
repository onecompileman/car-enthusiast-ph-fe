export interface BuildTag {
  label: string;
  colorClass: string;
}

export interface BuildSpec {
  key: string;
  value: string;
}

export interface BuildListing {
  id: number;
  make: string;
  model: string;
  year: number;
  style: 'street' | 'track' | 'stance' | 'show';
  cost: number;
  saves: number;
  recentDate: string;
  image: string;
  description: string;
  tags: BuildTag[];
  specs: BuildSpec[];
  builder: string;
  location: string;
}

export interface BuildFilter {
  make: string;
  model: string;
  style: string;
}
