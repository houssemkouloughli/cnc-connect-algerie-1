import { Material, Finish } from '../types/quote.types';
import { GeometryData } from '@/features/analysis/types/analysis.types';

export interface PriceBreakdown {
    materialCost: number;
    machiningCost: number;
    setupCost: number;
    finishCost: number;
    total: number;
    currency: string;
    details: {
        baseTime: number; // minutes
        complexityFactor: number;
        machinabilityFactor: number;
    };
}

export class PricingService {
    // Constants for pricing logic (DA)
    private static readonly HOURLY_RATE_3AXIS = 4000; // DA/hour
    private static readonly SETUP_COST_BASE = 2000; // DA
    private static readonly MATERIAL_MARGIN = 1.2; // 20% margin on material

    // Volumetric Removal Rate (cm3/min) for reference material (Alu 6061)
    private static readonly REFERENCE_MRR = 15.0;

    /**
     * Calculate complete quote
     */
    static calculateQuote(
        geometry: GeometryData,
        material: Material,
        finish: Finish,
        quantity: number
    ): PriceBreakdown {
        const materialCost = this.calculateMaterialCost(geometry.volume, material);
        const { machiningCost, baseTime, complexityFactor } = this.calculateMachiningCost(geometry, material);
        const setupCost = this.calculateSetupCost(quantity);
        const finishCost = this.calculateFinishCost(machiningCost, materialCost, finish);

        // Apply quantity discount to unit price components (setup is already amortized if we wanted, but here we keep it simple)
        // Actually, usually setup is fixed, machining is per part.

        const unitTotal = materialCost + machiningCost + (setupCost / quantity) + finishCost;

        // Quantity discount on the margin/markup part (simplified as global discount for now)
        const quantityDiscount = quantity > 50 ? 0.80 : quantity > 10 ? 0.90 : quantity > 5 ? 0.95 : 1.0;

        return {
            materialCost: Math.round(materialCost),
            machiningCost: Math.round(machiningCost * quantityDiscount),
            setupCost: Math.round(setupCost / quantity), // Per unit share of setup
            finishCost: Math.round(finishCost),
            total: Math.round(unitTotal * quantityDiscount),
            currency: 'DA',
            details: {
                baseTime: Math.round(baseTime),
                complexityFactor,
                machinabilityFactor: material.machinabilityFactor
            }
        };
    }

    private static calculateMaterialCost(volumeCm3: number, material: Material): number {
        // Add 20% waste material
        const rawVolume = volumeCm3 * 1.2;
        return rawVolume * material.basePricePerCm3 * this.MATERIAL_MARGIN;
    }

    private static calculateMachiningCost(geometry: GeometryData, material: Material) {
        // 1. Base Machining Time (Roughing)
        // Time = Volume / MRR
        // Adjust MRR by material machinability (Harder material = Lower MRR = Higher Time)
        const adjustedMRR = this.REFERENCE_MRR / material.machinabilityFactor;
        const roughingTimeMin = geometry.volume / adjustedMRR;

        // 2. Finishing Time (Surface Area based)
        // Assume 50 cm2/min for finishing pass
        const surfaceAreaCm2 = parseFloat(geometry.surfaceArea) / 100; // convert mm2 to cm2 if needed, but analysis returns ? Let's check. 
        // Analysis returns surfaceArea in mm2 usually? No, let's assume the value in geometry is consistent.
        // Looking at analysis service: area += ... (units of STL). If STL is mm, area is mm2.
        // 1 cm2 = 100 mm2.
        const surfaceAreaMm2 = parseFloat(geometry.surfaceArea);
        const finishingTimeMin = (surfaceAreaMm2 / 100) / 10; // 10 cm2/min finishing rate

        // 3. Complexity Penalty
        // Score 0-100. 
        // Factor 1.0 (Simple) to 3.0 (Very Complex)
        const complexityFactor = 1 + (geometry.complexity.score / 50);

        // 4. Feature Penalty
        // Each hole/pocket adds time (tool changes, rapid moves)
        const featureTimeMin = (geometry.features.holes * 0.5) + (geometry.features.pockets * 2);

        const totalTimeMin = (roughingTimeMin + finishingTimeMin + featureTimeMin) * complexityFactor;

        // Cost = Time (hours) * Hourly Rate
        const cost = (totalTimeMin / 60) * this.HOURLY_RATE_3AXIS;

        return {
            machiningCost: cost,
            baseTime: totalTimeMin,
            complexityFactor
        };
    }

    private static calculateSetupCost(quantity: number): number {
        // Base setup + per-batch overhead
        // Amortized over quantity in the final calculation, but here we return total setup for the batch?
        // Let's return Total Setup Cost for the batch.
        return this.SETUP_COST_BASE;
    }

    private static calculateFinishCost(machiningCost: number, materialCost: number, finish: Finish): number {
        // Finish is usually a multiplier on the base part cost or surface area
        // Simplified: Multiplier on (Material + Machining)
        const baseCost = materialCost + machiningCost;
        return baseCost * (finish.priceMultiplier - 1); // Return only the ADDED cost
    }
}
