"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CacheError: () => CacheError,
  ContentFetchError: () => ContentFetchError,
  FetchCraftError: () => FetchCraftError,
  InMemoryCache: () => InMemoryCache,
  TokenFetchError: () => TokenFetchError,
  fetchCMSContent: () => fetchCMSContent,
  retry: () => retry,
  useFetchCMS: () => useFetchCMS
});
module.exports = __toCommonJS(index_exports);

// src/fetchCmsContent.ts
var import_axios = __toESM(require("axios"));

// src/error.ts
var FetchCraftError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "Fetch Craft Error";
  }
};
var TokenFetchError = class extends FetchCraftError {
  constructor(message) {
    super(message);
    this.name = "Token Fetch Error";
  }
};
var ContentFetchError = class extends FetchCraftError {
  constructor(message) {
    super(message);
    this.name = "Content Fetch Error";
  }
};
var CacheError = class extends FetchCraftError {
  constructor(message) {
    super(message);
    this.name = "Cache Error";
  }
};

// src/cache.ts
var InMemoryCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  get(key) {
    return __async(this, null, function* () {
      const entry = this.cache.get(key);
      if (!entry) return null;
      if (entry.expiry < Date.now()) {
        this.cache.delete(key);
        return null;
      }
      return entry.value;
    });
  }
  set(key, value, ttlSeconds = 300) {
    return __async(this, null, function* () {
      const expiry = Date.now() + ttlSeconds * 1e3;
      this.cache.set(key, { value, expiry });
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      this.cache.delete(key);
    });
  }
};

// src/utils.ts
function retry(fn, retries = 3, delayMs = 500) {
  return __async(this, null, function* () {
    try {
      return yield fn();
    } catch (error) {
      if (retries === 0) throw error;
      yield new Promise((resolve) => setTimeout(resolve, delayMs));
      return retry(fn, retries - 1, delayMs * 2);
    }
  });
}

// src/fetchCmsContent.ts
function fetchCMSContent(options) {
  return __async(this, null, function* () {
    const {
      baseURL,
      locale = "en",
      cacheProvider = new InMemoryCache(),
      tokenCacheKey = "fetchcraft_token",
      tokenTTLSeconds = 300
    } = options;
    const api = import_axios.default.create({
      baseURL
    });
    function getToken() {
      return __async(this, null, function* () {
        const cachedToken = yield cacheProvider.get(tokenCacheKey);
        if (cachedToken) return cachedToken;
        const token = yield retry(() => __async(null, null, function* () {
          var _a;
          const res = yield api.get("/get_token");
          if (!((_a = res.data) == null ? void 0 : _a.token)) {
            throw new TokenFetchError("Token missing in response");
          }
          return res.data.token;
        }));
        yield cacheProvider.set(tokenCacheKey, token, tokenTTLSeconds);
        return token;
      });
    }
    function getContent(token) {
      return __async(this, null, function* () {
        return retry(() => __async(null, null, function* () {
          const res = yield api.get(`/get_web_content?locale=${locale}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!res.data) {
            throw new ContentFetchError("Empty content response");
          }
          return res.data;
        }));
      });
    }
    try {
      const token = yield getToken();
      const content = yield getContent(token);
      return content;
    } catch (error) {
      if (error instanceof FetchCraftError) {
        throw error;
      }
      throw new FetchCraftError(
        error instanceof Error ? error.message : String(error)
      );
    }
  });
}

// src/hooks/useFetchCms.ts
var import_react = require("react");
function useFetchCMS(options) {
  const [data, setData] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  (0, import_react.useEffect)(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchCMSContent(options).then((result) => {
      if (mounted) {
        setData(result);
      }
    }).catch((err) => {
      if (mounted) {
        setError(err);
      }
    }).finally(() => {
      if (mounted) {
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [options.baseURL, options.locale]);
  return { data, error, loading };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CacheError,
  ContentFetchError,
  FetchCraftError,
  InMemoryCache,
  TokenFetchError,
  fetchCMSContent,
  retry,
  useFetchCMS
});
