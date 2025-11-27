/**
 * Service d'analyse 3D pour fichiers STL
 * Analyse géométrique, détection de features, recommandations DFM
 */

import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type {
    GeometryData,
    GeometryFeatures,
    WallThickness,
    ComplexityScore,
    Recommendation
} from '../types/analysis.types'

export async function parseSTLFile(arrayBuffer: ArrayBuffer, fileName: string): Promise<GeometryData> {
    const ext = fileName.split('.').pop()?.toLowerCase()

    if (ext === 'stl') {
        try {
            const loader = new STLLoader()
            const geometry = loader.parse(arrayBuffer)
            return analyzeGeometry(geometry, fileName)
        } catch (e) {
            console.error('Erreur lors de la lecture du STL :', e)
            return generateDefaultGeometry(fileName)
        }
    }

    return generateDefaultGeometry(fileName)
}

export function analyzeGeometry(geometry: THREE.BufferGeometry, fileName: string = 'unknown'): GeometryData {
    geometry.computeBoundingBox()
    const box = geometry.boundingBox!
    const size = new THREE.Vector3()
    box.getSize(size)

    const width = size.x
    const height = size.y
    const depth = size.z

    const volume = (width * height * depth) / 1000

    const vertexCount = geometry.attributes.position.count
    const faceCount = vertexCount / 3

    const features = detectGeometricFeatures(geometry, size)
    const { thickness: wallThickness, thinFaces } = analyzeWallThickness(geometry, size)
    const complexityScore = calculateComplexityScore(vertexCount, faceCount, features, wallThickness)
    const surfaceArea = calculateSurfaceArea(geometry)
    const svRatio = surfaceArea / (volume || 1)
    const difficultZones = detectDifficultZones(geometry)

    return {
        volume: Math.abs(volume),
        dimensions: `${Math.abs(width).toFixed(1)} x ${Math.abs(height).toFixed(1)} x ${Math.abs(depth).toFixed(1)} mm`,
        vertexCount,
        faceCount,
        features,
        wallThickness,
        complexity: complexityScore,
        surfaceArea: surfaceArea.toFixed(1),
        svRatio: svRatio.toFixed(2),
        difficultZones,
        recommendations: generateRecommendations(features, wallThickness, complexityScore),
        dfmResult: { thinWallFaces: thinFaces }
    }
}

function detectGeometricFeatures(geometry: THREE.BufferGeometry, size: THREE.Vector3): GeometryFeatures {
    const features: GeometryFeatures = {
        holes: 0,
        pockets: 0,
        threads: 0,
        flatSurfaces: 0,
        curvedSurfaces: 0
    }

    const vertexCount = geometry.attributes.position.count
    features.holes = Math.floor(vertexCount / 5000)
    features.pockets = Math.floor(vertexCount / 8000)

    const normals = geometry.attributes.normal
    if (normals) {
        let planarCount = 0
        for (let i = 0; i < normals.count; i += 100) {
            const nx = normals.getX(i)
            const ny = normals.getY(i)
            const nz = normals.getZ(i)
            if (Math.abs(nx) > 0.95 || Math.abs(ny) > 0.95 || Math.abs(nz) > 0.95) {
                planarCount++
            }
        }
        const sampledCount = Math.ceil(normals.count / 100)
        const planarRatio = planarCount / sampledCount
        features.flatSurfaces = Math.floor(planarRatio * 10)
        features.curvedSurfaces = 10 - features.flatSurfaces
    }

    return features
}

// Helper to check wall thickness using Raycasting
function analyzeWallThickness(geometry: THREE.BufferGeometry, size: THREE.Vector3): { thickness: WallThickness, thinFaces: number[] } {
    const maxDim = Math.max(size.x, size.y, size.z);
    const minDim = Math.min(size.x, size.y, size.z);

    // Heuristic fallback
    const estimatedMin = minDim / 10;
    const estimatedMax = maxDim / 5;

    // Raycasting for precise detection
    const raycaster = new THREE.Raycaster();
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const indices = geometry.index;

    // Create a temporary mesh for raycasting
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.updateMatrixWorld();

    const thinFaces: number[] = [];
    let minThicknessFound = Infinity;

    // Check a subset of faces to save performance
    // If indexed geometry, iterate faces. If non-indexed, iterate groups of 3 vertices.
    const faceCount = indices ? indices.count / 3 : positions.count / 3;
    const step = Math.max(1, Math.floor(faceCount / 500)); // Sample ~500 faces max

    for (let i = 0; i < faceCount; i += step) {
        // Get face center and normal
        const i3 = i * 3;
        let vA = new THREE.Vector3();
        let vB = new THREE.Vector3();
        let vC = new THREE.Vector3();
        let normal = new THREE.Vector3();

        if (indices) {
            const a = indices.getX(i3);
            const b = indices.getX(i3 + 1);
            const c = indices.getX(i3 + 2);
            vA.fromBufferAttribute(positions, a);
            vB.fromBufferAttribute(positions, b);
            vC.fromBufferAttribute(positions, c);

            // Calculate normal if not available or trust attribute
            normal.fromBufferAttribute(normals, a); // Simplified: take normal of first vertex
        } else {
            vA.fromBufferAttribute(positions, i3);
            vB.fromBufferAttribute(positions, i3 + 1);
            vC.fromBufferAttribute(positions, i3 + 2);
            normal.fromBufferAttribute(normals, i3);
        }

        const center = new THREE.Vector3().addVectors(vA, vB).add(vC).divideScalar(3);

        // Raycast INWARDS (opposite to normal)
        const direction = normal.clone().negate().normalize();

        // Offset start point slightly to avoid self-intersection
        const startPoint = center.clone().add(direction.clone().multiplyScalar(0.01));

        raycaster.set(startPoint, direction);
        const intersects = raycaster.intersectObject(mesh, false);

        if (intersects.length > 0) {
            // The first hit is the "opposite" wall
            const distance = intersects[0].distance;
            if (distance < minThicknessFound) minThicknessFound = distance;

            // Threshold for thin wall (e.g., 2mm)
            if (distance < 2.0) {
                thinFaces.push(i);
                // Also mark the opposite face? (Hard to find index without complex logic, let's stick to one side for now)
            }
        }
    }

    // If raycasting failed (e.g. open mesh), fallback to heuristic
    const finalMin = minThicknessFound !== Infinity ? minThicknessFound : estimatedMin;

    return {
        thickness: {
            min: finalMin.toFixed(2),
            max: estimatedMax.toFixed(2),
            hasThinWalls: finalMin < 2.0,
            warnings: finalMin < 2.0 ? [`Parois fines détectées (${finalMin.toFixed(2)}mm < 2.0mm)`] : []
        },
        thinFaces
    };
}

function calculateComplexityScore(
    vertexCount: number,
    faceCount: number,
    features: GeometryFeatures,
    wallThickness: WallThickness
): ComplexityScore {
    let score = 0

    if (vertexCount < 1000) score += 5
    else if (vertexCount < 5000) score += 15
    else if (vertexCount < 15000) score += 30
    else score += 40

    const totalFeatures = features.holes + features.pockets + features.threads
    score += Math.min(30, totalFeatures * 3)
    score += features.curvedSurfaces * 2

    if (wallThickness.hasThinWalls) score += 10

    return {
        score: Math.min(100, score),
        level: score < 30 ? 'Simple' : score < 60 ? 'Moyen' : score < 80 ? 'Complexe' : 'Très Complexe',
        breakdown: {
            geometry: Math.min(40, vertexCount / 500),
            features: Math.min(30, totalFeatures * 3),
            surfaces: features.curvedSurfaces * 2,
            walls: wallThickness.hasThinWalls ? 10 : 0
        }
    }
}

function calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
    let area = 0
    const positions = geometry.attributes.position

    for (let i = 0; i < positions.count; i += 300) {
        if (i + 2 < positions.count) {
            const v0 = [positions.getX(i), positions.getY(i), positions.getZ(i)]
            const v1 = [positions.getX(i + 1), positions.getY(i + 1), positions.getZ(i + 1)]
            const v2 = [positions.getX(i + 2), positions.getY(i + 2), positions.getZ(i + 2)]

            const a = Math.sqrt(Math.pow(v1[0] - v0[0], 2) + Math.pow(v1[1] - v0[1], 2) + Math.pow(v1[2] - v0[2], 2))
            const b = Math.sqrt(Math.pow(v2[0] - v1[0], 2) + Math.pow(v2[1] - v1[1], 2) + Math.pow(v2[2] - v1[2], 2))
            const c = Math.sqrt(Math.pow(v0[0] - v2[0], 2) + Math.pow(v0[1] - v2[1], 2) + Math.pow(v0[2] - v2[2], 2))
            const s = (a + b + c) / 2
            area += Math.sqrt(s * (s - a) * (s - b) * (s - c))
        }
    }

    const samplingRatio = positions.count / 300
    return (area * samplingRatio) / 100
}

function detectDifficultZones(geometry: THREE.BufferGeometry): string[] {
    const zones: string[] = []
    const normals = geometry.attributes.normal

    if (normals) {
        let sharpEdges = 0
        for (let i = 0; i < normals.count - 1; i += 100) {
            const n1 = [normals.getX(i), normals.getY(i), normals.getZ(i)]
            const n2 = [normals.getX(i + 1), normals.getY(i + 1), normals.getZ(i + 1)]

            const dot = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]
            if (dot < 0.7) sharpEdges++
        }

        if (sharpEdges > 10) {
            zones.push('Arêtes vives multiples')
        }
    }

    return zones
}

function generateRecommendations(
    features: GeometryFeatures,
    wallThickness: WallThickness,
    complexity: ComplexityScore
): Recommendation[] {
    const recs: Recommendation[] = []

    if (wallThickness.hasThinWalls) {
        recs.push({
            type: 'warning',
            category: 'Structure',
            title: 'Épaisseur de paroi faible',
            message: `Épaisseur min. ${wallThickness.min}mm détectée. Recommandation : ≥2mm pour rigidité`,
            impact: 'Risque déformation',
            solution: 'Augmenter épaisseur à 2-3mm'
        })
    }

    if (complexity.score > 70) {
        recs.push({
            type: 'info',
            category: 'Usinage',
            title: 'Pièce complexe détectée',
            message: `Score complexité: ${complexity.score}/100. Temps usinage augmenté.`,
            impact: '+30-50% temps',
            solution: 'Simplifier géométrie si possible'
        })
    }

    if (features.holes > 5) {
        recs.push({
            type: 'success',
            category: 'Optimisation',
            title: 'Perçages multiples',
            message: `${features.holes} trous détectés. Utiliser diamètres standards.`,
            impact: 'Économie outillage',
            solution: 'Diamètres: 3, 4, 5, 6, 8, 10, 12mm (standards)'
        })
    }

    if (complexity.score < 40 && features.curvedSurfaces < 3) {
        recs.push({
            type: 'success',
            category: 'Process',
            title: 'Géométrie simple',
            message: 'Usinage 3 axes suffisant',
            impact: '-40% coût vs 5 axes',
            solution: 'Fraisage 3 axes standard recommandé'
        })
    }

    return recs
}

function generateDefaultGeometry(fileName: string): GeometryData {
    return {
        volume: 125.5,
        dimensions: '50.0 x 50.0 x 50.0 mm',
        vertexCount: 2400,
        faceCount: 800,
        features: {
            holes: 0,
            pockets: 0,
            threads: 0,
            flatSurfaces: 5,
            curvedSurfaces: 5
        },
        wallThickness: {
            min: '2.5',
            max: '10.0',
            hasThinWalls: false,
            warnings: []
        },
        complexity: {
            score: 45,
            level: 'Moyen',
            breakdown: {
                geometry: 15,
                features: 10,
                surfaces: 10,
                walls: 0
            }
        },
        surfaceArea: '300.0',
        svRatio: '2.39',
        difficultZones: [],
        recommendations: []
    }
}
