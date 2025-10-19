export interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token: string;
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineAuthConfig {
  channelId: string;
  channelSecret: string;
  redirectUri: string;
  scope: string;
}

export interface LineAuthResult {
  jwtToken: string;
  expireDate: string;
  userProfile: LineUserProfile;
  isNewUser: boolean;
}
