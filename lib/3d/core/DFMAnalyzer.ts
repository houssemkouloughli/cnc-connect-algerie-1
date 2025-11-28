import * as THREE from 'three';
import { OverhangDetector } from '../analysis/OverhangDetector';
import type { DFMAnalysisResult, DFMConfig } from '../analysis/types';
import type { GeometryAnalysis } from './types';

/**
 * Main DFM Analyzer that coordinates all DFM checks
 */
export class DFMAnalyzer {
    /**
     * Perform complete DFM analysis
     */
    static analyze(
        geometry: THREE.BufferGeometry,
        geometryAnalysis: GeometryAnalysis,
        config: Partial<DFMConfig> = {}
    ): DFMAnalysisResult {
        const fullConfig: DFMConfig = {
            overhangThreshold: config.overhangThreshold ?? 45,
            minWallThickness: config.minWallThickness ?? 1.0,
            checkWallThickness: config.checkWallThickness ?? false,
            detectFeatures: config.detectFeatures ?? false
        };

        // 1. Overhang Detection
        const overhangZones = OverhangDetector.detect(geometry, fullConfig.overhangThreshold);
        const overhangStats = OverhangDetector.getStatistics(overhangZones, geometryAnalysis.surfaceArea);

        // 2. Wall Thickness (placeholder for now)
        const minWallThickness = 0; // TODO: Implement
        const wallThicknessIssues: any[] = [];

        // 3. Feature Detection (placeholder for now)
        const detectedFeatures: any[] = [];

        // 4. Calculate manufacturability score
        const manufacturabilityScore = this.calculateManufacturabilityScore(
            overhangStats.percentage,
            minWallThickness,
            fullConfig
        );

        // 5. Generate recommendations and warnings
        const { recommendations, warnings } = this.generateRecommendations(
            overhangStats,
            overhangZones,
            minWallThickness,
            fullConfig
        );

        return {
            overhangs: overhangZones,
            overhangPercentage: overhangStats.percentage,
            requiresSupport: overhangStats.requiresSupport,
            requires5Axis: overhangStats.requires5Axis,
            minWallThickness,
            wallThicknessIssues,
            detectedFeatures,
            featureCount: detectedFeatures.length,
            manufacturabilityScore,
            recommendations,
            warnings
        };
    }

    /**
     * Calculate manufacturability score (0-100)
     */
    private static calculateManufacturabilityScore(
        overhangPercentage: number,
        minWallThickness: number,
        config: DFMConfig
    ): number {
        let score = 100;

        // Penalty for overhangs
        if (overhangPercentage > 20) {
            score -= 40;
        } else if (overhangPercentage > 10) {
            score -= 25;
        } else if (overhangPercentage > 5) {
            score -= 10;
        }

        // Penalty for thin walls (when implemented)
        if (config.checkWallThickness && minWallThickness < config.minWallThickness) {
            score -= 20;
        }

        return Math.max(0, score);
    }

    /**
     * Generate recommendations and warnings
     */
    private static generateRecommendations(
        overhangStats: any,
        overhangZones: any[],
        minWallThickness: number,
        config: DFMConfig
    ): { recommendations: string[]; warnings: string[] } {
        const recommendations: string[] = [];
        const warnings: string[] = [];

        // Overhang recommendations
        if (overhangStats.requires5Axis) {
            warnings.push(`Overhangs sévères détectés (${overhangStats.percentage.toFixed(1)}% de la surface)`);
            recommendations.push('Envisager usinage 5-axes ou supports de fabrication');
        } else if (overhangStats.requiresSupport) {
            warnings.push(`Overhangs modérés (${overhangStats.percentage.toFixed(1)}% de la surface)`);
            recommendations.push('Réorientation de la pièce recommandée pour réduire les overhangs');
        } else if (overhangZones.length > 0) {
            recommendations.push(`Overhangs mineurs détectés mais usinables en 3-axes`);
        } else {
            recommendations.push('✓ Géométrie optimale pour usinage 3-axes standard');
        }

        return { recommendations, warnings };
    }
}
