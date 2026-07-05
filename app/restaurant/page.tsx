import { supabase } from "@/lib/supabase";
import RestaurantClient from "./RestaurantClient";
import { COMPLETE_MENU, restaurantCategories, MenuItem } from "@/lib/types/menu";

// Enable Incremental Static Regeneration (ISR) to cache the page for 30 seconds
// This makes the page load instantly (kilo bytes plane speed) while keeping data fresh.
export const revalidate = 30;

export default async function RestaurantPage() {
    let initialCategories = restaurantCategories.map(c => ({ id: c.id, label: c.label }));
    let initialItems = COMPLETE_MENU;

    // Add 'Tout' at the beginning of default categories if not present
    if (!initialCategories.some(c => c.id === 'all')) {
        initialCategories = [{ id: 'all', label: 'Tout' }, ...initialCategories];
    }

    try {
        // Fetch categories and items f parallel directly on the server (very fast)
        const [catsRes, itemsRes] = await Promise.all([
            supabase.from('restaurant_categories').select('*').order('sort_order'),
            supabase.from('restaurant_items').select('*').order('sort_order', { ascending: true })
        ]);

        if (!catsRes.error && catsRes.data && catsRes.data.length > 0) {
            initialCategories = [
                { id: 'all', label: 'Tout' },
                ...catsRes.data.map(c => ({ id: c.id, label: c.label_fr }))
            ];
        }

        if (!itemsRes.error && itemsRes.data && itemsRes.data.length > 0) {
            initialItems = itemsRes.data.map(i => ({
                id: i.id as any,
                category: i.category_id,
                name: i.name_fr,
                description: i.description_fr,
                basePrice: Number(i.base_price),
                image: i.image_url,
                prepTime: i.prep_time,
                available: i.is_available,
                badge: i.badge,
                isFeatured: i.is_featured,
                customizable: i.customization_json != null,
                customization: i.customization_json
            }));
        }
    } catch (err) {
        console.error("Server-side fetching failed, using fallback static menu:", err);
    }

    return (
        <RestaurantClient 
            initialCategories={initialCategories} 
            initialItems={initialItems} 
        />
    );
}
