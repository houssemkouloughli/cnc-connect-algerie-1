
import { PricingService } from './pricing.service';
import { MATERIALS, FINISHES } from '../types/quote.types';
import type { GeometryData } from '../../analysis/types/analysis.types';
import * as fs from 'fs';
import * as path from 'path';

// Mock Geometry Data (Simple Cube)
const simpleGeometry: GeometryData = {
    volume: 125, // 50x50x50 mm = 125 cm3
    dimensions: '50 x 50 x 50 mm',
    vertexCount: 24,
    faceCount: 12,
    features: { holes: 0, pockets: 0, threads: 0, flatSurfaces: 6, curvedSurfaces: 0 },
    wallThickness: { min: '5.0', max: '50.0', hasThinWalls: false, warnings: [] },
    complexity: { score: 10, level: 'Simple', breakdown: { geometry: 5, features: 0, surfaces: 0, walls: 5 } },
    surfaceArea: '15000', // 6 * 50*50 = 15000 mm2
    svRatio: '1.2',
    difficultZones: [],
    recommendations: []
};

// Mock Geometry Data (Complex Part - same volume)
const complexGeometry: GeometryData = {
    ...simpleGeometry,
    features: { holes: 10, pockets: 5, threads: 2, flatSurfaces: 20, curvedSurfaces: 10 },
    complexity: { score: 80, level: 'Complexe', breakdown: { geometry: 40, features: 30, surfaces: 10, walls: 0 } },
    surfaceArea: '25000', // More surface area due to features
};

async function runTests() {
    let output = '--- Starting Pricing Engine Verification ---\n\n';

    // Test 1: Baseline (Alu 6061, Simple)
    const alu = MATERIALS.find(m => m.id === 'alu-6061')!;
    const finish = FINISHES[0]; // As machined
    const quote1 = PricingService.calculateQuote(simpleGeometry, alu, finish, 1);
    output += `Test 1: Baseline (Alu, Simple Cube)\n`;
    output += `Total: ${quote1.total} DA\n`;
    output += `Breakdown: Mat=${quote1.materialCost}, Machining=${quote1.machiningCost}, Setup=${quote1.setupCost}\n`;
    output += `Details: Time=${quote1.details.baseTime}min, Complexity=x${quote1.details.complexityFactor}\n`;
    output += '-----------------------------------\n';

    // Test 2: Material Impact (Steel 304, Simple)
    const steel = MATERIALS.find(m => m.id === 'steel-304')!;
    const quote2 = PricingService.calculateQuote(simpleGeometry, steel, finish, 1);
    output += `Test 2: Material Impact (Steel, Simple Cube)\n`;
    output += `Total: ${quote2.total} DA\n`;
    output += `Breakdown: Mat=${quote2.materialCost}, Machining=${quote2.machiningCost}\n`;
    output += `Details: Time=${quote2.details.baseTime}min (Expected > Alu), Machinability=${quote2.details.machinabilityFactor}\n`;

    const priceIncrease = ((quote2.total - quote1.total) / quote1.total) * 100;
    output += `RESULT: Steel is ${priceIncrease.toFixed(1)}% more expensive than Alu.\n`;
    output += '-----------------------------------\n';

    // Test 3: Complexity Impact (Alu, Complex)
    const quote3 = PricingService.calculateQuote(complexGeometry, alu, finish, 1);
    output += `Test 3: Complexity Impact (Alu, Complex Part)\n`;
    output += `Total: ${quote3.total} DA\n`;
    output += `Breakdown: Mat=${quote3.materialCost} (Same), Machining=${quote3.machiningCost}\n`;
    output += `Details: Time=${quote3.details.baseTime}min, Complexity=x${quote3.details.complexityFactor}\n`;

    const complexityIncrease = ((quote3.total - quote1.total) / quote1.total) * 100;
    output += `RESULT: Complex part is ${complexityIncrease.toFixed(1)}% more expensive than Simple part.\n`;
    output += '-----------------------------------\n';

    // Test 4: Quantity Discount
    const quote4 = PricingService.calculateQuote(simpleGeometry, alu, finish, 10);
    output += `Test 4: Quantity Discount (10x Alu, Simple)\n`;
    output += `Unit Price: ${quote4.total} DA (vs ${quote1.total} DA for 1)\n`;
    output += `Total Batch: ${quote4.total * 10} DA\n`;
    output += `Setup per part: ${quote4.setupCost} DA (vs ${quote1.setupCost} DA)\n`;
    output += '-----------------------------------\n';

    const outputPath = path.join(process.cwd(), 'verification_results.txt');
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Results written to ${outputPath}`);
}

runTests();
