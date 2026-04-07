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
  receiveEmailNotifications?: boolean;
  userCarInterests?: UserCarInterest[];

  // Add any additional fields as needed
  userInitials?: string; // Optional field for storing user initials
}

export interface UserCarInterest {
  id: number;
  userId: number;
  make: string;
  model: string;
}
