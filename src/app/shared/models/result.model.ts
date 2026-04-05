// Generic result with data
export interface Result<T> {
  success: boolean;
  data?: T;       // optional, only present when success = true
  errors: string[];
}