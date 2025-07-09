/**
 * Cache interface to allow different cache implementations
 */
interface CacheProvider {
    get(key: string): Promise<any | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
}
/**
 * Simple in-memory cache implementation
 * Not persistent, clears on process exit
 */
declare class InMemoryCache implements CacheProvider {
    private cache;
    get(key: string): Promise<any | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
}

interface FetchCraftOptions {
    baseURL: string;
    locale?: string;
    cacheProvider?: CacheProvider;
    tokenCacheKey?: string;
    tokenTTLSeconds?: number;
}
declare function fetchCMSContent(options: FetchCraftOptions): Promise<any>;

declare class FetchCraftError extends Error {
    constructor(message: string);
}
declare class TokenFetchError extends FetchCraftError {
    constructor(message: string);
}
declare class ContentFetchError extends FetchCraftError {
    constructor(message: string);
}
declare class CacheError extends FetchCraftError {
    constructor(message: string);
}

/**
 * Simple retry function with exponential backoff.
 * Retries the async function 'fn' up to 'retries' times.
 */
declare function retry<T>(fn: () => Promise<T>, retries?: number, delayMs?: number): Promise<T>;

declare function useFetchCMS(options: FetchCraftOptions): {
    data: any;
    error: Error | null;
    loading: boolean;
};

export { CacheError, type CacheProvider, ContentFetchError, FetchCraftError, type FetchCraftOptions, InMemoryCache, TokenFetchError, fetchCMSContent, retry, useFetchCMS };
