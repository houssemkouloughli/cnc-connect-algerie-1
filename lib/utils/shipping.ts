import { getWilayaByCode } from '../constants/wilayas';

// Shipping zones based on geographical proximity
const SHIPPING_ZONES = {
    // Major cities (hubs)
    hubs: ['16', '31', '25', '19', '06'], // Alger, Oran, Constantine, Sétif, Béjaïa

    // North (coastal and nearby)
    north: ['02', '09', '10', '13', '15', '18', '21', '22', '23', '24', '26', '27', '35', '36', '42', '43', '44', '46', '48'],

    // High Plateaus
    plateaus: ['03', '04', '05', '07', '12', '14', '17', '20', '28', '29', '34', '38', '40', '41'],

    // South
    south: ['01', '08', '11', '30', '32', '33', '37', '39', '45', '47', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58'],
};

/**
 * Calculate shipping cost between two wilayas
 * @param fromWilaya - Origin wilaya code
 * @param toWilaya - Destination wilaya code
 * @param weightKg - Package weight in kg (default 5kg)
 * @returns Shipping cost in DA
 */
export function calculateShippingCost(fromWilaya: string, toWilaya: string, weightKg: number = 5): number {
    // Same wilaya
    if (fromWilaya === toWilaya) {
        return 500;
    }

    const from = getWilayaByCode(fromWilaya);
    const to = getWilayaByCode(toWilaya);

    if (!from || !to) {
        return 1000; // Default fallback
    }

    // Determine zones
    const fromZone = getZone(fromWilaya);
    const toZone = getZone(toWilaya);

    let baseCost = 0;

    // Same zone
    if (fromZone === toZone) {
        baseCost = 800;
    }
    // Hub to Hub
    else if (SHIPPING_ZONES.hubs.includes(fromWilaya) && SHIPPING_ZONES.hubs.includes(toWilaya)) {
        baseCost = 1000;
    }
    // North to North or Plateaus
    else if ((fromZone === 'north' || fromZone === 'hubs') && (toZone === 'north' || toZone === 'plateaus')) {
        baseCost = 1200;
    }
    // To/From South
    else if (fromZone === 'south' || toZone === 'south') {
        baseCost = 2500;
    }
    // Default inter-zone
    else {
        baseCost = 1500;
    }

    // Weight adjustment (every kg above 5kg adds 100 DA)
    const weightSurcharge = weightKg > 5 ? (weightKg - 5) * 100 : 0;

    return baseCost + weightSurcharge;
}

function getZone(wilayaCode: string): string {
    if (SHIPPING_ZONES.hubs.includes(wilayaCode)) return 'hubs';
    if (SHIPPING_ZONES.north.includes(wilayaCode)) return 'north';
    if (SHIPPING_ZONES.plateaus.includes(wilayaCode)) return 'plateaus';
    if (SHIPPING_ZONES.south.includes(wilayaCode)) return 'south';
    return 'unknown';
}

/**
 * Get estimated delivery time in days
 */
export function getEstimatedDeliveryDays(fromWilaya: string, toWilaya: string): number {
    if (fromWilaya === toWilaya) return 1;

    const fromZone = getZone(fromWilaya);
    const toZone = getZone(toWilaya);

    if (fromZone === 'south' || toZone === 'south') return 5;
    if (fromZone === toZone) return 2;
    return 3;
}
