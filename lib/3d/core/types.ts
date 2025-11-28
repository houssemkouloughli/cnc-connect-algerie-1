/**
 * Core types for 3D geometry analysis
 */

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface Triangle {
    v0: Vector3;
    v1: Vector3;
    v2: Vector3;
    normal: Vector3;
}

export interface BoundingBox {
    min: Vector3;
    max: Vector3;
    size: Vector3;
    center: Vector3;
}

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'very-high';

export interface GeometryAnalysis {
    // Basic measurements
    volume: number;              // in mm³
    surfaceArea: number;         // in mm²
    triangleCount: number;

    // Bounding box
    boundingBox: BoundingBox;

    // Complexity analysis
    complexity: ComplexityLevel;
    complexityScore: number;     // 0-100

    // Additional metrics
    surfaceToVolumeRatio: number;
    minWallThickness?: number;   // if applicable
}

export interface STLData {
    triangles: Triangle[];
    isBinary: boolean;
}
