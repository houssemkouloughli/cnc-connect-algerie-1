import { LucideIcon, Settings, Cpu, Layers, ScanLine, Car, Plane, Stethoscope, Anchor, Smartphone, GraduationCap, Wrench, BookOpen, Award, PenTool, Monitor, Package, Calendar, AlertTriangle, TrendingUp } from "lucide-react";

export interface ServiceData {
    id: string;
    title: string;
    subtitle: string;
    icon: any; // Using any for icon names to be mapped later or LucideIcon if we map them directly
    description: string;
    longDescription: string;
    benefits: string[];
    steps: { title: string; desc: string; icon: any }[];
    materials: string[];
    gallery: string[];
}

export const SERVICES_DATA: Record<string, ServiceData> = {
    'cnc': {
        id: 'cnc',
        title: 'Usinage CNC',
        subtitle: 'Précision et rapidité pour vos pièces métalliques et plastiques.',
        icon: 'settings',
        description: 'Fraisage 3 & 5 axes, Tournage. Précision +/- 0.05mm.',
        longDescription: 'Notre service d\'usinage CNC offre une précision exceptionnelle pour la production de pièces complexes en métal et en plastique. Que ce soit pour des prototypes unitaires ou des séries de production, nous garantissons des tolérances serrées et une finition de surface impeccable.',
        benefits: ['Précision +/- 0.01mm', 'Fraisage 3, 4 et 5 axes', 'Tournage multi-broches', 'Finitions de surface variées'],
        steps: [
            { title: 'Importez votre fichier', desc: 'Chargez votre modèle 3D (STEP, IGES, XT) sur notre plateforme sécurisée.', icon: 'upload-cloud' },
            { title: 'Configurez & Chiffrez', desc: 'Choisissez matière, finition et quantité. Obtenez un prix instantané.', icon: 'settings' },
            { title: 'Production & Livraison', desc: 'Nous usinons vos pièces et les livrons en J+3 partout en Algérie.', icon: 'truck' }
        ],
        materials: ['Aluminium 6061-T6', 'Acier Inoxydable 304L', 'Acier C45', 'Laiton', 'PEEK', 'Delrin (POM)', 'ABS'],
        gallery: ['bg-slate-300', 'bg-slate-400', 'bg-slate-500']
    },
    '3d-print': {
        id: '3d-print',
        title: 'Impression 3D',
        subtitle: 'Prototypage rapide et production additive industrielle.',
        icon: 'cpu',
        description: 'FDM, SLA pour prototypage rapide en ABS/PLA.',
        longDescription: 'Accélérez votre développement produit grâce à nos technologies additives. Du prototypage rapide en FDM aux pièces finales en SLS ou MJF, nous couvrons tous vos besoins en polymères avec des délais ultra-courts.',
        benefits: ['Délai J+1 disponible', 'Large choix de matériaux', 'Géométries complexes', 'Sans outillage'],
        steps: [
            { title: 'Upload 3D', desc: 'Glissez votre fichier STL ou OBJ.', icon: 'upload-cloud' },
            { title: 'Sélection Techno', desc: 'FDM pour le volume, SLA pour la précision.', icon: 'layers' },
            { title: 'Impression Express', desc: 'Vos pièces imprimées et expédiées en 24/48h.', icon: 'zap' }
        ],
        materials: ['PLA Standard', 'ABS Industriel', 'Résine Standard', 'Résine Tough', 'Nylon PA12'],
        gallery: ['bg-blue-200', 'bg-blue-300', 'bg-blue-400']
    },
    'sheet-metal': {
        id: 'sheet-metal',
        title: 'Tôlerie',
        subtitle: 'Découpe et pliage de précision pour vos châssis.',
        icon: 'layers',
        description: 'Découpe Laser & Pliage pour châssis métalliques.',
        longDescription: 'Solutions complètes de tôlerie fine industrielle. Découpe laser fibre haute puissance, pliage numérique et assemblage soudé pour vos châssis, boîtiers et supports en acier, alu ou inox.',
        benefits: ['Découpe Laser Fibre', 'Pliage CNC 7 axes', 'Soudure TIG/MIG', 'Peinture époxy'],
        steps: [
            { title: 'Fichiers DXF/STEP', desc: 'Envoyez vos plans de découpe et pliage.', icon: 'file-check' },
            { title: 'Validation Technique', desc: 'Nos ingénieurs vérifient la faisabilité.', icon: 'shield-check' },
            { title: 'Fabrication', desc: 'Découpe, pliage, soudure et finition.', icon: 'factory' }
        ],
        materials: ['Acier S235', 'Alu 5754', 'Inox 304L', 'Inox 316L', 'Acier Galvanisé'],
        gallery: ['bg-amber-200', 'bg-amber-300', 'bg-amber-400']
    },
    'injection': {
        id: 'injection',
        title: 'Moulage Injection',
        subtitle: 'Production de série pour vos pièces plastiques.',
        icon: 'scan-line',
        description: 'Prototypes & Séries.',
        longDescription: 'Passez à la production de masse avec nos solutions de moulage par injection. Nous réalisons vos moules en acier ou aluminium et assurons l\'injection de vos séries en Algérie avec une qualité constante.',
        benefits: ['Moules "Low Cost" rapides', 'Grande capacité de production', 'Surmoulage', 'Large gamme de thermoplastiques'],
        steps: [
            { title: 'Conception Moule', desc: 'Étude rhéologique et conception du moule.', icon: 'box' },
            { title: 'Échantillons', desc: 'Validation des premières pièces (T0).', icon: 'check-circle' },
            { title: 'Production Série', desc: 'Injection de vos milliers de pièces.', icon: 'factory' }
        ],
        materials: ['PP', 'PEHD', 'ABS', 'PC', 'PA66'],
        gallery: ['bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400']
    }
};

export const INDUSTRIES_DATA = [
    { id: 'auto', title: 'Automobile', icon: 'car', description: 'Pièces moteurs, fixations, prototypage.' },
    { id: 'aero', title: 'Aérospatial', icon: 'plane', description: 'Composants légers, haute résistance.' },
    { id: 'medical', title: 'Médical', icon: 'stethoscope', description: 'Instruments chirurgicaux, implants.' },
    { id: 'tech', title: 'Tech & IOT', icon: 'cpu', description: 'Boîtiers, dissipateurs thermiques.' },
    { id: 'naval', title: 'Naval', icon: 'anchor', description: 'Pièces résistantes à la corrosion.' },
    { id: 'conso', title: 'Biens de Conso', icon: 'smartphone', description: 'Design produits, électroménager.' }
];

export const SCHEDULED_TRAININGS = [
    {
        id: 'TRAIN-001',
        title: 'Programmation CNC Avancée',
        instructor: 'Ing. Mohamed Benali',
        date: '2025-02-15',
        time: '09:00',
        duration: '3 jours',
        level: 'Avancé',
        price: 45000,
        seats: 20,
        booked: 12,
        location: 'Alger - Zone Industrielle Rouiba',
        description: 'Formation intensive sur la programmation G-Code et FAO avancée',
        icon: 'code-2',
        color: 'bg-blue-500'
    },
    {
        id: 'TRAIN-002',
        title: 'Maintenance Machines CNC',
        instructor: 'Ing. Karim Hamdi',
        date: '2025-02-20',
        time: '14:00',
        duration: '2 jours',
        level: 'Intermédiaire',
        price: 35000,
        seats: 15,
        booked: 8,
        location: 'Oran - Centre de Formation',
        description: 'Maintenance préventive et corrective des machines-outils CNC',
        icon: 'wrench',
        color: 'bg-green-500'
    }
];

export const TRAINING_DATA = [
    {
        id: 'fusion360-autodesk',
        title: 'Autodesk Fusion 360 - Formation Officielle',
        duration: 'Auto-rythmé',
        level: 'Débutant',
        price: 0,
        isFree: true,
        description: 'Cours officiel Autodesk CAM',
        icon: 'graduation-cap',
        color: 'bg-blue-500',
        details: 'Formation officielle Autodesk : CAO 3D, FAO, simulation et usinage. Accès gratuit aux tutoriels officiels et documentation complète.',
        url: 'https://www.autodesk.com/products/fusion-360/learn-training-tutorials'
    },
    {
        id: 'mit-opencourseware',
        title: 'MIT - Manufacturing Processes',
        duration: '12 semaines',
        level: 'Intermédiaire',
        price: 0,
        isFree: true,
        description: 'Cours MIT sur les procédés industriels',
        icon: 'book-open',
        color: 'bg-purple-500',
        details: 'Cours complet du MIT sur les processus de fabrication, l\'usinage CNC, et les technologies modernes. Inclut vidéos, exercices et examens.',
        url: 'https://ocw.mit.edu/courses/2-008-design-and-manufacturing-ii-spring-2004/'
    },
    {
        id: 'freecad-cnc',
        title: 'FreeCAD - CAM & CNC Path',
        duration: 'Auto-rythmé',
        level: 'Débutant',
        price: 0,
        isFree: true,
        description: 'Logiciel Open Source pour FAO',
        icon: 'cpu',
        color: 'bg-green-500',
        details: 'Apprenez à utiliser FreeCAD Path pour générer des parcours d\'outils CNC. 100% gratuit et open source avec documentation complète.',
        url: 'https://wiki.freecad.org/Path_Workbench'
    },
    {
        id: 'coursera-manufacturing',
        title: 'Coursera - Digital Manufacturing',
        duration: '4 semaines',
        level: 'Tous niveaux',
        price: 0,
        isFree: true,
        description: 'Fabrication numérique par University at Buffalo',
        icon: 'award',
        color: 'bg-red-500',
        details: 'Cours certifié sur la fabrication additive, CNC et technologies digitales. Audit gratuit disponible.',
        url: 'https://www.coursera.org/learn/digital-manufacturing-design-technology'
    },
    {
        id: 'haas-academy',
        title: 'Haas Automation Academy',
        duration: 'Auto-rythmé',
        level: 'Tous niveaux',
        price: 0,
        isFree: true,
        description: 'Formation CNC par Haas',
        icon: 'pen-tool',
        color: 'bg-orange-500',
        details: 'Cours gratuits du fabricant HAAS sur la programmation CNC, maintenance et opération de machines-outils.',
        url: 'https://www.haascnc.com/productivity/education.html'
    },
    {
        id: 'edx-manufacturing',
        title: 'edX - Introduction to CAD/CAM',
        duration: '6 semaines',
        level: 'Débutant',
        price: 0,
        isFree: true,
        description: 'Cours universitaire gratuit',
        icon: 'monitor',
        color: 'bg-cyan-500',
        details: 'Formation complète sur CAO/FAO par des universités renommées. Certificat payant optionnel, cours 100% gratuit.',
        url: 'https://www.edx.org/learn/computer-aided-design'
    },
    {
        id: 'cnccookbook',
        title: 'CNC Cookbook - G-Code Tutorial',
        duration: 'Auto-rythmé',
        level: 'Débutant',
        price: 0,
        isFree: true,
        description: 'Guide complet G-Code gratuit',
        icon: 'code-2',
        color: 'bg-indigo-500',
        details: 'Tutoriels détaillés sur la programmation G-Code, trucs et astuces pour optimiser vos parcours d\'usinage.',
        url: 'https://www.cnccookbook.com/cnc-g-code-programming/'
    },
    {
        id: 'solidworks-tutorials',
        title: 'SolidWorks CAM - Tutoriels Officiels',
        duration: 'Auto-rythmé',
        level: 'Intermédiaire',
        price: 0,
        isFree: true,
        description: 'Ressources SolidWorks CAM',
        icon: 'box',
        color: 'bg-pink-500',
        details: 'Documentation et tutoriels officiels SolidWorks pour la FAO et la génération de parcours d\'outils CNC.',
        url: 'https://www.solidworks.com/support/resource-center'
    }
];

export const PARTS_DATA = [
    {
        id: 'spindle',
        name: 'Broche HSD 18000 rpm',
        category: 'Broches',
        price: 450000,
        stock: 'En stock',
        image: 'bg-gradient-to-br from-slate-700 to-slate-900',
        description: 'Broche électrique haute vitesse pour fraisage aluminium'
    },
    {
        id: 'ballscrew',
        name: 'Vis à billes THK Ø32',
        category: 'Transmission',
        price: 85000,
        stock: 'En stock',
        image: 'bg-gradient-to-br from-blue-600 to-blue-800',
        description: 'Précision C3, longueur 1500mm'
    },
    {
        id: 'endmill',
        name: 'Set Fraises Carbure',
        category: 'Outils',
        price: 25000,
        stock: 'En stock',
        image: 'bg-gradient-to-br from-amber-500 to-amber-700',
        description: 'Kit 10 fraises Ø4-Ø12mm revêtement TiAlN'
    },
    {
        id: 'coolant',
        name: 'Lubrifiant Soluble 20L',
        category: 'Consommables',
        price: 12000,
        stock: 'En stock',
        image: 'bg-gradient-to-br from-green-500 to-green-700',
        description: 'Lubrifiant de coupe universel, bidon 20L'
    },
    {
        id: 'controller',
        name: 'Contrôleur Siemens 840D',
        category: 'Électronique',
        price: 850000,
        stock: 'Sur commande',
        image: 'bg-gradient-to-br from-purple-600 to-purple-800',
        description: 'Contrôleur CNC nouvelle génération'
    },
    {
        id: 'probe',
        name: 'Palpeur 3D Renishaw',
        category: 'Mesure',
        price: 320000,
        stock: 'En stock',
        image: 'bg-gradient-to-br from-red-500 to-red-700',
        description: 'Palpeur de précision sans fil'
    }
];
