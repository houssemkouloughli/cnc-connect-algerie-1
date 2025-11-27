export type Workshop = {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviewCount: number;
    specialties: string[];
    machines: string[];
    imageUrl: string;
    verified: boolean;
    deliveryTime: string;
    minOrderPrice: number;
}
