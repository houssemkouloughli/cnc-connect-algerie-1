import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import fs from 'fs';
import path from 'path';

/**
 * Generate reference STL files for testing geometry analysis
 */

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'test-models');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const exporter = new STLExporter();

/**
 * Cube 10x10x10
 * Expected: Volume = 1000 mm³, Surface = 600 mm²
 */
function generateCube() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const mesh = new THREE.Mesh(geometry);

    const stlString = exporter.parse(mesh, { binary: true });
    const buffer = Buffer.from(stlString);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'cube_10x10x10.stl'), buffer);

    console.log('✅ Generated cube_10x10x10.stl');
    console.log('   Expected Volume: 1000 mm³');
    console.log('   Expected Surface: 600 mm²');
}

/**
 * Sphere radius=5
 * Expected: Volume ≈ 523.6 mm³, Surface ≈ 314.2 mm²
 */
function generateSphere() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const mesh = new THREE.Mesh(geometry);

    const stlString = exporter.parse(mesh, { binary: true });
    const buffer = Buffer.from(stlString);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'sphere_r5.stl'), buffer);

    const expectedVolume = (4 / 3) * Math.PI * Math.pow(5, 3);
    const expectedSurface = 4 * Math.PI * Math.pow(5, 2);

    console.log('✅ Generated sphere_r5.stl');
    console.log(`   Expected Volume: ${expectedVolume.toFixed(2)} mm³`);
    console.log(`   Expected Surface: ${expectedSurface.toFixed(2)} mm²`);
}

/**
 * Cylinder radius=5, height=10
 * Expected: Volume ≈ 785.4 mm³
 */
function generateCylinder() {
    const geometry = new THREE.CylinderGeometry(5, 5, 10, 32);
    const mesh = new THREE.Mesh(geometry);

    const stlString = exporter.parse(mesh, { binary: true });
    const buffer = Buffer.from(stlString);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'cylinder_r5_h10.stl'), buffer);

    const expectedVolume = Math.PI * Math.pow(5, 2) * 10;

    console.log('✅ Generated cylinder_r5_h10.stl');
    console.log(`   Expected Volume: ${expectedVolume.toFixed(2)} mm³`);
}

/**
 * Complex shape for complexity testing
 */
function generateComplexShape() {
    // Torus (high complexity)
    const geometry = new THREE.TorusGeometry(10, 3, 32, 64);
    const mesh = new THREE.Mesh(geometry);

    const stlString = exporter.parse(mesh, { binary: true });
    const buffer = Buffer.from(stlString);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'torus_complex.stl'), buffer);

    console.log('✅ Generated torus_complex.stl');
    console.log('   Expected Complexity: HIGH');
}

// Generate all reference files
console.log('📦 Generating reference STL files...\n');
generateCube();
generateSphere();
generateCylinder();
generateComplexShape();
console.log('\n✅ All reference files generated successfully!');
console.log(`📁 Location: ${OUTPUT_DIR}`);
