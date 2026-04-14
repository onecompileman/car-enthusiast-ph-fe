export interface PaginatedRequest {
  page: number; // default 1
  itemsPerPage: number; // default 10
  sortOrder?: 'asc' | 'desc'; // default "desc"
  sortColumn?: string;
  filters?: Filter[];
}

export interface Filter {
  column: string;
  value: string;
  match: FilterMatch;
}

export enum FilterMatch {
  Equals = 'Equals',
  NotEquals = 'NotEquals',
  Contains = 'Contains',
  In = 'In',
  NotIn = 'NotIn',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
}
