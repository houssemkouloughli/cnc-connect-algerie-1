export type MaterialCategory = 'metal' | 'plastic';

export type Material = {
    id: string;
    name: string;
    category: MaterialCategory;
    description: string;
    density: number; // g/cm3
    basePricePerCm3: number; // DA
    machinabilityFactor: number; // 1.0 = Standard (Alu), >1.0 = Harder, <1.0 = Easier
    properties: {
        strength: number; // 1-10
        weight: number; // 1-10
        corrosion: number; // 1-10
    };
};

export type Finish = {
    id: string;
    name: string;
    description: string;
    priceMultiplier: number;
    compatibleMaterials: string[]; // IDs of compatible materials
};

export const MATERIALS: Material[] = [
    {
        id: 'alu-6061',
        name: 'Aluminium 6061',
        category: 'metal',
        description: 'Alliage polyvalent, bonne résistance à la corrosion et soudabilité.',
        density: 2.7,
        basePricePerCm3: 150,
        machinabilityFactor: 1.0, // Reference standard
        properties: { strength: 6, weight: 3, corrosion: 8 }
    },
    {
        id: 'alu-7075',
        name: 'Aluminium 7075',
        category: 'metal',
        description: 'Très haute résistance mécanique, comparable à certains aciers.',
        density: 2.81,
        basePricePerCm3: 220,
        machinabilityFactor: 1.1, // Slightly harder than 6061
        properties: { strength: 9, weight: 3, corrosion: 6 }
    },
    {
        id: 'steel-304',
        name: 'Acier Inox 304',
        category: 'metal',
        description: 'Excellente résistance à la corrosion, standard alimentaire.',
        density: 8.0,
        basePricePerCm3: 300,
        machinabilityFactor: 2.5, // Much harder to machine
        properties: { strength: 8, weight: 8, corrosion: 9 }
    },
    {
        id: 'pom-c',
        name: 'POM-C (Delrin)',
        category: 'plastic',
        description: 'Plastique technique, faible friction, bonne stabilité dimensionnelle.',
        density: 1.41,
        basePricePerCm3: 80,
        machinabilityFactor: 0.6, // Very easy to machine
        properties: { strength: 4, weight: 2, corrosion: 10 }
    },
    {
        id: 'abs',
        name: 'ABS',
        category: 'plastic',
        description: 'Plastique robuste et résistant aux chocs, économique.',
        density: 1.04,
        basePricePerCm3: 50,
        machinabilityFactor: 0.5, // Easiest
        properties: { strength: 3, weight: 1, corrosion: 7 }
    }
];

export const FINISHES: Finish[] = [
    {
        id: 'as-machined',
        name: 'Brut d\'usinage',
        description: 'Traces d\'outils visibles (Ra 3.2µm). Standard économique.',
        priceMultiplier: 1.0,
        compatibleMaterials: ['alu-6061', 'alu-7075', 'steel-304', 'pom-c', 'abs']
    },
    {
        id: 'bead-blasted',
        name: 'Microbillage',
        description: 'Aspect mat uniforme, efface les traces d\'outils.',
        priceMultiplier: 1.15,
        compatibleMaterials: ['alu-6061', 'alu-7075', 'steel-304']
    },
    {
        id: 'anodized-clear',
        name: 'Anodisation Incolore',
        description: 'Protection contre la corrosion et l\'usure (Type II).',
        priceMultiplier: 1.25,
        compatibleMaterials: ['alu-6061', 'alu-7075']
    },
    {
        id: 'anodized-black',
        name: 'Anodisation Noire',
        description: 'Protection et aspect noir esthétique (Type II).',
        priceMultiplier: 1.30,
        compatibleMaterials: ['alu-6061', 'alu-7075']
    }
];
