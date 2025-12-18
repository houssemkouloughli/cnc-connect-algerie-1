import type { GeometryAnalysis } from '../core/types';

/**
 * Manager for STL Parser Web Worker
 * Provides clean interface for using worker from main thread
 */

type WorkerCallback = (data: {
    geometry?: any;
    analysis?: GeometryAnalysis;
    error?: string;
    progress?: number;
}) => void;

export class STLWorkerManager {
    private worker: Worker | null = null;
    private callbacks: Map<string, WorkerCallback> = new Map();

    constructor() {
        this.initWorker();
    }

    private initWorker() {
        try {
            this.worker = new Worker(
                new URL('../workers/stl-parser.worker.ts', import.meta.url),
                { type: 'module' }
            );

            this.worker.addEventListener('message', (event) => {
                const { type, geometry, analysis, error, progress } = event.data;

                // Handle different message types
                switch (type) {
                    case 'READY':
                        console.log('✅ STL Worker ready');
                        break;

                    case 'PARSE_COMPLETE':
                    case 'ANALYZE_COMPLETE':
                        this.callbacks.forEach(cb => cb({ geometry, analysis }));
                        break;

                    case 'PROGRESS':
                        this.callbacks.forEach(cb => cb({ progress }));
                        break;

                    case 'ERROR':
                        console.error('Worker error:', error);
                        this.callbacks.forEach(cb => cb({ error }));
                        break;
                }
            });

            this.worker.addEventListener('error', (error) => {
                console.error('Worker error:', error);
                this.callbacks.forEach(cb => cb({ error: error.message }));
            });

        } catch (error) {
            console.warn('Web Worker not supported, falling back to main thread');
            this.worker = null;
        }
    }

    /**
     * Parse STL file in worker thread
     */
    async parseSTL(
        fileUrl: string,
        onProgress?: (progress: number) => void
    ): Promise<{ geometry: any; analysis: GeometryAnalysis }> {
        const worker = this.worker;
        if (!worker) {
            throw new Error('Worker not initialized');
        }

        return new Promise((resolve, reject) => {
            const callbackId = Math.random().toString(36);

            const callback: WorkerCallback = ({ geometry, analysis, error, progress }) => {
                if (error) {
                    this.callbacks.delete(callbackId);
                    reject(new Error(error));
                } else if (progress !== undefined && onProgress) {
                    onProgress(progress);
                } else if (geometry && analysis) {
                    this.callbacks.delete(callbackId);
                    resolve({ geometry, analysis });
                }
            };

            this.callbacks.set(callbackId, callback);

            worker.postMessage({
                type: 'PARSE_STL',
                fileUrl
            });
        });
    }

    /**
     * Terminate worker
     */
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.callbacks.clear();
        }
    }

    /**
     * Check if worker is available
     */
    isAvailable(): boolean {
        return this.worker !== null;
    }
}

// Singleton instance
let workerInstance: STLWorkerManager | null = null;

export function getSTLWorker(): STLWorkerManager {
    if (!workerInstance) {
        workerInstance = new STLWorkerManager();
    }
    return workerInstance;
}
