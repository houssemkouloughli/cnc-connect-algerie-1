import type { GeometryAnalysis } from '../core/types';

/**
 * DFM (Design for Manufacturing) Analysis Types
 */

export interface OverhangZone {
    triangleIndices: number[];
    area: number;              // mm²
    avgAngle: number;          // degrees from vertical
    severity: 'mild' | 'moderate' | 'severe';
}

export interface WallThicknessIssue {
    position: { x: number; y: number; z: number };
    thickness: number;         // mm
    severity: 'warning' | 'critical';
}

export interface DetectedFeature {
    type: 'hole' | 'pocket' | 'boss' | 'thread';
    position: { x: number; y: number; z: number };
    dimensions: {
        diameter?: number;
        depth?: number;
        width?: number;
        height?: number;
    };
}

export interface DFMAnalysisResult {
    // Overhang analysis
    overhangs: OverhangZone[];
    overhangPercentage: number;    // % of total surface
    requiresSupport: boolean;
    requires5Axis: boolean;

    // Wall thickness
    minWallThickness: number;      // mm
    wallThicknessIssues: WallThicknessIssue[];

    // Features
    detectedFeatures: DetectedFeature[];
    featureCount: number;

    // Overall manufacturability
    manufacturabilityScore: number; // 0-100
    recommendations: string[];
    warnings: string[];
}

export interface DFMConfig {
    overhangThreshold: number;     // degrees (default: 45)
    minWallThickness: number;      // mm (default: 1.0)
    checkWallThickness: boolean;
    detectFeatures: boolean;
}
