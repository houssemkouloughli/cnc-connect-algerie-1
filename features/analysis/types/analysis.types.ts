/**
 * Types pour l'analyse 3D et DFM (Design for Manufacturing)
 */

export type GeometryFeatures = {
    holes: number
    pockets: number
    threads: number
    flatSurfaces: number
    curvedSurfaces: number
}

export type WallThickness = {
    min: string
    max: string
    hasThinWalls: boolean
    warnings: string[]
}

export type ComplexityScore = {
    score: number
    level: 'Simple' | 'Moyen' | 'Complexe' | 'Très Complexe'
    breakdown: {
        geometry: number
        features: number
        surfaces: number
        walls: number
    }
}

export type Recommendation = {
    type: 'warning' | 'info' | 'success'
    category: string
    title: string
    message: string
    impact: string
    solution: string
}

export type GeometryData = {
    volume: number
    dimensions: string
    vertexCount: number
    faceCount: number
    features: GeometryFeatures
    wallThickness: WallThickness
    complexity: ComplexityScore
    surfaceArea: string
    svRatio: string
    difficultZones: string[]
    recommendations: Recommendation[]
    dfmResult?: {
        thinWallFaces: number[]
    }
}
