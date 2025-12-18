import * as THREE from 'three';
import occtimportjs from 'occt-import-js';

/**
 * Parse STEP/IGES file to Three.js BufferGeometry
 * Uses occt-import-js WebAssembly library
 */
export async function parseSTEPFile(file: File): Promise<THREE.BufferGeometry> {
    try {
        // Initialize occt-import-js
        const occt = await occtimportjs();

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);

        // Determine file type
        const fileName = file.name.toLowerCase();
        const isSTEP = fileName.endsWith('.stp') || fileName.endsWith('.step');
        const isIGES = fileName.endsWith('.igs') || fileName.endsWith('.iges');

        if (!isSTEP && !isIGES) {
            throw new Error('Unsupported file format');
        }

        // Parse the file
        const result = occt.ReadStepFile(fileBuffer, null);

        if (!result.success) {
            throw new Error('Failed to parse STEP/IGES file');
        }

        // Convert to Three.js geometry
        const geometry = new THREE.BufferGeometry();

        // Extract vertices (positions)
        const positions = new Float32Array(result.meshes[0].attributes.position.array);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Extract normals if available
        if (result.meshes[0].attributes.normal) {
            const normals = new Float32Array(result.meshes[0].attributes.normal.array);
            geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        } else {
            geometry.computeVertexNormals();
        }

        // Extract indices if available
        if (result.meshes[0].index) {
            const indices = new Uint32Array(result.meshes[0].index.array);
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        }

        return geometry;
    } catch (error) {
        console.error('Error parsing STEP/IGES file:', error);
        throw new Error('Unable to parse STEP/IGES file. Please check the file format.');
    }
}

/**
 * Parse STL file to Three.js BufferGeometry
 * Uses native Three.js STLLoader
 */
export async function parseSTLFile(file: File): Promise<THREE.BufferGeometry> {
    const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');

    return new Promise((resolve, reject) => {
        const loader = new STLLoader();
        const fileUrl = URL.createObjectURL(file);

        loader.load(
            fileUrl,
            (geometry) => {
                URL.revokeObjectURL(fileUrl);
                resolve(geometry);
            },
            undefined,
            (error) => {
                URL.revokeObjectURL(fileUrl);
                reject(error);
            }
        );
    });
}

/**
 * Parse any supported CAD file format
 */
export async function parseCADFile(file: File): Promise<THREE.BufferGeometry> {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.stl')) {
        return parseSTLFile(file);
    } else if (fileName.endsWith('.stp') || fileName.endsWith('.step') ||
        fileName.endsWith('.igs') || fileName.endsWith('.iges')) {
        return parseSTEPFile(file);
    } else {
        throw new Error('Unsupported file format');
    }
}
