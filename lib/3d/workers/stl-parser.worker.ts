/// <reference lib="webworker" />

import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GeometryAnalyzer } from '../core/GeometryAnalyzer';
import type { GeometryAnalysis } from '../core/types';

/**
 * Web Worker for parsing STL files and analyzing geometry
 * Runs in separate thread to avoid blocking UI
 */

interface WorkerMessage {
    type: 'PARSE_STL' | 'ANALYZE';
    fileUrl?: string;
    geometryData?: any;
}

interface WorkerResponse {
    type: 'PARSE_COMPLETE' | 'ANALYZE_COMPLETE' | 'ERROR';
    geometry?: any;
    analysis?: GeometryAnalysis;
    error?: string;
    progress?: number;
}

const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
    const { type, fileUrl, geometryData } = event.data;

    try {
        switch (type) {
            case 'PARSE_STL': {
                if (!fileUrl) {
                    throw new Error('File URL required');
                }

                // Parse STL file
                const loader = new STLLoader();

                // Send progress update
                ctx.postMessage({
                    type: 'PROGRESS',
                    progress: 0.3
                } as WorkerResponse);

                const geometry = await new Promise((resolve, reject) => {
                    loader.load(
                        fileUrl,
                        (geom) => resolve(geom),
                        (xhr) => {
                            const progress = (xhr.loaded / xhr.total) * 0.5;
                            ctx.postMessage({
                                type: 'PROGRESS',
                                progress
                            } as WorkerResponse);
                        },
                        (error) => reject(error)
                    );
                });

                ctx.postMessage({
                    type: 'PROGRESS',
                    progress: 0.7
                } as WorkerResponse);

                // Analyze geometry
                const analysis = GeometryAnalyzer.analyze(geometry as any);

                ctx.postMessage({
                    type: 'PROGRESS',
                    progress: 0.9
                } as WorkerResponse);

                // Serialize geometry for transfer
                const serializedGeometry = {
                    attributes: {
                        position: {
                            array: (geometry as any).attributes.position.array,
                            itemSize: (geometry as any).attributes.position.itemSize
                        },
                        normal: (geometry as any).attributes.normal ? {
                            array: (geometry as any).attributes.normal.array,
                            itemSize: (geometry as any).attributes.normal.itemSize
                        } : null
                    }
                };

                // Send result with transferable for zero-copy
                ctx.postMessage({
                    type: 'PARSE_COMPLETE',
                    geometry: serializedGeometry,
                    analysis
                } as WorkerResponse, [
                    serializedGeometry.attributes.position.array.buffer,
                    ...(serializedGeometry.attributes.normal ? [serializedGeometry.attributes.normal.array.buffer] : [])
                ]);

                break;
            }

            case 'ANALYZE': {
                if (!geometryData) {
                    throw new Error('Geometry data required');
                }

                // Reconstruct geometry and analyze
                // This case is for when geometry is already loaded
                const analysis = GeometryAnalyzer.analyze(geometryData);

                ctx.postMessage({
                    type: 'ANALYZE_COMPLETE',
                    analysis
                } as WorkerResponse);

                break;
            }

            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error: any) {
        ctx.postMessage({
            type: 'ERROR',
            error: error.message || 'Unknown error occurred'
        } as WorkerResponse);
    }
});

// Notify that worker is ready
ctx.postMessage({ type: 'READY' });
