import * as THREE from 'three';
import { GeometryAnalysis, BoundingBox, Vector3, ComplexityLevel } from './types';

/**
 * Advanced geometry analyzer for 3D models
 * Calculates volume, surface area, complexity, and other metrics
 */
export class GeometryAnalyzer {
    /**
     * Analyze a Three.js BufferGeometry
     */
    static analyze(geometry: THREE.BufferGeometry): GeometryAnalysis {
        // Ensure geometry has proper attributes
        if (!geometry.attributes.position) {
            throw new Error('Geometry must have position attribute');
        }

        const positions = geometry.attributes.position.array;
        const triangleCount = positions.length / 9; // 3 vertices * 3 coords

        // Calculate volume using signed tetrahedron method
        const volume = this.calculateVolume(geometry);

        // Calculate surface area
        const surfaceArea = this.calculateSurfaceArea(geometry);

        // Calculate bounding box
        const boundingBox = this.calculateBoundingBox(geometry);

        // Determine complexity
        const complexityScore = this.calculateComplexityScore(triangleCount, surfaceArea, volume);
        const complexity = this.getComplexityLevel(complexityScore);

        // Surface to volume ratio
        const surfaceToVolumeRatio = volume > 0 ? surfaceArea / volume : 0;

        return {
            volume: Math.abs(volume),
            surfaceArea,
            triangleCount,
            boundingBox,
            complexity,
            complexityScore,
            surfaceToVolumeRatio
        };
    }

    /**
     * Calculate volume using signed tetrahedron method
     * V = (1/6) * Σ (v0 · (v1 × v2))
     */
    private static calculateVolume(geometry: THREE.BufferGeometry): number {
        const positions = geometry.attributes.position.array;
        let volume = 0;

        for (let i = 0; i < positions.length; i += 9) {
            // Get triangle vertices
            const v0 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const v1 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
            const v2 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

            // Calculate signed volume of tetrahedron formed by origin and triangle
            // V = (v0 · (v1 × v2)) / 6
            const cross = new THREE.Vector3();
            cross.crossVectors(v1, v2);
            volume += v0.dot(cross) / 6;
        }

        return volume;
    }

    /**
     * Calculate total surface area
     * Area = Σ (||AB × AC|| / 2) for each triangle
     */
    private static calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
        const positions = geometry.attributes.position.array;
        let surfaceArea = 0;

        for (let i = 0; i < positions.length; i += 9) {
            // Get triangle vertices
            const v0 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const v1 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
            const v2 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

            // Calculate vectors AB and AC
            const AB = new THREE.Vector3().subVectors(v1, v0);
            const AC = new THREE.Vector3().subVectors(v2, v0);

            // Area = ||AB × AC|| / 2
            const cross = new THREE.Vector3();
            cross.crossVectors(AB, AC);
            surfaceArea += cross.length() / 2;
        }

        return surfaceArea;
    }

    /**
     * Calculate bounding box with center and size
     */
    private static calculateBoundingBox(geometry: THREE.BufferGeometry): BoundingBox {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;

        const min: Vector3 = {
            x: box.min.x,
            y: box.min.y,
            z: box.min.z
        };

        const max: Vector3 = {
            x: box.max.x,
            y: box.max.y,
            z: box.max.z
        };

        const size: Vector3 = {
            x: max.x - min.x,
            y: max.y - min.y,
            z: max.z - min.z
        };

        const center: Vector3 = {
            x: (min.x + max.x) / 2,
            y: (min.y + max.y) / 2,
            z: (min.z + max.z) / 2
        };

        return { min, max, size, center };
    }

    /**
     * Calculate complexity score (0-100)
     * Based on triangle count and surface-to-volume ratio
     */
    private static calculateComplexityScore(
        triangleCount: number,
        surfaceArea: number,
        volume: number
    ): number {
        // Triangle count contribution (0-50 points)
        let score = 0;

        if (triangleCount < 1000) {
            score += (triangleCount / 1000) * 15;
        } else if (triangleCount < 10000) {
            score += 15 + ((triangleCount - 1000) / 9000) * 20;
        } else if (triangleCount < 100000) {
            score += 35 + ((triangleCount - 10000) / 90000) * 15;
        } else {
            score += 50;
        }

        // Surface-to-volume ratio contribution (0-50 points)
        // Higher ratio = more surface detail relative to volume = more complex
        const svRatio = volume > 0 ? surfaceArea / volume : 0;
        const normalizedRatio = Math.min(svRatio / 10, 1); // Normalize to 0-1
        score += normalizedRatio * 50;

        return Math.min(Math.round(score), 100);
    }

    /**
     * Get complexity level from score
     */
    private static getComplexityLevel(score: number): ComplexityLevel {
        if (score < 25) return 'low';
        if (score < 50) return 'medium';
        if (score < 75) return 'high';
        return 'very-high';
    }
}
