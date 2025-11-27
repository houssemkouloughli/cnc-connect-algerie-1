export type PartnerCapability = '3-axis' | '5-axis' | 'lathe' | 'sheet-metal' | '3d-printing';
export type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PartnerProfile {
    id: string;
    companyName: string;
    wilaya: string;
    capabilities: PartnerCapability[];
    certifications: string[];
    rating: number;
    completedJobs: number;
    status: PartnerStatus;
}

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'negotiating';

export interface PartnerBid {
    id: string;
    quoteId: string;
    partnerId: string;
    price: number;
    leadTimeDays: number;
    message?: string;
    status: BidStatus;
    submittedAt: string;
}

export interface RFQ {
    id: string;
    clientId: string;
    partName: string;
    quantity: number;
    material: string;
    process: string;
    targetPrice?: number;
    deadline?: string;
    status: 'open' | 'closed' | 'awarded';
    createdAt: string;
    thumbnailUrl?: string; // For dashboard preview
}
