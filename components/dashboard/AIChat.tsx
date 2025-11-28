"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Bonjour ! Je suis votre assistant expert CNC. Comment puis-je vous aider aujourd\'hui ? (Problème technique, devis, conseil commercial...)' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Call intelligent AI agent
            const response = await generateIntelligentResponse(input, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre un problème technique. Veuillez réessayer." }]);
        } finally {
            setLoading(false);
        }
    };

    const generateIntelligentResponse = async (userInput: string, previousMessages: Message[]): Promise<string> => {
        // Intelligent AI logic for CNC Connect
        const input = userInput.toLowerCase().trim();
        
        // Knowledge base for intelligent responses
        const knowledgeBase = {
            // Greetings & General
            greetings: {
                patterns: ['bonjour', 'salut', 'coucou', 'ça va', 'hi', 'hello'],
                responses: [
                    'Bonjour! 👋 Je suis votre assistant expert CNC Connect. Je peux vous aider avec des questions sur les commandes, les devis, les tarifs, les partenaires, ou tout ce qui concerne l\'usinage CNC.',
                    'Salut! 😊 Bienvenue sur CNC Connect. Comment puis-je vous assister aujourd\'hui?',
                ]
            },

            // Orders
            orders: {
                patterns: ['commande', 'order', 'commander', 'passer une commande', 'créer une commande', 'nouvelle commande'],
                responses: [
                    '📦 Pour passer une commande:\n1. Allez à la page "Devis"\n2. Uploadez votre fichier CAD (DWG, STEP, STL)\n3. Décrivez vos specifications\n4. Notre IA analysera votre pièce\n5. Recevez un devis instantané\n6. Validez et passer la commande\n\nVous pouvez suivre l\'état de votre commande dans "Mes Commandes"',
                    '✅ Vous pouvez créer une nouvelle commande en:\n- Cliquant sur "Nouvelle Commande" dans le dashboard\n- Uploadant votre fichier de conception\n- Attendant l\'analyse automatique\n- Validant le devis\n\nVous recevrez une confirmation par email.'
                ]
            },

            // Quotes & Pricing
            quotes: {
                patterns: ['devis', 'quote', 'prix', 'tarif', 'coût', 'combien ça coûte', 'prix usinage'],
                responses: [
                    '💰 Nos tarifs dépendent de:\n- La complexité de la pièce\n- Les matériaux utilisés (Acier, Aluminium, Laiton, etc.)\n- Les tolérances demandées\n- Le délai de livraison\n\nVous recevrez un devis instantané après upload de vos plans. Les tarifs sont compétitifs et transparent.',
                    '📊 Pour obtenir un devis:\n1. Cliquez sur "Créer un Devis"\n2. Uploadez votre fichier CAD\n3. Complétez les informations\n4. Notre système analysera automatiquement\n5. Vous recevrez un devis en quelques secondes!\n\nPas de frais caché, juste un prix clair et transparent.'
                ]
            },

            // Partners
            partners: {
                patterns: ['partenaire', 'atelier', 'fournisseur', 'réseau', 'ateliers disponibles', 'partner'],
                responses: [
                    '🏭 Nos partenaires ateliers:\n- MecaPrécision (Alger) - Spécialisé en pièces complexes\n- Oran Industries (Oran) - Ateliers de grande capacité\n- Constantine Usinage (Constantine) - Production rapide\n\nTous nos partenaires sont certifiés ISO et utilisent des machines CNC dernière génération.',
                    '✨ Vous êtes atelier? Rejoignez notre réseau de partenaires pour:\n- Augmenter votre charge de travail\n- Atteindre de nouveaux clients\n- Bénéficier d\'une plateforme de visibilité\n- Gérer facilement les commandes\n\nConsultez "Devenir Partenaire" pour plus d\'infos.'
                ]
            },

            // Technical Support
            technical: {
                patterns: ['problème technique', 'bug', 'erreur', 'ca marche pas', 'problème', 'issue', 'help', 'besoin d\'aide'],
                responses: [
                    '🔧 Problème technique détecté! Pouvez-vous me donner plus de détails sur:\n- Quelle page/fonction pose problème?\n- Quel navigateur utilisez-vous?\n- Quel message d\'erreur recevez-vous?\n\nNotre équipe technique est prête à vous aider rapidement.',
                    '⚠️ Je suis là pour vous aider! Décrivez-moi:\n- Le problème rencontré\n- Quand c\'est arrivé\n- Les étapes que vous avez suivies\n\nJe pourrai alors vous proposer une solution ou escalader vers l\'équipe support.'
                ]
            },

            // Account & Profile
            account: {
                patterns: ['compte', 'profile', 'profil', 'email', 'password', 'mot de passe', 'inscription', 'authentification'],
                responses: [
                    '👤 Gestion de compte:\n- Modifiez votre profil en cliquant sur votre avatar\n- Changez votre mot de passe en allant dans "Profil"\n- Vérifiez vos informations de contact\n- Consultez vos historiques\n\nVotre compte est sécurisé avec chiffrement SSL.',
                    '🔐 Pour votre compte:\n- Profile: Cliquez sur l\'avatar en haut à droite\n- Mot de passe: Allez dans Profil > Changer mot de passe\n- Deux facteurs: Bientôt disponible\n\nTous vos données sont protégées et confidentielles.'
                ]
            },

            // Delivery & Timing
            delivery: {
                patterns: ['délai', 'livraison', 'combien de temps', 'when', 'rapidité', 'urgent', 'express', 'durée'],
                responses: [
                    '⏱️ Délais de livraison:\n- Standard: 5-7 jours ouvrables\n- Express: 2-3 jours ouvrables\n- Ultra-rapide: 24 heures (disponible pour pièces simples)\n\nVous pouvez choisir votre délai lors de la commande. Plus court = prix légèrement plus élevé.',
                    '🚚 Livraison:\n- Toute l\'Algérie: Livraison gratuite pour commandes > 50.000 DA\n- Livraison locale Alger: 24-48h\n- Provinces: 3-5 jours\n\nVous recevrez un numéro de suivi pour chaque commande.'
                ]
            },

            // Materials
            materials: {
                patterns: ['matériau', 'material', 'acier', 'aluminium', 'laiton', 'bronze', 'quel matériau', 'métal'],
                responses: [
                    '🔩 Matériaux disponibles:\n- Acier inoxydable (316L, 304)\n- Acier doux (S235, S275)\n- Aluminium (6061, 7075)\n- Laiton (CW614N, CW625N)\n- Bronze (CuSn8, CuSn12)\n- Titane (Ti6Al4V)\n\nTous les matériaux conformes aux normes industrielles.',
                    '💎 Choix de matériau:\nCaque matériau a ses propriétés (résistance, légèreté, corrosion). Dites-moi votre application et je recommanderai le meilleur choix!'
                ]
            },

            // Specifications
            specifications: {
                patterns: ['spécification', 'tolerance', 'précision', 'dimension', 'spec', 'tolérance', 'qualité'],
                responses: [
                    '📐 Tolérances & Précision:\n- Standard: IT7 (précision moyenne)\n- Haute précision: IT6 ou mieux\n- Ultra-précision: IT5 (coûts supplémentaires)\n\nNotre équipe peut réaliser des pièces avec tolérances jusqu\'à ±0.01mm. Plus la tolérance est stricte, plus le coût augmente.',
                    '✅ Pour les spécifications:\nUploadez votre fichier CAD avec les dimensions et tolérances. Si le fichier est incomplet, notre équipe vous contactera pour clarifier.\n\nNous respectons les normes ISO et garantissons la qualité.'
                ]
            },

            // Payment
            payment: {
                patterns: ['paiement', 'payment', 'facture', 'invoice', 'carte bancaire', 'virement', 'chèque'],
                responses: [
                    '💳 Modes de paiement:\n- Carte bancaire (Visa, MasterCard)\n- Virement bancaire\n- Chèque (sur Alger)\n- Paiement à la livraison (pour clients réguliers)\n\nTous les paiements sont sécurisés avec SSL.',
                    '🏦 Facturation:\n- Facture générale automatiquement après commande\n- Devis avant paiement\n- Reçu après paiement confirmé\n\nVous pouvez télécharger vos factures dans "Mes Commandes"'
                ]
            },

            // Features & Capabilities
            features: {
                patterns: ['quoi faire', 'capacité', 'capable', 'possible', 'fonctionnalité', 'feature', 'peut-on'],
                responses: [
                    '🎯 CNC Connect peut:\n- Analyser vos fichiers CAD avec IA\n- Générer devis instantané\n- Choisir le meilleur atelier pour votre pièce\n- Gérer commandes en temps réel\n- Suivre la production\n- Livrer partout en Algérie\n\nTout automatisé et transparent!',
                    '⚡ Nos services:\n✓ Usinage CNC 3 et 5 axes\n✓ Fraisage de précision\n✓ Tournage\n✓ Filetage\n✓ Gravure laser\n✓ Livraison rapide\n✓ Support 24/7\n\nVous avez un besoin spécial? Contactez-nous!'
                ]
            },

            // Dashboard Features
            dashboard: {
                patterns: ['dashboard', 'interface', 'tableau de bord', 'menu', 'navigation', 'fonction', 'section'],
                responses: [
                    '📊 Sections du Dashboard:\n- Vue d\'ensemble: Vos KPIs\n- Commandes: Gérez vos orders\n- Clients: Liste de vos clients\n- Finances: Suivi des dépenses\n- Inventaire: Stock de matériaux\n- Employés: Gestion d\'équipe\n\nChaque section a des filtres et exports.',
                    '🎨 Navigation Dashboard:\n- Cliquez sur l\'avatar pour accéder au menu\n- Utilisez la sidebar pour naviguer\n- La recherche en haut pour trouver rapidement\n- Les filtres pour affiner les résultats\n\nTout est intuitive et facile d\'accès!'
                ]
            }
        };

        // Match user input to knowledge base
        for (const [category, data] of Object.entries(knowledgeBase)) {
            for (const pattern of (data as any).patterns) {
                if (input.includes(pattern)) {
                    const responses = (data as any).responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }

        // Default intelligent response
        const defaultResponses = [
            '🤔 C\'est une bonne question! Je n\'ai pas trouvé une réponse précise dans ma base de connaissances.\n\nPouvez-vous être plus spécifique? Par exemple:\n- Vous avez un problème technique?\n- Vous voulez savoir sur nos services?\n- Vous avez une question sur les tarifs?\n\nJe serai ravi de vous aider!',
            '💡 Intéressant! Je dois approfondir ma compréhension.\n\nPourriez-vous développer votre question? Des détails supplémentaires me permettront de vous donner une meilleure réponse.\n\n⚙️ N\'hésitez pas à demander sur: devis, commandes, tarifs, partenaires, délais, paiement, etc.',
            '✨ Bonne question! Si c\'est quelque chose de très spécifique, contactez notre équipe support qui pourra vous aider encore mieux.\n\nEn attendant, puis-je vous aider avec autre chose?\n📞 Support: contact@cncconnect-dz.com'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 z-50 animate-in zoom-in duration-300"
            >
                <Bot className="w-8 h-8 text-white" />
            </Button>
        );
    }

    return (
        <div className={cn(
            "fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 transition-all duration-300 flex flex-col overflow-hidden",
            isMinimized ? "w-72 h-16" : "w-96 h-[600px]"
        )}>
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0 cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Assistant Expert CNC</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-blue-100">En ligne</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-100 hover:bg-blue-700 hover:text-white" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
                        <Minimize2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-100 hover:bg-blue-700 hover:text-white" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm max-w-[80%]",
                                    msg.role === 'user'
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
                                )}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1"
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700" disabled={loading || !input.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
