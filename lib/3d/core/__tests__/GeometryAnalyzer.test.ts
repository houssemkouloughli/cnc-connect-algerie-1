import { GeometryAnalyzer } from '../GeometryAnalyzer';
import * as THREE from 'three';

describe('GeometryAnalyzer', () => {
    describe('Volume Calculation', () => {
        it('should calculate cube volume correctly', () => {
            // Create a 10x10x10 cube (expected volume = 1000 mm³)
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            // Allow 0.1% tolerance
            expect(analysis.volume).toBeCloseTo(1000, 1);
        });

        it('should calculate sphere volume correctly', () => {
            // Sphere with radius 5 (V = 4/3 * π * r³ = ~523.6 mm³)
            const geometry = new THREE.SphereGeometry(5, 32, 32);
            const analysis = GeometryAnalyzer.analyze(geometry);

            const expectedVolume = (4 / 3) * Math.PI * Math.pow(5, 3);

            // Sphere approximation with 32 segments, allow 1% tolerance
            expect(analysis.volume).toBeCloseTo(expectedVolume, 0);
        });

        it('should calculate cylinder volume correctly', () => {
            // Cylinder radius=5, height=10 (V = π * r² * h = ~785.4 mm³)
            const geometry = new THREE.CylinderGeometry(5, 5, 10, 32);
            const analysis = GeometryAnalyzer.analyze(geometry);

            const expectedVolume = Math.PI * Math.pow(5, 2) * 10;

            // Cylinder approximation, allow 1% tolerance
            expect(analysis.volume).toBeCloseTo(expectedVolume, 0);
        });

        it('should handle negative volume (inside-out geometry)', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            // Flip normals to create inside-out geometry
            geometry.scale(-1, 1, 1);

            const analysis = GeometryAnalyzer.analyze(geometry);

            // Should return absolute value
            expect(analysis.volume).toBeGreaterThan(0);
            expect(analysis.volume).toBeCloseTo(1000, 1);
        });
    });

    describe('Surface Area Calculation', () => {
        it('should calculate cube surface area correctly', () => {
            // 10x10x10 cube (surface = 6 * 10² = 600 mm²)
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            expect(analysis.surfaceArea).toBeCloseTo(600, 1);
        });

        it('should calculate sphere surface area correctly', () => {
            // Sphere radius=5 (A = 4 * π * r² = ~314.2 mm²)
            const geometry = new THREE.SphereGeometry(5, 32, 32);
            const analysis = GeometryAnalyzer.analyze(geometry);

            const expectedArea = 4 * Math.PI * Math.pow(5, 2);

            // Allow 2% tolerance for tessellation
            const tolerance = expectedArea * 0.02;
            expect(Math.abs(analysis.surfaceArea - expectedArea)).toBeLessThan(tolerance);
        });
    });

    describe('Bounding Box Calculation', () => {
        it('should calculate correct bounding box for cube', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            const { size, center } = analysis.boundingBox;

            expect(size.x).toBeCloseTo(10, 6);
            expect(size.y).toBeCloseTo(10, 6);
            expect(size.z).toBeCloseTo(10, 6);

            // Centered at origin
            expect(center.x).toBeCloseTo(0, 6);
            expect(center.y).toBeCloseTo(0, 6);
            expect(center.z).toBeCloseTo(0, 6);
        });

        it('should calculate correct bounding box for offset geometry', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            geometry.translate(5, 5, 5);

            const analysis = GeometryAnalyzer.analyze(geometry);

            const { min, max, center } = analysis.boundingBox;

            expect(min.x).toBeCloseTo(0, 6);
            expect(min.y).toBeCloseTo(0, 6);
            expect(min.z).toBeCloseTo(0, 6);

            expect(max.x).toBeCloseTo(10, 6);
            expect(max.y).toBeCloseTo(10, 6);
            expect(max.z).toBeCloseTo(10, 6);

            expect(center.x).toBeCloseTo(5, 6);
            expect(center.y).toBeCloseTo(5, 6);
            expect(center.z).toBeCloseTo(5, 6);
        });
    });

    describe('Complexity Detection', () => {
        it('should detect low complexity for simple cube', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            expect(analysis.triangleCount).toBe(12); // Cube has 12 triangles (2 per face)
            expect(analysis.complexity).toBe('low');
        });

        it('should detect higher complexity for high-poly sphere', () => {
            // High detail sphere
            const geometry = new THREE.SphereGeometry(5, 64, 64);
            const analysis = GeometryAnalyzer.analyze(geometry);

            expect(analysis.triangleCount).toBeGreaterThan(1000);
            expect(['medium', 'high', 'very-high']).toContain(analysis.complexity);
        });

        it('should assign complexity score between 0 and 100', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            expect(analysis.complexityScore).toBeGreaterThanOrEqual(0);
            expect(analysis.complexityScore).toBeLessThanOrEqual(100);
        });
    });

    describe('Triangle Count', () => {
        it('should count triangles correctly', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            // Box has 6 faces, 2 triangles per face = 12 triangles
            expect(analysis.triangleCount).toBe(12);
        });

        it('should handle complex geometries', () => {
            const geometry = new THREE.SphereGeometry(5, 16, 16);
            const analysis = GeometryAnalyzer.analyze(geometry);

            expect(analysis.triangleCount).toBeGreaterThan(0);
            expect(Number.isInteger(analysis.triangleCount)).toBe(true);
        });
    });

    describe('Surface to Volume Ratio', () => {
        it('should calculate S/V ratio correctly', () => {
            const geometry = new THREE.BoxGeometry(10, 10, 10);
            const analysis = GeometryAnalyzer.analyze(geometry);

            // S/V = 600 / 1000 = 0.6
            expect(analysis.surfaceToVolumeRatio).toBeCloseTo(0.6, 2);
        });

        it('should have higher S/V ratio for thin objects', () => {
            // Thin plate: 100x100x1
            const thinGeometry = new THREE.BoxGeometry(100, 100, 1);
            const thinAnalysis = GeometryAnalyzer.analyze(thinGeometry);

            // Thick block: 10x10x10
            const thickGeometry = new THREE.BoxGeometry(10, 10, 10);
            const thickAnalysis = GeometryAnalyzer.analyze(thickGeometry);

            // Thin object should have higher S/V ratio
            expect(thinAnalysis.surfaceToVolumeRatio).toBeGreaterThan(thickAnalysis.surfaceToVolumeRatio);
        });
    });

    describe('Error Handling', () => {
        it('should throw error for geometry without position attribute', () => {
            const emptyGeometry = new THREE.BufferGeometry();

            expect(() => {
                GeometryAnalyzer.analyze(emptyGeometry);
            }).toThrow('Geometry must have position attribute');
        });
    });
});
