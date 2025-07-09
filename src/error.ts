// Custom error classes for clearer error handling in fetchcraft

export class FetchCraftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Fetch Craft Error";
  }
}

export class TokenFetchError extends FetchCraftError {
  constructor(message: string) {
    super(message);
    this.name = "Token Fetch Error";
  }
}

export class ContentFetchError extends FetchCraftError {
  constructor(message: string) {
    super(message);
    this.name = "Content Fetch Error";
  }
}

export class CacheError extends FetchCraftError {
  constructor(message: string) {
    super(message);
    this.name = "Cache Error";
  }
}
