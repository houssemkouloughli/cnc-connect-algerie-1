"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Viewer3DProps {
    fileBuffer: ArrayBuffer | null;
    fileName: string | null;
    geometry: THREE.BufferGeometry | null;
    dfmMode?: boolean;
    thinWallFaces?: number[];
}

export default function Viewer3D({ fileBuffer, fileName, geometry, dfmMode = false, thinWallFaces = [] }: Viewer3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const frameIdRef = useRef<number>(0);

    // Initialize Scene
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fa);
        sceneRef.current = scene;

        // Grid
        const gridHelper = new THREE.GridHelper(200, 20, 0xe2e8f0, 0xe2e8f0);
        scene.add(gridHelper);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(50, 50, 50);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Clear previous canvas
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;
        controlsRef.current = controls;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 50, 50);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Animation Loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(frameIdRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    // Handle Geometry Updates
    useEffect(() => {
        if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;

        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;

        // Remove old mesh
        scene.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m: any) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });

        if (geometry) {
            // Center geometry
            geometry.center();
            geometry.computeVertexNormals();

            // Materials
            const standardMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x2563eb,
                metalness: 0.2,
                roughness: 0.5,
                clearcoat: 0.1,
                clearcoatRoughness: 0.1,
            });

            const errorMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000, // RED for errors
                wireframe: false
            });

            let mesh;

            if (dfmMode && thinWallFaces && thinWallFaces.length > 0) {
                // DFM Mode: Use groups to color specific faces
                geometry.clearGroups();

                // Default group (Standard)
                geometry.addGroup(0, Infinity, 0);

                // Error group (Thin Walls)
                // We need to create a group for EACH thin face range
                // Since thinWallFaces are individual indices (triangles), we group them
                // Note: This can be expensive if many fragmented faces. 
                // Optimization: Just add groups for the specific triangles.

                // Reset groups
                geometry.clearGroups();

                // Fill everything with standard first? No, groups must cover all or be specific.
                // Strategy: Iterate all faces. If in thinWallFaces, assign material 1, else 0.
                // But Three.js groups are ranges. We can't assign per-face material index easily without groups.
                // Alternative: Vertex Colors. Much faster.

                // Switch to Vertex Colors for DFM Mode
                const colors = [];
                const positionAttribute = geometry.attributes.position;
                const count = positionAttribute.count; // Total vertices

                // Initialize with Blue
                for (let i = 0; i < count; i++) {
                    colors.push(0.145, 0.388, 0.921); // RGB for #2563eb
                }

                // Color thin faces Red
                // thinWallFaces contains face indices (triangle indices)
                // Each face has 3 vertices
                for (const faceIndex of thinWallFaces) {
                    const v1 = faceIndex * 3;
                    const v2 = faceIndex * 3 + 1;
                    const v3 = faceIndex * 3 + 2;

                    // Set Red (1, 0, 0)
                    colors[v1 * 3] = 1; colors[v1 * 3 + 1] = 0; colors[v1 * 3 + 2] = 0;
                    colors[v2 * 3] = 1; colors[v2 * 3 + 1] = 0; colors[v2 * 3 + 2] = 0;
                    colors[v3 * 3] = 1; colors[v3 * 3 + 1] = 0; colors[v3 * 3 + 2] = 0;
                }

                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                const dfmMaterial = new THREE.MeshStandardMaterial({
                    vertexColors: true,
                    metalness: 0.2,
                    roughness: 0.5
                });

                mesh = new THREE.Mesh(geometry, dfmMaterial);

            } else {
                // Standard Mode
                mesh = new THREE.Mesh(geometry, standardMaterial);
            }

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);

            // Adjust Camera (only on first load, not on toggle)
            // We can check if camera is already positioned? 
            // For now, let's just re-center to be safe or maybe skip if we want to keep view.
            // Let's skip camera reset if just toggling mode? 
            // No, simple implementation first.
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            if (box) {
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
                cameraZ *= 2.5; // Zoom out a bit

                const diag = size.length();
                // Only reset if camera is at default
                if (camera.position.x === 50 && camera.position.y === 50) {
                    camera.position.set(diag, diag, diag);
                    controls.target.set(0, 0, 0);
                    controls.update();
                }
            }
        }
    }, [geometry, dfmMode, thinWallFaces]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] bg-slate-50 rounded-xl overflow-hidden shadow-inner" />
    );
}
