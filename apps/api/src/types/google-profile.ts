export interface GoogleProfile {
  id: string;
  displayName?: string;
  emails?: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
}

