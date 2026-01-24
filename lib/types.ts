// Database Types
export interface Profile {
    id: string;
    full_name: string;
    phone: string;
    loyalty_tier: 'silver' | 'gold' | 'platinum';
    wallet_balance: number;
    partial_payment_enabled: boolean;
    created_at: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'burger' | 'bowl' | 'drink' | 'side' | 'dessert';
    prep_time_minutes: number;
    image_url: string;
    available: boolean;
}

export interface OrderItem {
    item_id: string;
    quantity: number;
    price: number;
    name?: string;
}

export interface Order {
    id: string;
    user_id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
    service_type: 'pickup' | 'dine-in';
    eta_minutes: number;
    created_at: string;
}

export interface PoolBooking {
    id: string;
    user_id: string;
    spot_id: string;
    spot_type: 'sunbed' | 'cabana';
    date: string;
    time_slot: string;
    price: number;
    status: 'confirmed' | 'cancelled';
}

export interface HotelBooking {
    id: string;
    user_id: string;
    room_number: string;
    check_in: string;
    check_out: string;
    digital_key_enabled: boolean;
    status: 'active' | 'checked-out';
}

export interface WalletTransaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'topup' | 'payment' | 'refund';
    description: string;
    created_at: string;
}

// UI Component Props
export interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: 'red' | 'gold';
    ctaText: string;
    href: string;
    onClick?: () => void;
}

export interface StatusBadgeProps {
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
    text: string;
}

export interface PriceTagProps {
    amount: number;
    currency?: 'MAD' | 'EUR';
    size?: 'sm' | 'md' | 'lg';
}

export interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
    description?: string;
}

export interface OrderProgressProps {
    steps: string[];
    currentStep: number;
}

// Feature-specific Types
export interface GPSLocation {
    latitude: number;
    longitude: number;
    eta_minutes: number;
    distance_km: number;
}

export interface PoolSpot {
    id: string;
    type: 'sunbed' | 'cabana';
    position: { x: number; y: number };
    available: boolean;
    price: number;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export interface WalletFeatures {
    balance: number;
    currency: 'MAD';
    partialPaymentEnabled: boolean;
    transactions: WalletTransaction[];
}
