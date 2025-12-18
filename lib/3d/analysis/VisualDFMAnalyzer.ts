import * as THREE from 'three';
import type { GeometryAnalysis } from '../core/types';

export interface ThinWallIssue {
    position: THREE.Vector3;
    thickness: number;
    severity: 'critical' | 'warning'; // critical < 1.5mm, warning < 2.5mm
}

export interface SharpCornerIssue {
    position: THREE.Vector3;
    angle: number; // Internal angle in degrees
    severity: 'critical' | 'warning'; // critical < 90°, warning < 120°
}

export interface VisualDFMResult {
    thinWalls: ThinWallIssue[];
    sharpCorners: SharpCornerIssue[];
    deepPockets: { position: THREE.Vector3; depth: number }[];
    overallSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Enhanced DFM analyzer with visual feedback capabilities
 */
export class VisualDFMAnalyzer {
    /**
     * Detect thin walls (simplified detection - full implementation requires voxelization)
     */
    static detectThinWalls(
        geometry: THREE.BufferGeometry,
        minThickness: number = 2.5
    ): ThinWallIssue[] {
        const issues: ThinWallIssue[] = [];
        const positions = geometry.attributes.position;

        // Simplified check: sample points and check local density
        // In production, use proper voxel-based wall thickness analysis
        for (let i = 0; i < Math.min(positions.count, 100); i += 10) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            // Check nearby geometry density (simplified)
            const localDensity = this.checkLocalDensity(geometry, new THREE.Vector3(x, y, z));

            if (localDensity < 0.3) { // Arbitrary threshold for demo
                const estimatedThickness = localDensity * 10; // Simplified

                estimation

                issues.push({
                    position: new THREE.Vector3(x, y, z),
                    thickness: estimatedThickness,
                    severity: estimatedThickness < 1.5 ? 'critical' : 'warning'
                });
            }
        }

        return issues;
    }

    /**
     * Detect sharp internal corners that require small-radius tools
     */
    static detectSharpCorners(geometry: THREE.BufferGeometry): SharpCornerIssue[] {
        const issues: SharpCornerIssue[] = [];
        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;

        if (!normals) return issues;

        // Sample vertices and check angle changes
        for (let i = 0; i < Math.min(positions.count - 1, 100); i += 5) {
            const n1 = new THREE.Vector3(
                normals.getX(i),
                normals.getY(i),
                normals.getZ(i)
            );

            const n2 = new THREE.Vector3(
                normals.getX(i + 1),
                normals.getY(i + 1),
                normals.getZ(i + 1)
            );

            // Calculate angle between normals
            const angle = Math.acos(n1.dot(n2)) * (180 / Math.PI);

            // Internal corner if angle is sharp and normals change direction significantly
            if (angle > 30 && angle < 150) { // Potential corner
                const severity = angle < 90 ? 'critical' : 'warning';

                issues.push({
                    position: new THREE.Vector3(
                        positions.getX(i),
                        positions.getY(i),
                        positions.getZ(i)
                    ),
                    angle,
                    severity
                });
            }
        }

        return issues.slice(0, 10); // Limit for performance
    }

    /**
     * Check local geometry density (simplified)
     */
    private static checkLocalDensity(
        geometry: THREE.BufferGeometry,
        point: THREE.Vector3,
        radius: number = 5
    ): number {
        const positions = geometry.attributes.position;
        let nearby = 0;

        for (let i = 0; i < positions.count; i++) {
            const p = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );

            if (p.distanceTo(point) < radius) {
                nearby++;
            }
        }

        return nearby / 100; // Normalized
    }

    /**
     * Perform complete visual DFM analysis
     */
    static analyzeForVisualization(
        geometry: THREE.BufferGeometry,
        geometryAnalysis: GeometryAnalysis
    ): VisualDFMResult {
        const thinWalls = this.detectThinWalls(geometry);
        const sharpCorners = this.detectSharpCorners(geometry);

        // Calculate overall severity
        let overallSeverity: VisualDFMResult['overallSeverity'] = 'none';

        const criticalIssues = [
            ...thinWalls.filter(w => w.severity === 'critical'),
            ...sharpCorners.filter(c => c.severity === 'critical')
        ];

        const warningIssues = [
            ...thinWalls.filter(w => w.severity === 'warning'),
            ...sharpCorners.filter(c => c.severity === 'warning')
        ];

        if (criticalIssues.length > 5) {
            overallSeverity = 'critical';
        } else if (criticalIssues.length > 0) {
            overallSeverity = 'high';
        } else if (warningIssues.length > 5) {
            overallSeverity = 'medium';
        } else if (warningIssues.length > 0) {
            overallSeverity = 'low';
        }

        return {
            thinWalls,
            sharpCorners,
            deepPockets: [], // TODO: Implement pocket detection
            overallSeverity
        };
    }

    /**
     * Get color for severity level
     */
    static getSeverityColor(severity: 'critical' | 'warning'): string {
        return severity === 'critical' ? '#ef4444' : '#f59e0b'; // red-500 : amber-500
    }

    /**
     * Get human-readable message for issue
     */
    static getIssueMessage(issue: ThinWallIssue | SharpCornerIssue): string {
        if ('thickness' in issue) {
            return `Paroi fine: ${issue.thickness.toFixed(1)}mm (min recommandé: 2.5mm)`;
        } else {
            return `Angle vif: ${issue.angle.toFixed(0)}° (difficulté d'usinage)`;
        }
    }
}
