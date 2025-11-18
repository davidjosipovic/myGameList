// IGDB API utility with automatic token refresh

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class IGDBClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private tokenFetchPromise: Promise<string> | null = null;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    // Force reload environment variables
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.error('TWITCH_CLIENT_ID:', this.clientId ? 'SET' : 'MISSING');
      console.error('TWITCH_CLIENT_SECRET:', this.clientSecret ? 'SET' : 'MISSING');
    }
  }

  /**
   * Fetches a new access token from Twitch OAuth
   */
  private async fetchNewToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in environment variables');
    }

    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch IGDB token:', errorText);
      throw new Error(`Failed to fetch IGDB access token: ${response.status} ${errorText}`);
    }

    const data: TokenResponse = await response.json();
    
    // Store token and set expiry time (subtract 5 minutes for safety)
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    
    console.log('New IGDB token fetched successfully');
    console.log('Token starts with:', this.accessToken.substring(0, 10) + '...');
    return data.access_token;
  }

  /**
   * Gets a valid access token, refreshing if necessary
   */
  private async getToken(): Promise<string> {
    // If token is still valid, return it immediately
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // If a token fetch is already in progress, wait for it
    if (this.tokenFetchPromise) {
      console.log('Waiting for existing token fetch...');
      return await this.tokenFetchPromise;
    }

    // Start a new token fetch and store the promise
    this.tokenFetchPromise = this.fetchNewToken();
    
    try {
      const token = await this.tokenFetchPromise;
      return token;
    } finally {
      // Clear the promise after it completes
      this.tokenFetchPromise = null;
    }
  }

  /**
   * Makes a request to the IGDB API with automatic token refresh
   */
  async request(endpoint: string, body: string): Promise<any> {
    // Refresh credentials in case they changed
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    
    const token = await this.getToken();
    
    console.log('Making IGDB request with token:', token.substring(0, 10) + '...');
    console.log('Using Client-ID:', this.clientId);
    
    const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${token}`,
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`IGDB API error (${response.status}):`, errorText);
      console.error('Using Client-ID:', this.clientId);
      
      // If unauthorized, token might be invalid - try refreshing once
      if (response.status === 401) {
        console.log('Token unauthorized, fetching new token...');
        // Clear the old token
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.tokenFetchPromise = null;
        
        // Wait a bit before retrying to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newToken = await this.getToken();
        
        console.log('Retrying with new token:', newToken.substring(0, 10) + '...');
        
        // Retry with new token
        const retryResponse = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${newToken}`,
          },
          body: body,
        });

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text();
          console.error(`IGDB API retry error (${retryResponse.status}):`, retryErrorText);
          throw new Error(`IGDB API error: ${retryResponse.status} ${retryErrorText}`);
        }

        return await retryResponse.json();
      }

      throw new Error(`IGDB API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  }
}

// Use global variable to ensure single instance across all server components
declare global {
  var igdbClientInstance: IGDBClient | undefined;
}

// Export a singleton instance that persists across hot reloads
export const igdbClient = global.igdbClientInstance || new IGDBClient();

if (process.env.NODE_ENV !== 'production') {
  global.igdbClientInstance = igdbClient;
}
