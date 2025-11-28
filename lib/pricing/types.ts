import type { GeometryAnalysis } from '../3d/core/types';
import type { DFMAnalysisResult } from '../3d/analysis/types';

/**
 * Pricing calculation types
 */

export interface QuoteConfig {
    material: string;
    finish: string;
    quantity: number;
    tolerance: string;
    urgency: 'standard' | 'express';
}

export interface PriceBreakdown {
    material: number;
    machining: number;
    setup: number;
    finishing: number;
    subtotal: number;
    margin: number;
    total: number;
}

export interface PriceEstimate {
    breakdown: PriceBreakdown;
    currency: 'DZD';
    perUnit: PriceBreakdown;
    totalQuantity: PriceBreakdown;
    leadTime: {
        min: number;  // days
        max: number;
    };
    confidence: 'low' | 'medium' | 'high';
    notes: string[];
}
