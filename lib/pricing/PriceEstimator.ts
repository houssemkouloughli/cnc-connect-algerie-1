import type { GeometryAnalysis } from '../3d/core/types';
import type { DFMAnalysisResult } from '../3d/analysis/types';
import type { QuoteConfig, PriceEstimate, PriceBreakdown } from './types';
import { MATERIALS, FINISHES, MACHINING_RATES, SETUP_COSTS } from './MaterialCosts';

/**
 * Intelligent price estimation engine
 * Based on geometry analysis, material, and manufacturing requirements
 */
export class PriceEstimator {
    /**
     * Calculate comprehensive price estimate
     */
    static estimate(
        geometry: GeometryAnalysis,
        dfm: DFMAnalysisResult | null,
        config: QuoteConfig
    ): PriceEstimate {
        // Get material data
        const material = MATERIALS[config.material];
        if (!material) {
            throw new Error(`Unknown material: ${config.material}`);
        }

        const finish = FINISHES[config.finish];
        if (!finish) {
            throw new Error(`Unknown finish: ${config.finish}`);
        }

        // Calculate each component
        const materialCost = this.calculateMaterialCost(geometry, material);
        const machiningCost = this.calculateMachiningCost(geometry, dfm, material);
        const setupCost = this.calculateSetupCost(geometry.complexity);
        const finishingCost = this.calculateFinishingCost(geometry, finish);

        // Calculate per-unit breakdown
        const perUnit: PriceBreakdown = {
            material: materialCost,
            machining: machiningCost,
            setup: setupCost / config.quantity, // Amortize setup over quantity
            finishing: finishingCost,
            subtotal: 0,
            margin: 0,
            total: 0
        };

        perUnit.subtotal = perUnit.material + perUnit.machining + perUnit.setup + perUnit.finishing;
        perUnit.margin = perUnit.subtotal * 0.25; // 25% margin
        perUnit.total = perUnit.subtotal + perUnit.margin;

        // Calculate total for quantity
        const totalQuantity: PriceBreakdown = {
            material: materialCost * config.quantity,
            machining: machiningCost * config.quantity,
            setup: setupCost, // Setup is one-time
            finishing: finishingCost * config.quantity,
            subtotal: 0,
            margin: 0,
            total: 0
        };

        totalQuantity.subtotal = totalQuantity.material + totalQuantity.machining + totalQuantity.setup + totalQuantity.finishing;
        totalQuantity.margin = totalQuantity.subtotal * 0.25;
        totalQuantity.total = totalQuantity.subtotal + totalQuantity.margin;

        // Estimate lead time
        const leadTime = this.estimateLeadTime(geometry, config);

        // Determine confidence
        const confidence = this.determineConfidence(geometry, dfm);

        // Generate notes
        const notes = this.generateNotes(geometry, dfm, config);

        return {
            breakdown: perUnit,
            currency: 'DZD',
            perUnit,
            totalQuantity,
            leadTime,
            confidence,
            notes
        };
    }

    /**
     * Calculate material cost
     */
    private static calculateMaterialCost(geometry: GeometryAnalysis, material: any): number {
        // Volume in cm³ (convert from mm³)
        const volumeCm3 = geometry.volume / 1000;

        // Mass in kg
        const massKg = (volumeCm3 * material.density) / 1000;

        // Apply waste factor (bounding box approach)
        const boxVolume = geometry.boundingBox.size.x *
            geometry.boundingBox.size.y *
            geometry.boundingBox.size.z;
        const boxVolumeCm3 = boxVolume / 1000;
        const stockMassKg = (boxVolumeCm3 * material.density) / 1000;

        // Cost = stock material needed
        return stockMassKg * material.pricePerKg * material.wasteFactor;
    }

    /**
     * Calculate machining cost
     */
    private static calculateMachiningCost(
        geometry: GeometryAnalysis,
        dfm: DFMAnalysisResult | null,
        material: any
    ): number {
        // Base machining time estimation
        // Factors: surface area, complexity, machinability

        // Surface area in m²
        const surfaceM2 = geometry.surfaceArea / 1000000;

        // Base time: ~1 hour per 0.01 m² for standard complexity
        let baseTimeHours = surfaceM2 * 100;

        // Adjust for complexity
        const complexityMultiplier = 1 + (geometry.complexityScore / 100);
        baseTimeHours *= complexityMultiplier;

        // Adjust for material machinability
        baseTimeHours /= material.machinability;

        // Determine axis requirement
        let machineType: '3-axis' | '4-axis' | '5-axis' = '3-axis';
        if (dfm?.requires5Axis) {
            machineType = '5-axis';
        } else if (dfm?.requiresSupport) {
            machineType = '4-axis';
        }

        const hourlyRate = MACHINING_RATES[machineType];

        return baseTimeHours * hourlyRate;
    }

    /**
     * Calculate setup cost
     */
    private static calculateSetupCost(complexity: string): number {
        if (complexity === 'low') return SETUP_COSTS.simple;
        if (complexity === 'medium') return SETUP_COSTS.medium;
        return SETUP_COSTS.complex;
    }

    /**
     * Calculate finishing cost
     */
    private static calculateFinishingCost(geometry: GeometryAnalysis, finish: any): number {
        // Surface area in m²
        const surfaceM2 = geometry.surfaceArea / 1000000;
        return surfaceM2 * finish.costPerM2;
    }

    /**
     * Estimate lead time
     */
    private static estimateLeadTime(geometry: GeometryAnalysis, config: QuoteConfig): { min: number; max: number } {
        let baseDays = 5; // Standard lead time

        // Adjust for complexity
        if (geometry.complexity === 'high' || geometry.complexity === 'very-high') {
            baseDays += 3;
        }

        // Adjust for quantity
        if (config.quantity > 10) {
            baseDays += Math.ceil(config.quantity / 10) * 2;
        }

        // Adjust for urgency
        if (config.urgency === 'express') {
            baseDays = Math.ceil(baseDays * 0.6); // 40% faster
        }

        return {
            min: baseDays,
            max: baseDays + 3
        };
    }

    /**
     * Determine confidence level
     */
    private static determineConfidence(
        geometry: GeometryAnalysis,
        dfm: DFMAnalysisResult | null
    ): 'low' | 'medium' | 'high' {
        // High confidence for simple, well-analyzed parts
        if (!dfm) return 'low';

        if (geometry.complexity === 'low' && !dfm.requiresSupport) {
            return 'high';
        }

        if (geometry.complexity === 'medium' && dfm.manufacturabilityScore > 70) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Generate helpful notes
     */
    private static generateNotes(
        geometry: GeometryAnalysis,
        dfm: DFMAnalysisResult | null,
        config: QuoteConfig
    ): string[] {
        const notes: string[] = [];

        // Volume discount
        if (config.quantity >= 10) {
            const discount = Math.min(20, config.quantity * 0.5);
            notes.push(`💰 Remise quantité: -${discount.toFixed(0)}% sur le setup`);
        }

        // DFM warnings
        if (dfm?.requires5Axis) {
            notes.push('⚠️ Usinage 5-axes requis (coût majoré)');
        }

        // Material notes
        const material = MATERIALS[config.material];
        if (material.machinability < 0.7) {
            notes.push('⚙️ Matériau difficile à usiner (temps majoré)');
        }

        // Confidence note
        notes.push('📊 Prix estimatif - devis final sera établi par les partenaires');

        return notes;
    }
}
