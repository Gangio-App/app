// User types for the application

export interface User {
  id?: string;
  email: string;
  name?: string;
  image?: string;
  avatar?: string;
  avatarUrl?: string;
  steamAvatarUrl?: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  emailVerified?: Date;
  
  // 2FA related fields
  twoFactorSecret?: string;
  tempTwoFactorSecret?: string;
  twoFactorEnabled?: boolean;
  backupCodes?: string[];
  
  // Additional user properties
  bio?: string;
  location?: string;
  displayName?: string;
  preferences?: UserPreferences;
  roles?: string[];
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    mentions?: boolean;
  };
  dateFormat?: string;
  timeFormat?: string;
}
