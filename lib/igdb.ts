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
   * Fetches a new access token from Twitch OAuth.
   */
  private async fetchNewToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in environment variables');
    }

    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch IGDB token:', errorText);
      throw new Error(`Failed to fetch IGDB access token: ${response.status} ${errorText}`);
    }

    const data: TokenResponse = await response.json();

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    console.log('New IGDB token fetched successfully');
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
   * Makes a single fetch to IGDB with the given token.
   */
  private async fetchIGDB(endpoint: string, body: string, token: string): Promise<Response> {
    return fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${token}`,
      },
      body,
    });
  }

  /**
   * Makes a request to the IGDB API with automatic retry on 401.
   * New Twitch tokens can take 10-60s to propagate across IGDB edge
   * servers, so on 401 we simply wait and retry with the same token.
   */
  async request(endpoint: string, body: string): Promise<any> {
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 4000; // 4 seconds between retries
    let token = await this.getToken();

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await this.fetchIGDB(endpoint, body, token);

      if (response.ok) {
        return await response.json();
      }

      const errorText = await response.text();

      // Only retry on 401 (token not yet propagated)
      if (response.status !== 401 || attempt === MAX_RETRIES) {
        throw new Error(`IGDB API error: ${response.status} ${errorText}`);
      }

      // After two failed attempts with the same token, try getting a fresh one
      if (attempt === 1) {
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.tokenFetchPromise = null;
      }

      console.warn(
        `IGDB 401 for "${endpoint}" (attempt ${attempt + 1}/${MAX_RETRIES + 1}) – waiting ${RETRY_DELAY_MS / 1000}s...`
      );
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      token = await this.getToken();
    }
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
