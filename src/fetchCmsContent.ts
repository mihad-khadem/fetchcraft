import axios, { AxiosInstance } from "axios";
import { TokenFetchError, ContentFetchError, FetchCraftError } from "./error";
import { CacheProvider, InMemoryCache } from "./cache";
import { retry } from "./utils";

export interface FetchCraftOptions {
  baseURL: string; // API base URL
  locale?: string; // Locale for content fetch, default 'en'
  cacheProvider?: CacheProvider; // Custom cache, defaults to in-memory
  tokenCacheKey?: string; // Cache key for token
  tokenTTLSeconds?: number; // Token cache TTL
}

export async function fetchCMSContent(
  options: FetchCraftOptions
): Promise<any> {
  const {
    baseURL,
    locale = "en",
    cacheProvider = new InMemoryCache(),
    tokenCacheKey = "fetchcraft_token",
    tokenTTLSeconds = 300,
  } = options;

  const api: AxiosInstance = axios.create({
    baseURL,
  });

  // Helper to get token from cache or API
  async function getToken(): Promise<string> {
    // Try cache first
    const cachedToken = await cacheProvider.get(tokenCacheKey);
    if (cachedToken) return cachedToken;

    // Fetch token from API
    const token = await retry(async () => {
      const res = await api.get("/get_token");
      if (!res.data?.token) {
        throw new TokenFetchError("Token missing in response");
      }
      return res.data.token;
    });

    // Cache token
    await cacheProvider.set(tokenCacheKey, token, tokenTTLSeconds);
    return token;
  }

  // Fetch the actual content data using the token
  async function getContent(token: string): Promise<any> {
    return retry(async () => {
      const res = await api.get(`/get_web_content?locale=${locale}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.data) {
        throw new ContentFetchError("Empty content response");
      }
      return res.data;
    });
  }

  try {
    const token = await getToken();
    const content = await getContent(token);
    // Return full content data, or you can destructure here if needed
    return content;
  } catch (error) {
    // Wrap unexpected errors in FetchCraftError
    if (error instanceof FetchCraftError) {
      throw error;
    }
    throw new FetchCraftError(
      error instanceof Error ? error.message : String(error)
    );
  }
}
