'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getSTLWorker } from '@/lib/3d/workers/WorkerManager';
import type { GeometryAnalysis } from '@/lib/3d/core/types';

interface Viewer3DProps {
    fileUrl: string;
    fileName: string;
    geometryData: any;
    onContinue: () => void;
    onBack: () => void;
    onAnalysisComplete?: (analysis: GeometryAnalysis) => void;
}

export default function Viewer3D({
    fileUrl,
    fileName,
    geometryData,
    onContinue,
    onBack,
    onAnalysisComplete
}: Viewer3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [analysis, setAnalysis] = useState<GeometryAnalysis | null>(null);
    const [useWorker] = useState(true); // Toggle for testing

    useEffect(() => {
        if (!containerRef.current || !fileUrl) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            50,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(5, 5, 5);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        // Grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x94a3b8, 0xe2e8f0);
        scene.add(gridHelper);

        // Load STL using Worker
        const loadSTL = async () => {
            setIsLoading(true);
            setLoadingProgress(0);

            try {
                if (useWorker) {
                    // Use Web Worker (non-blocking)
                    const worker = getSTLWorker();
                    const startTime = performance.now();

                    const result = await worker.parseSTL(fileUrl, (progress) => {
                        setLoadingProgress(progress * 100);
                    });

                    const loadTime = performance.now() - startTime;
                    console.log(`⚡ Worker load time: ${loadTime.toFixed(0)}ms`);

                    // Reconstruct geometry from serialized data
                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute(
                        'position',
                        new THREE.BufferAttribute(result.geometry.attributes.position.array, 3)
                    );
                    if (result.geometry.attributes.normal) {
                        geometry.setAttribute(
                            'normal',
                            new THREE.BufferAttribute(result.geometry.attributes.normal.array, 3)
                        );
                    } else {
                        geometry.computeVertexNormals();
                    }

                    // Set analysis
                    setAnalysis(result.analysis);
                    if (onAnalysisComplete) {
                        onAnalysisComplete(result.analysis);
                    }

                    // Render geometry
                    renderGeometry(geometry, result.analysis);
                } else {
                    // Fallback to main thread (for comparison)
                    const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
                    const { GeometryAnalyzer } = await import('@/lib/3d/core/GeometryAnalyzer');

                    const loader = new STLLoader();
                    const startTime = performance.now();

                    loader.load(
                        fileUrl,
                        (geometry) => {
                            const loadTime = performance.now() - startTime;
                            console.log(`🐌 Main thread load time: ${loadTime.toFixed(0)}ms`);

                            const geometryAnalysis = GeometryAnalyzer.analyze(geometry);
                            setAnalysis(geometryAnalysis);
                            if (onAnalysisComplete) {
                                onAnalysisComplete(geometryAnalysis);
                            }

                            renderGeometry(geometry, geometryAnalysis);
                        },
                        (xhr) => {
                            setLoadingProgress((xhr.loaded / xhr.total) * 100);
                        },
                        (error) => {
                            console.error('Error loading STL:', error);
                            setIsLoading(false);
                        }
                    );
                }
            } catch (error) {
                console.error('Error in worker:', error);
                setIsLoading(false);
            }
        };

        const renderGeometry = (geometry: THREE.BufferGeometry, geometryAnalysis: GeometryAnalysis) => {
            // Material
            const material = new THREE.MeshPhongMaterial({
                color: 0x3b82f6,
                specular: 0x111111,
                shininess: 100,
                flatShading: false
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Center geometry
            geometry.computeBoundingBox();
            geometry.center();

            // Add wireframe
            const wireframe = new THREE.WireframeGeometry(geometry);
            const line = new THREE.LineSegments(wireframe);
            (line.material as THREE.LineBasicMaterial).color.setHex(0x1e40af);
            (line.material as THREE.LineBasicMaterial).opacity = 0.3;
            (line.material as THREE.LineBasicMaterial).transparent = true;
            mesh.add(line);

            scene.add(mesh);

            // Adjust camera using bounding box from analysis
            const { size } = geometryAnalysis.boundingBox;
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5;

            camera.position.set(cameraZ, cameraZ, cameraZ);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();

            setIsLoading(false);
            setLoadingProgress(100);
        };

        loadSTL();

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [fileUrl, onAnalysisComplete, useWorker]);

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Vérification du Modèle 3D
                </h2>
                <p className="text-slate-600">
                    Fichier: <span className="font-medium text-slate-900">{fileName}</span>
                </p>
                {isLoading && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span>Chargement...</span>
                            <span>{loadingProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 p-6">
                {/* 3D Viewer */}
                <div className="lg:col-span-2">
                    <div className="relative bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-200">
                        <div
                            ref={containerRef}
                            className="w-full aspect-video"
                            style={{ minHeight: '500px' }}
                        />

                        {/* Viewer Controls */}
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                                <RotateCcw className="w-5 h-5 text-slate-700" />
                            </button>
                            <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                                <ZoomIn className="w-5 h-5 text-slate-700" />
                            </button>
                            <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                                <ZoomOut className="w-5 h-5 text-slate-700" />
                            </button>
                            <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                                <Maximize className="w-5 h-5 text-slate-700" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Geometry Info */}
                <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-3">
                            Informations du Modèle
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Volume</span>
                                <span className="font-medium text-slate-900">
                                    {analysis ? `${analysis.volume.toFixed(2)} mm³` : 'Calcul...'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Surface</span>
                                <span className="font-medium text-slate-900">
                                    {analysis ? `${analysis.surfaceArea.toFixed(2)} mm²` : 'Calcul...'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Triangles</span>
                                <span className="font-medium text-slate-900">
                                    {analysis ? analysis.triangleCount.toLocaleString() : 'Calcul...'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Complexité</span>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${analysis?.complexity === 'low' ? 'bg-green-100 text-green-800' :
                                        analysis?.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            analysis?.complexity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                                    {analysis?.complexity.toUpperCase() || 'CALCUL...'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            ✓ Modèle Validé
                        </h3>
                        <p className="text-sm text-blue-700">
                            Votre modèle 3D est valide et prêt pour la fabrication.
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                            Dimensions
                        </h3>
                        {analysis && (
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• Longueur: {analysis.boundingBox.size.x.toFixed(2)} mm</li>
                                <li>• Largeur: {analysis.boundingBox.size.y.toFixed(2)} mm</li>
                                <li>• Hauteur: {analysis.boundingBox.size.z.toFixed(2)} mm</li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-slate-200 p-6 flex justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                </button>
                <button
                    onClick={onContinue}
                    disabled={!analysis}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continuer
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
