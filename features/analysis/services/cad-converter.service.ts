import * as THREE from 'three';

// Define types for the library since it might not have types installed
declare global {
    interface Window {
        occtimportjs: any;
    }
}

interface OCCTMesh {
    name: string;
    color: [number, number, number];
    loc: number[]; // Matrix4 elements
    brep_faces: {
        first: number;
        last: number;
    }[];
}

interface OCCTResult {
    meshes: OCCTMesh[];
    buffer_geometry: {
        attributes: {
            position: { array: Float32Array; itemSize: number };
            normal: { array: Float32Array; itemSize: number };
            index: { array: Uint16Array | Uint32Array; itemSize: number };
        };
    };
}

let occt: any = null;

export const initOCCT = async () => {
    if (occt) return occt;

    try {
        // We need to use the global window object or a specific loader pattern
        // The library expects to be loaded via a script tag or dynamic import that sets a global or returns a module
        // Since we copied the file to public, we can try to load it via import() if it's an ES module, 
        // OR we might need to rely on the fact that we installed it via npm.

        // Let's try the npm import first, but we need to configure the WASM locator
        const occtModule = await import('occt-import-js');

        occt = await occtModule.default({
            locateFile: (name: string) => {
                return `/${name}`; // Serve from public root
            }
        });
        return occt;
    } catch (e) {
        console.error("Failed to load OCCT", e);
        throw new Error("Impossible de charger le moteur de conversion CAD.");
    }
};

export const convertCADToGeometry = async (fileBuffer: ArrayBuffer, fileName: string): Promise<THREE.BufferGeometry> => {
    const occtInstance = await initOCCT();

    console.log("OCCT Instance:", occtInstance);

    if (!occtInstance.FS) {
        console.error("FS not found on occtInstance", Object.keys(occtInstance));
        throw new Error("Le système de fichiers WASM (FS) n'est pas initialisé.");
    }

    // Write file to virtual FS
    try {
        occtInstance.FS.createDataFile('/', fileName, new Uint8Array(fileBuffer), true, true, true);
    } catch (e) {
        console.warn("File might already exist, trying to overwrite or proceed", e);
    }

    // Read file
    const result = occtInstance.readFile(fileName);

    // Clean up virtual FS
    try {
        occtInstance.FS.unlink('/' + fileName);
    } catch (e) {
        // Ignore unlink errors
    }

    if (!result || !result.meshes || result.meshes.length === 0) {
        throw new Error("Aucune géométrie trouvée dans le fichier.");
    }

    // Convert to Three.js Geometry
    const bufferGeometry = new THREE.BufferGeometry();

    const posAttr = result.buffer_geometry.attributes.position;
    const normAttr = result.buffer_geometry.attributes.normal;
    const idxAttr = result.buffer_geometry.attributes.index;

    if (posAttr) {
        bufferGeometry.setAttribute('position', new THREE.BufferAttribute(posAttr.array, posAttr.itemSize));
    }
    if (normAttr) {
        bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normAttr.array, normAttr.itemSize));
    }
    if (idxAttr) {
        bufferGeometry.setIndex(new THREE.BufferAttribute(idxAttr.array, 1));
    }

    // Compute bounding box / sphere if needed
    bufferGeometry.computeBoundingBox();
    bufferGeometry.computeBoundingSphere();

    return bufferGeometry;
};
