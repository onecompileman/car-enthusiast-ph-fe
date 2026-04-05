export interface User {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  ssoId?: string;
  biography?: string;
  profilePhotoUrl?: string;
  coverPhotoUrl?: string;
  userInterests?: string;

  // Add any additional fields as needed
  userInitials?: string; // Optional field for storing user initials
}
