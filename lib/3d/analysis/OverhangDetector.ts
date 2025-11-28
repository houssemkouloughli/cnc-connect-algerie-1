import * as THREE from 'three';
import type { OverhangZone } from './types';

/**
 * Overhang Detector for DFM Analysis
 * Identifies surfaces that cannot be machined without support or 5-axis
 */

export class OverhangDetector {
    private static OVERHANG_THRESHOLD = 45; // degrees from vertical

    /**
     * Detect overhang zones in geometry
     */
    static detect(geometry: THREE.BufferGeometry, threshold: number = this.OVERHANG_THRESHOLD): OverhangZone[] {
        const positions = geometry.attributes.position.array;
        const normals = geometry.attributes.normal?.array;

        if (!normals) {
            geometry.computeVertexNormals();
        }

        const overhangTriangles: number[] = [];
        const triangleAngles: number[] = [];

        // Analyze each triangle
        for (let i = 0; i < positions.length; i += 9) {
            const triangleIndex = i / 9;

            // Get triangle normal (average of 3 vertex normals)
            const n1 = new THREE.Vector3(
                normals![i], normals![i + 1], normals![i + 2]
            );
            const n2 = new THREE.Vector3(
                normals![i + 3], normals![i + 4], normals![i + 5]
            );
            const n3 = new THREE.Vector3(
                normals![i + 6], normals![i + 7], normals![i + 8]
            );

            const avgNormal = new THREE.Vector3()
                .addVectors(n1, n2)
                .add(n3)
                .divideScalar(3)
                .normalize();

            // Calculate angle from vertical (Z-axis)
            // Z component of normal indicates verticality
            // -1 = pointing down (worst), 0 = horizontal, 1 = pointing up (best)
            const zComponent = avgNormal.z;

            // Angle from vertical in degrees
            const angleFromVertical = Math.acos(Math.abs(zComponent)) * (180 / Math.PI);

            // Check if it's an overhang
            // Surfaces pointing down with angle > threshold are overhangs
            if (zComponent < 0 && angleFromVertical > threshold) {
                overhangTriangles.push(triangleIndex);
                triangleAngles.push(angleFromVertical);
            }
        }

        // Group overhangs into zones
        const zones = this.groupOverhangs(overhangTriangles, triangleAngles, geometry);

        return zones;
    }

    /**
     * Group adjacent overhang triangles into zones
     */
    private static groupOverhangs(
        triangleIndices: number[],
        angles: number[],
        geometry: THREE.BufferGeometry
    ): OverhangZone[] {
        if (triangleIndices.length === 0) {
            return [];
        }

        // For now, treat all overhangs as a single zone
        // TODO: Implement proper clustering for multiple zones
        const totalArea = this.calculateTotalArea(triangleIndices, geometry);
        const avgAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length;

        const severity = this.determineSeverity(avgAngle);

        return [{
            triangleIndices,
            area: totalArea,
            avgAngle,
            severity
        }];
    }

    /**
     * Calculate total area of triangles
     */
    private static calculateTotalArea(triangleIndices: number[], geometry: THREE.BufferGeometry): number {
        const positions = geometry.attributes.position.array;
        let totalArea = 0;

        for (const idx of triangleIndices) {
            const i = idx * 9;

            const v0 = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const v1 = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
            const v2 = new THREE.Vector3(positions[i + 6], positions[i + 7], positions[i + 8]);

            const AB = new THREE.Vector3().subVectors(v1, v0);
            const AC = new THREE.Vector3().subVectors(v2, v0);
            const cross = new THREE.Vector3().crossVectors(AB, AC);

            totalArea += cross.length() / 2;
        }

        return totalArea;
    }

    /**
     * Determine severity based on angle
     */
    private static determineSeverity(angle: number): 'mild' | 'moderate' | 'severe' {
        if (angle < 60) return 'mild';       // 45-60° - may work with 3-axis
        if (angle < 75) return 'moderate';   // 60-75° - likely needs support
        return 'severe';                      // 75-90° - definitely needs support or 5-axis
    }

    /**
     * Get overhang statistics
     */
    static getStatistics(zones: OverhangZone[], totalSurface: number): {
        percentage: number;
        requiresSupport: boolean;
        requires5Axis: boolean;
    } {
        const overhangArea = zones.reduce((sum, zone) => sum + zone.area, 0);
        const percentage = (overhangArea / totalSurface) * 100;

        // If >5% of surface is overhang, likely needs support
        const requiresSupport = percentage > 5;

        // If any severe overhangs, might need 5-axis
        const requires5Axis = zones.some(z => z.severity === 'severe');

        return {
            percentage,
            requiresSupport,
            requires5Axis
        };
    }
}
