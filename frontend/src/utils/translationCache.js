/**
 * Translation Cache
 * Multi-layer caching using IndexedDB (primary) and localStorage (fallback)
 */

const DB_NAME = 'translationCache';
const STORE_NAME = 'translations';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB limit

let db = null;
let useIndexedDB = true;

/**
 * Initialize IndexedDB
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            useIndexedDB = false;
            resolve(null);
            return;
        }

        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => {
            console.warn('IndexedDB not available, using localStorage fallback');
            useIndexedDB = false;
            resolve(null);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

/**
 * Generate cache key
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {string} - Cache key
 */
export const getCacheKey = (text, sourceLang, targetLang) => {
    const encodedText = btoa(unescape(encodeURIComponent(text)));
    return `${sourceLang}_${targetLang}_${encodedText}`;
};

/**
 * Get translation from cache
 * @param {string} key - Cache key
 * @returns {Promise<string|null>} - Cached translation or null
 */
export const getFromCache = async (key) => {
    try {
        if (useIndexedDB && db) {
            return await getFromIndexedDB(key);
        } else {
            return getFromLocalStorage(key);
        }
    } catch (error) {
        console.warn('Cache read error:', error);
        return null;
    }
};

/**
 * Get from IndexedDB
 */
const getFromIndexedDB = (key) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = (event) => {
            const result = event.target.result;

            if (!result) {
                resolve(null);
                return;
            }

            // Check if expired
            if (Date.now() - result.timestamp > CACHE_TTL) {
                // Remove expired entry
                deleteFromCache(key);
                resolve(null);
                return;
            }

            // Validate: reject if translation equals original
            if (result.translation === result.original) {
                deleteFromCache(key);
                resolve(null);
                return;
            }

            resolve(result.translation);
        };

        request.onerror = () => reject(request.error);
    });
};

/**
 * Get from localStorage
 */
const getFromLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(`trans_${key}`);
        if (!item) return null;

        const parsed = JSON.parse(item);

        // Check if expired
        if (Date.now() - parsed.timestamp > CACHE_TTL) {
            localStorage.removeItem(`trans_${key}`);
            return null;
        }

        // Validate: reject if translation equals original
        if (parsed.translation === parsed.original) {
            localStorage.removeItem(`trans_${key}`);
            return null;
        }

        return parsed.translation;
    } catch (error) {
        return null;
    }
};

/**
 * Save translation to cache
 * @param {string} key - Cache key
 * @param {string} original - Original text
 * @param {string} translation - Translated text
 */
export const saveToCache = async (key, original, translation) => {
    // Don't cache if translation equals original
    if (translation === original) {
        return;
    }

    try {
        if (useIndexedDB && db) {
            await saveToIndexedDB(key, original, translation);
        } else {
            saveToLocalStorage(key, original, translation);
        }
    } catch (error) {
        console.warn('Cache write error:', error);
    }
};

/**
 * Save to IndexedDB
 */
const saveToIndexedDB = (key, original, translation) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.put({
            key,
            original,
            translation,
            timestamp: Date.now(),
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Save to localStorage
 */
const saveToLocalStorage = (key, original, translation) => {
    try {
        const item = JSON.stringify({
            original,
            translation,
            timestamp: Date.now(),
        });
        localStorage.setItem(`trans_${key}`, item);
    } catch (error) {
        // Handle quota exceeded
        if (error.name === 'QuotaExceededError') {
            cleanupLocalStorageCache();
            try {
                localStorage.setItem(`trans_${key}`, JSON.stringify({
                    original,
                    translation,
                    timestamp: Date.now(),
                }));
            } catch (e) {
                console.warn('Unable to save to cache after cleanup');
            }
        }
    }
};

/**
 * Delete from cache
 * @param {string} key - Cache key
 */
export const deleteFromCache = async (key) => {
    try {
        if (useIndexedDB && db) {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.delete(key);
        } else {
            localStorage.removeItem(`trans_${key}`);
        }
    } catch (error) {
        console.warn('Cache delete error:', error);
    }
};

/**
 * Get multiple translations from cache
 * @param {string[]} keys - Array of cache keys
 * @returns {Promise<Object>} - Map of key to translation
 */
export const getBatchFromCache = async (keys) => {
    const results = {};

    for (const key of keys) {
        const translation = await getFromCache(key);
        if (translation !== null) {
            results[key] = translation;
        }
    }

    return results;
};

/**
 * Save multiple translations to cache
 * @param {Array} items - Array of { key, original, translation }
 */
export const saveBatchToCache = async (items) => {
    for (const item of items) {
        await saveToCache(item.key, item.original, item.translation);
    }
};

/**
 * Cleanup expired entries from IndexedDB
 */
export const cleanupExpiredEntries = async () => {
    if (!useIndexedDB || !db) {
        cleanupLocalStorageCache();
        return;
    }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const now = Date.now();
        const expireTime = now - CACHE_TTL;

        const range = IDBKeyRange.upperBound(expireTime);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                resolve();
            }
        };

        request.onerror = () => reject(request.error);
    });
};

/**
 * Cleanup localStorage cache
 */
const cleanupLocalStorageCache = () => {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('trans_')) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (now - item.timestamp > CACHE_TTL) {
                    keysToRemove.push(key);
                }
            } catch (e) {
                keysToRemove.push(key);
            }
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
export const getCacheStats = async () => {
    if (useIndexedDB && db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const countRequest = store.count();

            countRequest.onsuccess = () => {
                resolve({
                    type: 'indexedDB',
                    entries: countRequest.result,
                });
            };

            countRequest.onerror = () => reject(countRequest.error);
        });
    } else {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('trans_')) {
                count++;
            }
        }

        return {
            type: 'localStorage',
            entries: count,
        };
    }
};

/**
 * Clear all cache
 */
export const clearCache = async () => {
    if (useIndexedDB && db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } else {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('trans_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
};

// Initialize DB on load
initDB().then(() => {
    console.log('Translation cache initialized');
    // Run cleanup periodically
    setInterval(cleanupExpiredEntries, 60 * 60 * 1000); // Every hour
}).catch(console.error);

export default {
    getCacheKey,
    getFromCache,
    saveToCache,
    deleteFromCache,
    getBatchFromCache,
    saveBatchToCache,
    cleanupExpiredEntries,
    getCacheStats,
    clearCache,
};
