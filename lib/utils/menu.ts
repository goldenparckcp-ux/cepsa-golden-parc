
import { MenuItem, MenuOption } from "@/lib/types/menu";

// Helper to init selections based on default values
export function initSelections(item: MenuItem) {
    const out: Record<string, unknown> = {};
    const cfg = item?.customization || {};
    Object.entries(cfg).forEach(([key, opt]) => {
        if (opt.type === "stepper") out[key] = opt.default ?? opt.min ?? 0;
        if (opt.type === "radio") out[key] = opt.default ?? opt.options?.[0]?.id ?? null;
        if (opt.type === "checkbox") out[key] = [];
        if (opt.type === "checkbox-group") {
            const defaults = (opt.options || []).filter((o: MenuOption) => o.included).map((o: MenuOption) => o.id);
            out[key] = defaults;
        }
    });
    out.special_instructions = "";
    return out;
}

// Helper to calc price based on selections
export function calcPrice(item: MenuItem, selections: Record<string, unknown>) {
    let price = item.basePrice;
    const cfg = item.customization || {};

    Object.entries(cfg).forEach(([key, opt]) => {
        const value = selections?.[key];

        if (opt.type === "radio") {
            const selected = opt.options?.find((o: MenuOption) => o.id === value);
            if (typeof selected?.price === "number") price += selected.price;
        }

        if (opt.type === "checkbox") {
            const ids = Array.isArray(value) ? value : [];
            const freeCount = opt.freeCount || 0;
            const extraPrice = opt.extraPrice || 0;
            const extraCount = Math.max(0, ids.length - freeCount);
            price += extraCount * extraPrice;

            ids.forEach((id) => {
                const selected = opt.options?.find((o: MenuOption) => o.id === id);
                if (typeof selected?.price === "number") price += selected.price;
            });
        }

        if (opt.type === "checkbox-group") {
            const ids = Array.isArray(value) ? value : [];
            ids.forEach((id) => {
                const selected = opt.options?.find((o: MenuOption) => o.id === id);
                if (selected && !selected.included && typeof selected.price === "number") price += selected.price;
            });
        }
    });

    return price;
}
