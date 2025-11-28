import type { GeometryAnalysis } from '../core/types';

/**
 * IndexedDB cache for parsed geometries and analysis results
 * Provides instant reload for previously analyzed files
 */

interface CachedGeometry {
    fileHash: string;
    fileName: string;
    fileSize: number;
    geometry: {
        positions: Float32Array;
        normals?: Float32Array;
    };
    analysis: GeometryAnalysis;
    timestamp: number;
}

export class GeometryCache {
    private dbName = 'cnc-geometry-cache';
    private storeName = 'geometries';
    private db: IDBDatabase | null = null;
    private maxCacheSize = 100 * 1024 * 1024; // 100MB

    constructor() {
        this.init();
    }

    /**
     * Initialize IndexedDB
     */
    private async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'fileHash' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('fileSize', 'fileSize', { unique: false });
                }
            };
        });
    }

    /**
     * Calculate SHA-256 hash of file
     */
    async hashFile(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Get cached geometry by file hash
     */
    async get(fileHash: string): Promise<CachedGeometry | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(fileHash);

            request.onsuccess = () => {
                const cached = request.result;
                if (cached) {
                    console.log('✅ Cache HIT:', cached.fileName);
                    // Update timestamp (LRU)
                    this.updateTimestamp(fileHash);
                } else {
                    console.log('❌ Cache MISS');
                }
                resolve(cached || null);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Store geometry in cache
     */
    async set(
        fileHash: string,
        fileName: string,
        fileSize: number,
        geometry: { positions: Float32Array; normals?: Float32Array },
        analysis: GeometryAnalysis
    ): Promise<void> {
        if (!this.db) await this.init();

        // Check cache size and evict if necessary
        await this.evictIfNeeded(fileSize);

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const cached: CachedGeometry = {
                fileHash,
                fileName,
                fileSize,
                geometry,
                analysis,
                timestamp: Date.now()
            };

            const request = store.put(cached);

            request.onsuccess = () => {
                console.log('💾 Cached:', fileName, `(${(fileSize / 1024).toFixed(0)} KB)`);
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update timestamp for LRU
     */
    private async updateTimestamp(fileHash: string): Promise<void> {
        if (!this.db) return;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(fileHash);

            request.onsuccess = () => {
                const cached = request.result;
                if (cached) {
                    cached.timestamp = Date.now();
                    store.put(cached);
                }
                resolve();
            };
        });
    }

    /**
     * Get total cache size
     */
    private async getTotalSize(): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const total = request.result.reduce((sum, item) => sum + item.fileSize, 0);
                resolve(total);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Evict oldest entries if cache size exceeds limit
     */
    private async evictIfNeeded(newFileSize: number): Promise<void> {
        const currentSize = await this.getTotalSize();

        if (currentSize + newFileSize <= this.maxCacheSize) {
            return; // No eviction needed
        }

        console.log('🗑️ Cache full, evicting old entries...');

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            const request = index.openCursor();

            let freedSpace = 0;
            const neededSpace = (currentSize + newFileSize) - this.maxCacheSize;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;

                if (cursor && freedSpace < neededSpace) {
                    const item = cursor.value as CachedGeometry;
                    console.log('  Evicting:', item.fileName);

                    cursor.delete();
                    freedSpace += item.fileSize;
                    cursor.continue();
                } else {
                    console.log(`  Freed ${(freedSpace / 1024).toFixed(0)} KB`);
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('🗑️ Cache cleared');
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        count: number;
        totalSize: number;
        oldestEntry: number;
    }> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const items = request.result;
                const totalSize = items.reduce((sum, item) => sum + item.fileSize, 0);
                const oldestEntry = items.length > 0
                    ? Math.min(...items.map(item => item.timestamp))
                    : 0;

                resolve({
                    count: items.length,
                    totalSize,
                    oldestEntry
                });
            };

            request.onerror = () => reject(request.error);
        });
    }
}

// Singleton instance
let cacheInstance: GeometryCache | null = null;

export function getGeometryCache(): GeometryCache {
    if (!cacheInstance) {
        cacheInstance = new GeometryCache();
    }
    return cacheInstance;
}
