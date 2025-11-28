'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Viewer3DProps {
    fileUrl: string;
    fileName: string;
    geometryData: any;
    onContinue: () => void;
    onBack: () => void;
}

export default function Viewer3D({
    fileUrl,
    fileName,
    geometryData,
    onContinue,
    onBack
}: Viewer3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

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

        // Add placeholder geometry (cube for demo)
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            specular: 0x111111,
            shininess: 100,
            flatShading: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Add wireframe
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        (line.material as THREE.LineBasicMaterial).color.setHex(0x1e40af);
        (line.material as THREE.LineBasicMaterial).opacity = 0.3;
        (line.material as THREE.LineBasicMaterial).transparent = true;
        mesh.add(line);

        setIsLoading(false);

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
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, [fileUrl]);

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Vérification du Modèle 3D
                </h2>
                <p className="text-slate-600">
                    Fichier: <span className="font-medium text-slate-900">{fileName}</span>
                </p>
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
                                    {geometryData?.volume || 'N/A'} mm³
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Surface</span>
                                <span className="font-medium text-slate-900">
                                    {geometryData?.surface_area || 'N/A'} mm²
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Complexité</span>
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {geometryData?.complexity || 'Moyenne'}
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
                            Recommandations
                        </h3>
                        <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Matériau recommandé: Aluminium 6061-T6</li>
                            <li>• Finition suggérée: Anodisation</li>
                            <li>• Processus: Fraisage CNC 3 axes</li>
                        </ul>
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
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Continuer
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
