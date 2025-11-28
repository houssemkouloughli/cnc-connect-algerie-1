/**
 * Material costs and properties for pricing
 * Prices in DZD (Algerian Dinar)
 */

export interface MaterialData {
    name: string;
    density: number;        // g/cm³
    pricePerKg: number;     // DZD/kg
    wasteFactor: number;    // multiplier for material waste
    machinability: number;  // 0-1, affects machining time
}

export const MATERIALS: Record<string, MaterialData> = {
    'aluminum-6061': {
        name: 'Aluminium 6061-T6',
        density: 2.7,
        pricePerKg: 1200,
        wasteFactor: 1.3,      // 30% waste from stock
        machinability: 0.9     // Easy to machine
    },
    'aluminum-7075': {
        name: 'Aluminium 7075-T6',
        density: 2.81,
        pricePerKg: 2800,
        wasteFactor: 1.3,
        machinability: 0.85
    },
    'steel-mild': {
        name: 'Acier Doux',
        density: 7.85,
        pricePerKg: 600,
        wasteFactor: 1.25,
        machinability: 0.7
    },
    'stainless-304': {
        name: 'Inox 304',
        density: 8.0,
        pricePerKg: 2500,
        wasteFactor: 1.25,
        machinability: 0.6
    },
    'brass': {
        name: 'Laiton',
        density: 8.5,
        pricePerKg: 1800,
        wasteFactor: 1.2,
        machinability: 0.95
    },
    'abs-plastic': {
        name: 'Plastique ABS',
        density: 1.05,
        pricePerKg: 800,
        wasteFactor: 1.15,
        machinability: 1.0
    }
};

export const FINISHES: Record<string, { name: string; costPerM2: number }> = {
    'as-machined': {
        name: 'Brut d\'usinage',
        costPerM2: 0
    },
    'bead-blast': {
        name: 'Sablage',
        costPerM2: 500
    },
    'anodize': {
        name: 'Anodisation (Aluminium)',
        costPerM2: 1500
    },
    'powder-coat': {
        name: 'Peinture poudre',
        costPerM2: 1200
    },
    'polish': {
        name: 'Polissage',
        costPerM2: 2000
    }
};

// CNC machining rates (DZD per hour)
export const MACHINING_RATES = {
    '3-axis': 3500,     // CNC 3 axes standard
    '4-axis': 5000,     // CNC 4 axes
    '5-axis': 8000      // CNC 5 axes
};

// Setup costs (fixed per part)
export const SETUP_COSTS = {
    simple: 2000,       // Géométrie simple
    medium: 4000,       // Géométrie moyenne
    complex: 7000       // Géométrie complexe
};
