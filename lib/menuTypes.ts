// Shared type definitions for menu items

// Parameter types for precise UI rendering
export interface StepperParameter {
    type: 'stepper';
    label: string;
    min: number;
    max: number;
    default: number;
    step?: number;
}

export interface SelectParameter {
    type: 'select';
    label: string;
    options: string[];
    default?: string;
}

export interface VariantParameter {
    type: 'variant';
    label: string;
    options: {
        label: string;
        priceModifier: number; // Can be positive or negative
    }[];
    default?: string;
}

export interface MultiParameter {
    type: 'multi';
    label: string;
    options: {
        name: string;
        price: number;
    }[];
    maxSelections?: number;
}

// Legacy option types (keeping for backward compatibility)
export interface BaristaOptions {
    type: 'barista';
    sugarControl: boolean;
    milkToggle?: { label: string };
    milkRatio?: boolean;
    teaHerbs?: boolean;
}

export interface BeldiOptions {
    type: 'beldi';
    portions: {
        label: string;
        multiplier: number;
        priceAdd: number;
    }[];
}

export interface GarnitureOptions {
    type: 'garniture';
    sideDishes: string[];
}

export interface ToppingsOptions {
    type: 'toppings';
    availableToppings: {
        name: string;
        price: number;
    }[];
    maxSelections?: number;
}

export interface BreadOptions {
    type: 'bread';
    breadTypes: string[];
}

export interface PastaOptions {
    type: 'pasta';
    pastaTypes: string[];
    sauces: string[];
}

// New generic parameters type
export interface GenericOptions {
    type: 'generic';
    parameters: (StepperParameter | SelectParameter | VariantParameter | MultiParameter)[];
}

export type MenuItemOptions =
    | BaristaOptions
    | BeldiOptions
    | GarnitureOptions
    | ToppingsOptions
    | BreadOptions
    | PastaOptions
    | GenericOptions;

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    type?: 'food' | 'drinks';
    prepTime?: number;
    image?: string;
    image_url?: string;
    options?: MenuItemOptions;
}
