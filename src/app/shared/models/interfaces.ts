// City-related interfaces
export interface City {
  id: string | number;
  name: string;
  parent?: City;
}

// User-related interfaces
export interface User {
  id: string | number;
  email: string;
  name?: string;
  confirmedAt?: string | null;
  city?: City;
  // Add other user properties as needed
}

// Token-related interfaces
export interface TokenObject {
  accessToken: string;
  expiresAt: string;
}

// Language-related interfaces
export interface Language {
  id: string;
  name: string;
}

// Message interfaces for modals
export interface ModalMessage {
  title: string | null;
  msg: string | null;
}

// Constants interface
export interface Constants {
  [key: string]: any; // This can be made more specific based on actual constants structure
}

// Environment interface (basic structure)
export interface Environment {
  production: boolean;
  apiUrl?: string;
  // Add other environment properties as needed
}