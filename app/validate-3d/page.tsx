'use client';

import { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import Viewer3D from '../devis/components/Viewer3D';
import type { GeometryAnalysis } from '@/lib/3d/core/types';

interface TestCase {
    name: string;
    file: string;
    expected: {
        volume: number;
        surface: number;
        complexity: string;
    };
    tolerance: number; // percentage
}

const TEST_CASES: TestCase[] = [
    {
        name: 'Cube 10×10×10',
        file: '/test-models/cube_10x10x10.stl',
        expected: {
            volume: 1000,
            surface: 600,
            complexity: 'low'
        },
        tolerance: 0.1 // 0.1%
    },
    {
        name: 'Sphere R=5',
        file: '/test-models/sphere_r5.stl',
        expected: {
            volume: 523.60,
            surface: 314.16,
            complexity: 'medium'
        },
        tolerance: 1 // 1% for tessellation
    },
    {
        name: 'Cylinder R=5 H=10',
        file: '/test-models/cylinder_r5_h10.stl',
        expected: {
            volume: 785.40,
            surface: 0, // Will calculate
            complexity: 'medium'
        },
        tolerance: 1
    },
    {
        name: 'Torus (Complex)',
        file: '/test-models/torus_complex.stl',
        expected: {
            volume: 0, // Will calculate
            surface: 0,
            complexity: 'high'
        },
        tolerance: 2
    }
];

export default function ValidationPage() {
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [results, setResults] = useState<Array<{
        test: TestCase;
        actual: GeometryAnalysis | null;
        pass: boolean;
        error?: number;
    }>>([]);

    const currentTest = TEST_CASES[currentTestIndex];

    const handleAnalysis = (analysis: GeometryAnalysis) => {
        const volumeError = currentTest.expected.volume > 0
            ? Math.abs((analysis.volume - currentTest.expected.volume) / currentTest.expected.volume) * 100
            : 0;

        const surfaceError = currentTest.expected.surface > 0
            ? Math.abs((analysis.surfaceArea - currentTest.expected.surface) / currentTest.expected.surface) * 100
            : 0;

        const volumePass = volumeError <= currentTest.tolerance;
        const surfacePass = currentTest.expected.surface === 0 || surfaceError <= currentTest.tolerance;
        const complexityPass = analysis.complexity === currentTest.expected.complexity || currentTest.expected.complexity === '';

        const pass = volumePass && surfacePass && complexityPass;

        setResults(prev => [...prev, {
            test: currentTest,
            actual: analysis,
            pass,
            error: Math.max(volumeError, surfaceError)
        }]);

        // Auto-advance to next test
        if (currentTestIndex < TEST_CASES.length - 1) {
            setTimeout(() => setCurrentTestIndex(prev => prev + 1), 2000);
        }
    };

    const passedTests = results.filter(r => r.pass).length;
    const totalTests = results.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        🧪 Validation Moteur 3D
                    </h1>
                    <p className="text-slate-600">
                        Tests automatiques de précision des calculs géométriques
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Progression</h2>
                        <span className="text-2xl font-bold text-blue-600">
                            {passedTests} / {totalTests} ✅
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(totalTests / TEST_CASES.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Current Test */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Viewer */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Test {currentTestIndex + 1}: {currentTest.name}
                        </h3>
                        <Viewer3D
                            fileUrl={currentTest.file}
                            fileName={currentTest.name}
                            geometryData={null}
                            onContinue={() => { }}
                            onBack={() => { }}
                            onAnalysisComplete={handleAnalysis}
                        />
                    </div>

                    {/* Expected vs Actual */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Résultats</h3>
                        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
                            {currentTest.expected.volume > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-600">Volume</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="text-xs text-blue-600 mb-1">Attendu</div>
                                            <div className="font-semibold text-blue-900">
                                                {currentTest.expected.volume.toFixed(2)} mm³
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="text-xs text-slate-600 mb-1">Calculé</div>
                                            <div className="font-semibold text-slate-900">
                                                {results[currentTestIndex]?.actual?.volume.toFixed(2) || '...'} mm³
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentTest.expected.surface > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-600">Surface</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="text-xs text-blue-600 mb-1">Attendu</div>
                                            <div className="font-semibold text-blue-900">
                                                {currentTest.expected.surface.toFixed(2)} mm²
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <div className="text-xs text-slate-600 mb-1">Calculé</div>
                                            <div className="font-semibold text-slate-900">
                                                {results[currentTestIndex]?.actual?.surfaceArea.toFixed(2) || '...'} mm²
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {results[currentTestIndex] && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${results[currentTestIndex].pass
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                    }`}>
                                    {results[currentTestIndex].pass ? (
                                        <>
                                            <Check className="w-6 h-6 text-green-600" />
                                            <div>
                                                <div className="font-semibold text-green-900">Test Passé ✅</div>
                                                <div className="text-sm text-green-700">
                                                    Erreur: {results[currentTestIndex].error?.toFixed(2)}%
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-6 h-6 text-red-600" />
                                            <div>
                                                <div className="font-semibold text-red-900">Test Échoué ❌</div>
                                                <div className="text-sm text-red-700">
                                                    Erreur: {results[currentTestIndex].error?.toFixed(2)}% (max: {currentTest.tolerance}%)
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Results */}
                {results.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Tous les Résultats</h3>
                        <div className="space-y-2">
                            {results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg flex items-center justify-between ${result.pass ? 'bg-green-50' : 'bg-red-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {result.pass ? (
                                            <Check className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-600" />
                                        )}
                                        <span className="font-medium">{result.test.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm text-slate-600">
                                            Volume: {result.actual?.volume.toFixed(2)} mm³
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            Erreur: {result.error?.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {totalTests === TEST_CASES.length && (
                    <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center">
                        <h2 className="text-3xl font-bold mb-2">
                            {passedTests === totalTests ? '🎉 Tous les tests passés !' : '⚠️ Certains tests ont échoué'}
                        </h2>
                        <p className="text-blue-100">
                            Précision globale: {passedTests} / {totalTests} tests réussis
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
