"use client";

import React, { useState, useEffect } from "react";
import { 
    DollarSign, Save, RefreshCw, Sparkles, AlertCircle, CheckCircle2, 
    Utensils, Bed, Ticket, Plus, Trash2, Edit3, Camera, X, Star, 
    ImageIcon, Eye, EyeOff, LayoutGrid, GripVertical, PlusCircle, Trash, Fuel
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DarkSheet } from "@/components/ui/DarkSheet";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface CustomizationOption {
    id: string;
    label: string;
    price: number;
}

interface CustomizationGroup {
    id: string;
    label: string;
    type: "radio" | "checkbox";
    options: CustomizationOption[];
}

export default function AdminPriceModifierPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Global Section Tab
    const [activeTab, setActiveTab] = useState<"restaurant" | "lubricants">("restaurant");

    // Restaurant Items state
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");

    // Lubricants Items state
    const [lubricantItems, setLubricantItems] = useState<any[]>([]);

    // Fuel Prices state
    const [fuelPrices, setFuelPrices] = useState({
        gasoil: 12.50,
        sansPlomb: 14.20
    });

    // Drag and Drop states
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Drawer / Modal states
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [drawerType, setDrawerType] = useState<"restaurant" | "lubricants">("restaurant");

    // Form fields state
    const [formData, setFormData] = useState({
        name_fr: "",
        name_ar: "",
        category_id: "FastFood", // serves as 'type' for lubricants (e.g. 'Synthétique')
        base_price: "",
        description_fr: "",
        description_ar: "",
        image_url: "",
        prep_time: "15 min", // serves as comma-separated 'features' for lubricants
        badge: "",
        is_featured: false,
        is_available: true,
        customization_json: ""
    });

    // Visual Customizations state (For the builder)
    const [visualCustomizations, setVisualCustomizations] = useState<CustomizationGroup[]>([]);
    const [isJsonMode, setIsJsonMode] = useState(false);

    // Hotel Room Prices (Local State settings)
    const [hotelPrices, setHotelPrices] = useState({
        standard_night: 300,
        standard_sieste: 150,
        deluxe_night: 500,
        deluxe_sieste: 250,
        family_night: 700,
        family_sieste: 350
    });

    // Pool Prices (Local State settings)
    const [poolPrices, setPoolPrices] = useState({
        morning_adult: 50,
        morning_child: 25,
        afternoon_adult: 50,
        afternoon_child: 25,
        fullday_adult: 90,
        fullday_child: 40
    });

    // Selection of quick Unsplash image templates for premium styling
    const IMAGE_TEMPLATES = [
        { name: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
        { name: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
        { name: "Plat Beldi", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800" },
        { name: "Salade", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
        { name: "Café / Jus", url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800" },
        { name: "Dessert", url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800" }
    ];

    useEffect(() => {
        // Enforce Admin Access
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            const session = JSON.parse(stored);
            if (session.role !== "admin") {
                window.location.href = "/admin";
                return;
            }
        } else {
            window.location.href = "/admin";
            return;
        }

        loadData();
    }, []);

    // Helper: Deserialize JSON into Visual Customization Groups
    const deserializeCustomizations = (jsonObj: any): CustomizationGroup[] => {
        if (!jsonObj || typeof jsonObj !== "object") return [];
        try {
            return Object.entries(jsonObj).map(([groupId, groupData]: [string, any]) => {
                const optionsList = Array.isArray(groupData.options) 
                    ? groupData.options.map((opt: any, idx: number) => ({
                        id: opt.id || `opt_${idx}_${Date.now()}`,
                        label: opt.label || "",
                        price: Number(opt.price || 0)
                      }))
                    : [];
                return {
                    id: groupId,
                    label: groupData.label || "",
                    type: groupData.type === "checkbox" || groupData.type === "checkbox-group" ? "checkbox" : "radio",
                    options: optionsList
                };
            });
        } catch (err) {
            console.error("Failed to deserialize customizations:", err);
            return [];
        }
    };

    // Helper: Serialize Visual Customization Groups into JSON Object
    const serializeCustomizations = (groups: CustomizationGroup[]): any => {
        const out: any = {};
        groups.forEach((group: any) => {
            if (!group.label.trim()) return; // Skip unnamed groups
            const cleanOptions = group.options
                .filter((opt: any) => opt.label.trim())
                .map((opt: any) => ({
                    id: opt.id || opt.label.toLowerCase().replace(/[^a-z0-9]/g, "_"),
                    label: opt.label,
                    price: Number(opt.price || 0)
                }));

            out[group.id] = {
                label: group.label,
                type: group.type,
                options: cleanOptions
            };
        });
        return Object.keys(out).length > 0 ? out : null;
    };    const loadData = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            // Load restaurant items from DB
            const { data, error } = await supabase.from("restaurant_items").select("*");
            if (error) throw error;
            if (data) {
                // Sort by sort_order ascending, then category weight
                const categoryWeights: Record<string, number> = { Ftour: 1, Snacks: 2, Plats: 3, Boissons: 4, Desserts: 5 };
                const sorted = [...data].sort((a: any, b: any) => {
                    if ((a.sort_order || 0) !== (b.sort_order || 0)) {
                        return (a.sort_order || 0) - (b.sort_order || 0);
                    }
                    const wA = categoryWeights[a.category_id] || 99;
                    const wB = categoryWeights[b.category_id] || 99;
                    if (wA !== wB) return wA - wB;
                    return a.name_fr.localeCompare(b.name_fr);
                });

                // Resequence locally to ensure valid, clean sort_order values (1, 2, 3...)
                const resequenced = sorted.map((item: any, idx: number) => ({
                    ...item,
                    sort_order: item.sort_order || (idx + 1)
                }));
                
                setMenuItems(resequenced);

                // Auto-sync missing sort_orders to database in background
                const needsMigration = data.some((item: any) => !item.sort_order);
                if (needsMigration) {
                    for (let i = 0; i < resequenced.length; i++) {
                        if (!data.find((x: any) => x.id === resequenced[i].id)?.sort_order) {
                            supabase.from("restaurant_items").update({ sort_order: resequenced[i].sort_order }).eq("id", resequenced[i].id).then();
                        }
                    }
                }
            }

            // Load Lubricants from DB
            const { data: lubeData, error: lubeErr } = await supabase
                .from("lubricant_items")
                .select("*")
                .order("sort_order", { ascending: true });
            
            if (!lubeErr && lubeData) {
                // Ensure valid sort order
                const resequencedLubes = lubeData.map((item: any, idx: number) => ({
                    ...item,
                    sort_order: item.sort_order || (idx + 1)
                }));
                setLubricantItems(resequencedLubes);
            }

            // Load Fuel Prices from DB
            const { data: fuelData, error: fuelErr } = await supabase
                .from("fuel_prices")
                .select("*")
                .eq("id", "current")
                .maybeSingle();
            
            if (!fuelErr && fuelData) {
                setFuelPrices({
                    gasoil: Number(fuelData.gasoil),
                    sansPlomb: Number(fuelData.sans_plomb)
                });
            }

            // Load Hotel/Pool prices from localStorage if customized
            const savedHotel = localStorage.getItem("custom_hotel_prices");
            if (savedHotel) setHotelPrices(JSON.parse(savedHotel));

            const savedPool = localStorage.getItem("custom_pool_prices");
            if (savedPool) setPoolPrices(JSON.parse(savedPool));

        } catch (err: any) {
            console.error("Failed to load prices dynamically:", err);
            setErrorMessage("Erreur de chargement: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update restaurant item price inline
    const handleSaveRestoPriceInline = async (itemId: string, newPrice: number) => {
        setSaving(`resto-price-${itemId}`);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("restaurant_items")
                .update({ base_price: newPrice })
                .eq("id", itemId);

            if (error) throw error;

            // Update local state
            setMenuItems(prev => prev.map((item: any) => item.id === itemId ? { ...item, base_price: newPrice } : item));
            showSuccess("Prix du plat mis à jour avec succès !");
        } catch (err: any) {
            setErrorMessage("Erreur: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    // Toggle restaurant item availability directly
    const handleToggleAvailability = async (item: any) => {
        setSaving(`resto-avail-${item.id}`);
        setSuccessMessage("");
        setErrorMessage("");
        const nextState = !item.is_available;

        try {
            const { error } = await supabase
                .from("restaurant_items")
                .update({ is_available: nextState })
                .eq("id", item.id);

            if (error) throw error;            // Update local state
            setMenuItems(prev => prev.map((x: any) => x.id === item.id ? { ...x, is_available: nextState } : x));
            showSuccess(`Le plat est maintenant ${nextState ? "Disponible" : "Indisponible"}`);
        } catch (err: any) {
            setErrorMessage("Erreur: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    // Update fuel prices
    const handleSaveFuelPrices = async () => {
        setSaving("fuel");
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const { error } = await supabase
                .from("fuel_prices")
                .update({
                    gasoil: fuelPrices.gasoil,
                    sans_plomb: fuelPrices.sansPlomb,
                    updated_at: new Date().toISOString()
                })
                .eq("id", "current");
            if (error) throw error;
            showSuccess("Prix des carburants mis à jour avec succès !");
        } catch (err: any) {
            setErrorMessage("Erreur carburants: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    // Update lubricant item price inline
    const handleSaveLubePriceInline = async (itemId: string, newPrice: number) => {
        setSaving(`lube-price-${itemId}`);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("lubricant_items")
                .update({ price: newPrice })
                .eq("id", itemId);

            if (error) throw error;

            // Update local state
            setLubricantItems(prev => prev.map((item: any) => item.id === itemId ? { ...item, price: newPrice } : item));
            showSuccess("Prix du lubrifiant mis à jour avec succès !");
        } catch (err: any) {
            setErrorMessage("Erreur: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    // Toggle lubricant item availability directly
    const handleToggleLubeAvailability = async (item: any) => {
        setSaving(`lube-avail-${item.id}`);
        setSuccessMessage("");
        setErrorMessage("");
        const nextState = !item.is_available;

        try {
            const { error } = await supabase
                .from("lubricant_items")
                .update({ is_available: nextState })
                .eq("id", item.id);

            if (error) throw error;

            // Update local state
            setLubricantItems(prev => prev.map((x: any) => x.id === item.id ? { ...x, is_available: nextState } : x));
            showSuccess(`Le lubrifiant est maintenant ${nextState ? "Disponible" : "Indisponible"}`);
        } catch (err: any) {
            setErrorMessage("Erreur: " + err.message);
        } finally {
            setSaving(null);
        }
    };

    // DRAG AND DROP HANDLERS
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };    const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        if (activeTab === "lubricants") {
            const originalOrders = lubricantItems
                .map((item: any) => item.sort_order || 0)
                .sort((a: any, b: any) => a - b);
            
            const updatedList = [...lubricantItems];
            const [movedItem] = updatedList.splice(draggedIndex, 1);
            updatedList.splice(targetIndex, 0, movedItem);

            const updatedListWithOrders = updatedList.map((item: any, idx: number) => ({
                ...item,
                sort_order: originalOrders[idx] || (idx + 1)
            }));

            setLubricantItems(updatedListWithOrders);
            setDraggedIndex(null);

            try {
                const updates = updatedListWithOrders.map((item: any) => {
                    const originalItem = lubricantItems.find((x: any) => x.id === item.id);
                    if (originalItem && originalItem.sort_order !== item.sort_order) {
                        return supabase
                            .from("lubricant_items")
                            .update({ sort_order: item.sort_order })
                            .eq("id", item.id);
                    }
                    return null;
                }).filter(Boolean);

                if (updates.length > 0) {
                    await Promise.all(updates);
                    showSuccess("Ordre des lubrifiants enregistré avec succès !");
                }
            } catch (err: any) {
                console.error("DB reorder failed:", err);
                setErrorMessage("Erreur de tri dans la base de données.");
            }
            return;
        }

        // Get the original global sort_orders of the filtered items (sorted)
        const originalOrders = filteredRestoItems
            .map((item: any) => item.sort_order || 0)
            .sort((a: any, b: any) => a - b);

        // Reorder locally in the current category list
        const updatedFiltered = [...filteredRestoItems];
        const [movedItem] = updatedFiltered.splice(draggedIndex, 1);
        updatedFiltered.splice(targetIndex, 0, movedItem);

        // Assign the original sort_orders to the new ordered filtered items
        const updatedFilteredWithOrders = updatedFiltered.map((item: any, idx: number) => ({
            ...item,
            sort_order: originalOrders[idx]
        }));

        // Merge back into the main menuItems array
        const updatedAll = menuItems.map((item: any) => {
            const match = updatedFilteredWithOrders.find((x: any) => x.id === item.id);
            if (match) {
                return match;
            }
            return item;
        });

        // Sort the entire list globally by sort_order
        const sortedAll = updatedAll.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        setMenuItems(sortedAll);
        setDraggedIndex(null);

        // Save new order to Supabase
        try {
            const updates = updatedFilteredWithOrders.map((item: any) => {
                const originalItem = menuItems.find((x: any) => x.id === item.id);
                if (originalItem && originalItem.sort_order !== item.sort_order) {
                    return supabase
                        .from("restaurant_items")
                        .update({ sort_order: item.sort_order })
                        .eq("id", item.id);
                }
                return null;
            }).filter(Boolean);

            if (updates.length > 0) {
                await Promise.all(updates);
                showSuccess("Ordre du menu enregistré avec succès !");
            }
        } catch (err: any) {
            console.error("DB reorder failed:", err);
            setErrorMessage("Erreur de tri dans la base de données.");
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };    // Open drawer to add a new item
    const openAddDrawer = () => {
        setFormData({
            name_fr: "",
            name_ar: "",
            category_id: drawerType === "lubricants" ? "Synthétique" : (activeCategory === "all" ? "FastFood" : activeCategory),
            base_price: "",
            description_fr: "",
            description_ar: "",
            image_url: "",
            prep_time: drawerType === "lubricants" ? "Protection Max, Éco-Carburant, Longue Durée" : "15 min",
            badge: "",
            is_featured: false,
            is_available: true,
            customization_json: ""
        });
        setVisualCustomizations([]);
        setIsJsonMode(false);
        setIsAddDrawerOpen(true);
    };

    // Open drawer to edit an existing item
    const openEditDrawer = (item: any) => {
        setEditingItem(item);
        if (drawerType === "lubricants") {
            const featuresStr = Array.isArray(item.features) ? item.features.join(", ") : "";
            setFormData({
                name_fr: item.name || "",
                name_ar: "",
                category_id: item.type || "Synthétique",
                base_price: String(item.price || ""),
                description_fr: item.description || "",
                description_ar: "",
                image_url: item.image_url || "",
                prep_time: featuresStr,
                badge: "",
                is_featured: false,
                is_available: !!item.is_available,
                customization_json: ""
            });
            setVisualCustomizations([]);
            setIsJsonMode(false);
        } else {
            const jsonStr = item.customization_json ? JSON.stringify(item.customization_json, null, 2) : "";
            setFormData({
                name_fr: item.name_fr || "",
                name_ar: item.name_ar || "",
                category_id: item.category_id || "FastFood",
                base_price: String(item.base_price || ""),
                description_fr: item.description_fr || "",
                description_ar: item.description_ar || "",
                image_url: item.image_url || "",
                prep_time: item.prep_time || "15 min",
                badge: item.badge || "",
                is_featured: !!item.is_featured,
                is_available: !!item.is_available,
                customization_json: jsonStr
            });
            
            // Parse into visual customization state
            const parsedVisual = deserializeCustomizations(item.customization_json);
            setVisualCustomizations(parsedVisual);
            setIsJsonMode(false);
        }
        setIsAddDrawerOpen(true);
    };

    // Save added or edited item to DB
    const handleSaveItemForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        
        if (drawerType === "lubricants") {
            if (!formData.name_fr || !formData.base_price || !formData.description_fr) {
                setErrorMessage("Veuillez remplir le nom, le prix et la description.");
                return;
            }

            setLoading(true);

            // Convert comma-separated features to text[] array
            const features = formData.prep_time
                ? formData.prep_time.split(",").map((f: string) => f.trim()).filter(Boolean)
                : [];

            const payload: any = {
                name: formData.name_fr,
                type: formData.category_id,
                price: Number(formData.base_price),
                description: formData.description_fr,
                image_url: formData.image_url || "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800",
                features: features,
                is_available: formData.is_available
            };

            try {
                if (editingItem) {
                    // EDIT MODE
                    const { error } = await supabase
                        .from("lubricant_items")
                        .update(payload)
                        .eq("id", editingItem.id);

                    if (error) throw error;
                    showSuccess(`Le lubrifiant "${formData.name_fr}" a été modifié avec succès !`);
                    setEditingItem(null);
                } else {
                    // ADD MODE
                    const maxSort = lubricantItems.reduce((max: number, item: any) => Math.max(max, item.sort_order || 0), 0);
                    payload.sort_order = maxSort + 1;

                    const { error } = await supabase
                        .from("lubricant_items")
                        .insert([payload]);

                    if (error) throw error;
                    showSuccess(`Le lubrifiant "${formData.name_fr}" a été ajouté avec succès !`);
                    setIsAddDrawerOpen(false);
                }

                // Reload all items to sync UI
                await loadData();
            } catch (err: any) {
                setErrorMessage("Erreur lors de la sauvegarde: " + err.message);
            } finally {
                setLoading(false);
            }
        } else {
            // Restaurant saving logic
            if (!formData.name_fr || !formData.base_price || !formData.description_fr) {
                setErrorMessage("Veuillez remplir le nom, le prix et la description en Français.");
                return;
            }

            // Get customization json payload based on current mode
            let parsedCustomization = null;
            if (isJsonMode) {
                if (formData.customization_json.trim()) {
                    try {
                        parsedCustomization = JSON.parse(formData.customization_json);
                    } catch (err) {
                        setErrorMessage("Format de personnalisation (JSON brut) invalide.");
                        return;
                    }
                }
            } else {
                parsedCustomization = serializeCustomizations(visualCustomizations);
            }

            setLoading(true);

            const payload: any = {
                name_fr: formData.name_fr,
                category_id: formData.category_id,
                base_price: Number(formData.base_price),
                description_fr: formData.description_fr,
                image_url: formData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
                prep_time: formData.prep_time,
                badge: formData.badge || null,
                is_featured: formData.is_featured,
                is_available: formData.is_available,
                customization_json: parsedCustomization
            };

            try {
                if (editingItem) {
                    // EDIT MODE
                    const { error } = await supabase
                        .from("restaurant_items")
                        .update(payload)
                        .eq("id", editingItem.id);

                    if (error) throw error;
                    showSuccess(`Le plat "${formData.name_fr}" a été modifié avec succès !`);
                    setEditingItem(null);
                } else {
                    // ADD MODE
                    const maxSort = menuItems.reduce((max: number, item: any) => Math.max(max, item.sort_order || 0), 0);
                    payload.sort_order = maxSort + 1;

                    const { error } = await supabase
                        .from("restaurant_items")
                        .insert([payload]);

                    if (error) throw error;
                    showSuccess(`Le plat "${formData.name_fr}" a été ajouté avec succès !`);
                    setIsAddDrawerOpen(false);
                }

                // Reload all items to sync UI
                await loadData();
            } catch (err: any) {
                setErrorMessage("Erreur lors de la sauvegarde: " + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Delete item with confirmation
    const handleDeleteItem = async (itemId: string, name: string) => {
        const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer le plat "${name}" du menu ? Cette action est irréversible.`);
        if (!confirmDelete) return;

        setLoading(true);
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("restaurant_items")
                .delete()
                .eq("id", itemId);

            if (error) throw error;

            showSuccess(`Le plat "${name}" a été supprimé du menu.`);
            await loadData();
        } catch (err: any) {
            setErrorMessage("Erreur lors de la suppression: " + err.message);
            setLoading(false);
        }
    };

    const addCustomizationGroup = () => {
        const newGroup: CustomizationGroup = {
            id: `group_${Date.now()}`,
            label: "Nouveau Groupe (ex: Suppléments)",
            type: "checkbox",
            options: [{ id: `opt_${Date.now()}_0`, label: "Option 1", price: 0 }]
        };
        setVisualCustomizations([...visualCustomizations, newGroup]);
    };

    const removeCustomizationGroup = (groupId: string) => {
        setVisualCustomizations(visualCustomizations.filter(g => g.id !== groupId));
    };

    const updateGroupLabel = (groupId: string, label: string) => {
        setVisualCustomizations(visualCustomizations.map(g => g.id === groupId ? { ...g, label } : g));
    };

    const updateGroupType = (groupId: string, type: "radio" | "checkbox") => {
        setVisualCustomizations(visualCustomizations.map(g => g.id === groupId ? { ...g, type } : g));
    };

    const addOptionToGroup = (groupId: string) => {
        setVisualCustomizations(visualCustomizations.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    options: [...g.options, { id: `opt_${Date.now()}_${g.options.length}`, label: "Nouvelle option", price: 0 }]
                };
            }
            return g;
        }));
    };

    const removeOptionFromGroup = (groupId: string, optionId: string) => {
        setVisualCustomizations(visualCustomizations.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    options: g.options.filter(o => o.id !== optionId)
                };
            }
            return g;
        }));
    };

    const updateOptionData = (groupId: string, optionId: string, field: "label" | "price", value: any) => {
        setVisualCustomizations(visualCustomizations.map(g => {
            if (g.id === groupId) {
                const updatedOptions = g.options.map(o => {
                    if (o.id === optionId) {
                        return {
                            ...o,
                            [field]: field === "price" ? Number(value) : value
                        };
                    }
                    return o;
                });
                return { ...g, options: updatedOptions };
            }
            return g;
        }));
    };

    // Delete lubricant item
    const handleDeleteLubeItem = async (itemId: string, name: string) => {
        const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer le lubrifiant "${name}" ? Cette action est irréversible.`);
        if (!confirmDelete) return;

        setLoading(true);
        setErrorMessage("");

        try {
            const { error } = await supabase
                .from("lubricant_items")
                .delete()
                .eq("id", itemId);

            if (error) throw error;

            showSuccess(`Le lubrifiant "${name}" a été supprimé.`);
            await loadData();
        } catch (err: any) {
            setErrorMessage("Erreur lors de la suppression: " + err.message);
            setLoading(false);
        }
    };
    const handleSaveHotelPrices = () => {
        setSaving("hotel");
        setSuccessMessage("");
        try {
            localStorage.setItem("custom_hotel_prices", JSON.stringify(hotelPrices));
            showSuccess("Tarifs de l'Hôtel enregistrés avec succès !");
        } catch (err) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(null);
        }
    };

    // Update Pool Prices in LocalStorage (Shared setting simulation)
    const handleSavePoolPrices = () => {
        setSaving("pool");
        setSuccessMessage("");
        try {
            localStorage.setItem("custom_pool_prices", JSON.stringify(poolPrices));
            showSuccess("Tarifs de la Piscine enregistrés avec succès !");
        } catch (err) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(null);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    const categories = [
        { id: "all", label: "Tout" },
        { id: "FastFood", label: "Fast Food" },
        { id: "Plats", label: "Plats & Beldi" },
        { id: "Ftour", label: "Ftour" },
        { id: "Salades", label: "Salades" },
        { id: "Desserts", label: "Desserts" },
        { id: "Boissons", label: "Boissons" }
    ];

    const filteredRestoItems = menuItems.filter(item => {
        if (activeCategory === "all") return true;
        return item.category_id === activeCategory;
    });    return (
        <div className="space-y-8 pb-16 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-[#EA580C] to-amber-500 rounded-2xl shadow-lg shadow-amber-500/10">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Modification des Prix & Menu</h1>
                        <p className="text-xs text-gray-400 font-medium">Configurez et modifiez les tarifs en direct, et organisez vos catalogues en direct</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="bg-[#1E293B] hover:bg-[#1E293B]/80 text-gray-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Recharger
                    </button>
                </div>
            </div>

            {/* Tab Switcher (Restaurant vs Lubricants) */}
            <div className="flex bg-[#1E293B]/60 p-1.5 rounded-[20px] border border-white/5 w-full max-w-md">
                <button
                    onClick={() => setActiveTab("restaurant")}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        activeTab === "restaurant"
                            ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/10"
                            : "text-gray-400 hover:text-white"
                    }`}
                >
                    <Utensils className="w-4 h-4" />
                    Restaurant
                </button>
                <button
                    onClick={() => setActiveTab("lubricants")}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        activeTab === "lubricants"
                            ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/10"
                            : "text-gray-400 hover:text-white"
                    }`}
                >
                    <Fuel className="w-4 h-4" />
                    Lubrifiants
                </button>
            </div>

            {/* Success feedback message */}
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 text-green-400 font-bold text-sm animate-shake">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Error feedback message */}
            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 font-bold text-sm animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. VISUAL MENU/CATALOGUE MANAGER */}
                <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 lg:col-span-2 space-y-6">
                    {activeTab === "restaurant" ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-orange-500" />
                                    Grille Restaurant (Visual Menu Editor)
                                </h3>

                                <button
                                    onClick={() => { setDrawerType("restaurant"); openAddDrawer(); }}
                                    className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter Plat
                                </button>
                            </div>

                            {/* Category Selector */}
                            <div className="flex bg-[#0F172A] p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all ${
                                            activeCategory === cat.id
                                                ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md"
                                                : "text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Drag and Drop instructions */}
                            <div className="text-[10px] text-gray-500 font-bold bg-[#0F172A]/50 px-4 py-2 rounded-xl border border-white/5 inline-flex items-center gap-2">
                                <GripVertical className="w-3.5 h-3.5 text-orange-500" />
                                Glissez-déposez n'importe quelle carte pour la réordonner dans le menu (b7al tele).
                            </div>

                            {/* Visual Card Grid (Scroll cut off removed for natural scrolling) */}
                            {loading ? (
                                <div className="text-center py-20 text-xs text-gray-500 flex flex-col items-center gap-3">
                                    <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                                    Chargement du menu visuel...
                                </div>
                            ) : filteredRestoItems.length === 0 ? (
                                <div className="text-center py-20 text-xs text-gray-500 bg-[#0F172A] rounded-2xl border border-dashed border-white/5">
                                    Aucun plat dans cette catégorie. Cliquez sur "Ajouter Plat" pour commencer.
                                </div>
                            ) : (
                                <div className="lg:h-[calc(100vh-280px)] lg:overflow-y-auto pr-2 custom-scrollbar">
                                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {filteredRestoItems.map((item, idx) => {
                                                const isDragging = idx === draggedIndex;
                                                const isDragOver = idx === dragOverIndex;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        draggable={true}
                                                        onDragStart={(e) => handleDragStart(e, idx)}
                                                        onDragOver={(e) => handleDragOver(e, idx)}
                                                        onDragLeave={handleDragLeave}
                                                        onDragEnd={handleDragEnd}
                                                        onDrop={(e) => handleDrop(e, idx)}
                                                        className={`group bg-[#0F172A] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md cursor-grab active:cursor-grabbing ${
                                                            isDragging ? "opacity-30 border-orange-500/30 scale-95" : ""
                                                        } ${
                                                            isDragOver 
                                                                ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)] scale-[1.03]" 
                                                                : item.is_available 
                                                                    ? "border-white/5 hover:border-white/20" 
                                                                    : "border-red-950/40 opacity-75 grayscale hover:grayscale-0"
                                                        }`}
                                                    >
                                                        {/* Item Image with Actions */}
                                                        <div className="h-32 relative bg-[#1E293B] overflow-hidden shrink-0">
                                                            <Image 
                                                                src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"} 
                                                                alt={item.name_fr}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/30" />

                                                            {/* Drag Indicator Overlay */}
                                                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                                                                <div className="p-1 bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 group-hover:text-white transition-colors cursor-grab">
                                                                    <GripVertical className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="bg-[#1E293B]/80 backdrop-blur-sm border border-white/10 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase">
                                                                    {item.category_id}
                                                                </span>
                                                            </div>

                                                            {/* Header Badges */}
                                                            <div className="absolute top-9 left-2 flex flex-col gap-1.5 z-10">
                                                                {item.badge && (
                                                                    <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider">
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                                {item.is_featured && (
                                                                    <span className="bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-0.5">
                                                                        <Star className="w-2.5 h-2.5 fill-black" /> Vedette
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Edit / Delete overlays */}
                                                            <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setDrawerType("restaurant"); openEditDrawer(item); }}
                                                                    className="p-1.5 bg-[#1E293B]/80 backdrop-blur-sm hover:bg-orange-600 text-white rounded-lg transition-colors border border-white/10 hover:border-orange-500 shadow-md"
                                                                    title="Modifier le plat"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.name_fr); }}
                                                                    className="p-1.5 bg-[#1E293B]/80 backdrop-blur-sm hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors border border-white/10 hover:border-red-500 shadow-md"
                                                                    title="Supprimer du menu"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            {/* Availability indicator */}
                                                            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleAvailability(item); }}
                                                                    className="flex items-center gap-1 text-[9px] font-bold text-gray-300"
                                                                >
                                                                    {item.is_available ? (
                                                                        <>
                                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                                            En Vente
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                                            Masqué
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>

                                                            {/* Prep time display */}
                                                            {item.prep_time && (
                                                                <div className="absolute bottom-2 right-2 z-10 text-[9px] font-bold text-gray-300 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
                                                                    ⏳ {item.prep_time}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Item Info & Price */}
                                                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 bg-[#0F172A]">
                                                            <div>
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <h4 className="font-bold text-white text-sm leading-tight line-clamp-1">{item.name_fr}</h4>
                                                                    {item.name_ar && (
                                                                        <span className="font-semibold text-gray-400 text-xs text-right leading-none truncate font-arabic">{item.name_ar}</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 line-clamp-1 leading-relaxed mt-1">{item.description_fr}</p>
                                                            </div>

                                                            {/* Bottom bar - Price */}
                                                            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={item.base_price}
                                                                            onBlur={(e) => {
                                                                                const val = Number(e.target.value);
                                                                                if (val > 0 && val !== Number(item.base_price)) {
                                                                                    handleSaveRestoPriceInline(item.id, val);
                                                                                }
                                                                            }}
                                                                            className="bg-[#1E293B] border border-white/5 rounded-lg py-1 px-2 pl-6 text-xs text-amber-500 font-black w-20 text-right outline-none focus:border-amber-500 transition-colors"
                                                                        />
                                                                        <span className="text-gray-500 text-[10px] font-black absolute left-2 top-1.5">DH</span>
                                                                    </div>
                                                                    {saving === `resto-price-${item.id}` && (
                                                                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                                                    )}
                                                                </div>

                                                                <span className="text-[9px] font-bold text-gray-600 bg-white/5 px-2 py-1 rounded-md">
                                                                    Pos: #{item.sort_order}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );                                            })}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Fuel className="w-4 h-4 text-red-500" />
                                    Catalogue Lubrifiants (Visual Lube Editor)
                                </h3>

                                <button
                                    onClick={() => { setDrawerType("lubricants"); openAddDrawer(); }}
                                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter Lubrifiant
                                </button>
                            </div>

                            {/* Drag and Drop instructions */}
                            <div className="text-[10px] text-gray-500 font-bold bg-[#0F172A]/50 px-4 py-2 rounded-xl border border-white/5 inline-flex items-center gap-2">
                                <GripVertical className="w-3.5 h-3.5 text-red-500" />
                                Glissez-déposez n'importe quelle carte pour la réordonner dans le catalogue.
                            </div>

                            {/* Lubricants Card Grid */}
                            {loading ? (
                                <div className="text-center py-20 text-xs text-gray-500 flex flex-col items-center gap-3">
                                    <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                                    Chargement du catalogue lubrifiants...
                                </div>
                            ) : lubricantItems.length === 0 ? (
                                <div className="text-center py-20 text-xs text-gray-500 bg-[#0F172A] rounded-2xl border border-dashed border-white/5">
                                    Aucun lubrifiant dans le catalogue. Cliquez sur "Ajouter Lubrifiant" pour commencer.
                                </div>
                            ) : (
                                <div className="lg:h-[calc(100vh-280px)] lg:overflow-y-auto pr-2 custom-scrollbar">
                                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {lubricantItems.map((item, idx) => {
                                                const isDragging = idx === draggedIndex;
                                                const isDragOver = idx === dragOverIndex;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        draggable={true}
                                                        onDragStart={(e) => handleDragStart(e, idx)}
                                                        onDragOver={(e) => handleDragOver(e, idx)}
                                                        onDragLeave={handleDragLeave}
                                                        onDragEnd={handleDragEnd}
                                                        onDrop={(e) => handleDrop(e, idx)}
                                                        className={`group bg-[#0F172A] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md cursor-grab active:cursor-grabbing ${
                                                            isDragging ? "opacity-30 border-red-500/30 scale-95" : ""
                                                        } ${
                                                            isDragOver 
                                                                ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] scale-[1.03]" 
                                                                : item.is_available 
                                                                    ? "border-white/5 hover:border-white/20" 
                                                                    : "border-red-950/40 opacity-75 grayscale hover:grayscale-0"
                                                        }`}
                                                    >
                                                        {/* Lube Image with Actions */}
                                                        <div className="h-32 relative bg-[#1E293B] overflow-hidden shrink-0">
                                                            <Image 
                                                                src={item.image_url || "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800"} 
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/30" />

                                                            {/* Drag Indicator Overlay */}
                                                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                                                                <div className="p-1 bg-[#1E293B]/90 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 group-hover:text-white transition-colors cursor-grab">
                                                                    <GripVertical className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="bg-[#1E293B]/80 backdrop-blur-sm border border-white/10 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase">
                                                                    {item.type}
                                                                </span>
                                                            </div>

                                                            {/* Edit / Delete overlays */}
                                                            <div className="absolute top-2 right-2 flex gap-1 z-10">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setDrawerType("lubricants"); openEditDrawer(item); }}
                                                                    className="p-1.5 bg-[#1E293B]/80 backdrop-blur-sm hover:bg-red-600 text-white rounded-lg transition-colors border border-white/10 hover:border-red-500 shadow-md"
                                                                    title="Modifier le lubrifiant"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLubeItem(item.id, item.name); }}
                                                                    className="p-1.5 bg-[#1E293B]/80 backdrop-blur-sm hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors border border-white/10 hover:border-red-500 shadow-md"
                                                                    title="Supprimer du catalogue"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            {/* Availability indicator */}
                                                            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleLubeAvailability(item); }}
                                                                    className="flex items-center gap-1 text-[9px] font-bold text-gray-300"
                                                                >
                                                                    {item.is_available ? (
                                                                        <>
                                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                                            En Vente
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                                            Masqué
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Lube Info & Price */}
                                                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 bg-[#0F172A]">
                                                            <div>
                                                                <h4 className="font-bold text-white text-sm leading-tight line-clamp-1">{item.name}</h4>
                                                                <p className="text-[10px] text-gray-500 line-clamp-1 leading-relaxed mt-1">{item.description}</p>
                                                                {item.features && item.features.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {item.features.map((feat: string, fidx: number) => (
                                                                            <span key={fidx} className="bg-red-950/40 text-red-400 border border-red-500/10 text-[8px] px-1.5 py-0.5 rounded font-medium">
                                                                                {feat}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Bottom bar - Price */}
                                                            <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="relative">
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={item.price}
                                                                            onBlur={(e) => {
                                                                                const val = Number(e.target.value);
                                                                                if (val > 0 && val !== Number(item.price)) {
                                                                                    handleSaveLubePriceInline(item.id, val);
                                                                                }
                                                                            }}
                                                                            className="bg-[#1E293B] border border-white/5 rounded-lg py-1 px-2 pl-6 text-xs text-amber-500 font-black w-20 text-right outline-none focus:border-amber-500 transition-colors"
                                                                        />
                                                                        <span className="text-gray-500 text-[10px] font-black absolute left-2 top-1.5">DH</span>
                                                                    </div>
                                                                    {saving === `lube-price-${item.id}` && (
                                                                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                                                    )}
                                                                </div>

                                                                <span className="text-[9px] font-bold text-gray-600 bg-white/5 px-2 py-1 rounded-md">
                                                                    Pos: #{item.sort_order}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            )}
                        </>
                    )}
                </div>                {/* 2. SERVICES & HOTEL PRICING CONTROL (PRO CONFIG PANEL) */}
                <div className="space-y-8">
                    {/* Fuel Prices Modifier */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <Fuel className="w-5 h-5 text-red-500 animate-pulse" />
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                Prix du Carburant
                            </h3>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Gasoil (DH/L)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={fuelPrices.gasoil}
                                        onChange={(e) => setFuelPrices({ ...fuelPrices, gasoil: Number(e.target.value) })}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sans Plomb (DH/L)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={fuelPrices.sansPlomb}
                                        onChange={(e) => setFuelPrices({ ...fuelPrices, sansPlomb: Number(e.target.value) })}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveFuelPrices}
                            disabled={saving === "fuel"}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {saving === "fuel" ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer Prix Carburants
                        </button>
                    </div>

                    {/* Hotel Rates Modifier */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Bed className="w-4 h-4 text-amber-500" />
                            Tarifs Hôtel (Nuits / Siestes)
                        </h3>

                        <div className="space-y-4 text-xs">
                            {/* Standard Room */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Chambre Standard</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nuitée (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.standard_night}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, standard_night: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sieste (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.standard_sieste}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, standard_sieste: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Suite Deluxe */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Suite Deluxe</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nuitée (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.deluxe_night}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, deluxe_night: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sieste (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.deluxe_sieste}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, deluxe_sieste: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Family Room */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Chambre Famille</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Nuitée (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.family_night}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, family_night: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Sieste (DH)</label>
                                        <input
                                            type="number"
                                            value={hotelPrices.family_sieste}
                                            onChange={(e) => setHotelPrices({ ...hotelPrices, family_sieste: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveHotelPrices}
                            disabled={saving === "hotel"}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {saving === "hotel" ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer Tarifs Hôtel
                        </button>
                    </div>

                    {/* Pool Formula Pricing Card */}
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-cyan-500" />
                            Tarifs Piscine (Adultes / Enfants)
                        </h3>

                        <div className="space-y-4 text-xs">
                            {/* Full Day */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Formule Journée Complète</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Adulte (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.fullday_adult}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, fullday_adult: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Enfant (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.fullday_child}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, fullday_child: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Morning / Afternoon */}
                            <div className="space-y-2">
                                <div className="font-bold text-gray-300">Formule Demi-Journée (Matin/A-M)</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Adulte (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.morning_adult}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, morning_adult: Number(e.target.value), afternoon_adult: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Enfant (DH)</label>
                                        <input
                                            type="number"
                                            value={poolPrices.morning_child}
                                            onChange={(e) => setPoolPrices({ ...poolPrices, morning_child: Number(e.target.value), afternoon_child: Number(e.target.value) })}
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-black text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSavePoolPrices}
                            disabled={saving === "pool"}
                            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {saving === "pool" ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer Tarifs Piscine
                        </button>
                    </div>
                </div>
            </div>            {/* ADD / EDIT DRAWER SHEET */}
            <DarkSheet 
                open={isAddDrawerOpen || !!editingItem} 
                onClose={() => { setIsAddDrawerOpen(false); setEditingItem(null); setErrorMessage(""); }}
                title={editingItem ? `Modifier : ${formData.name_fr}` : (drawerType === "lubricants" ? "Ajouter un nouveau Lubrifiant" : "Ajouter un nouveau plat au Restaurant")}
            >
                <form onSubmit={handleSaveItemForm} className="p-6 pb-24 space-y-6">
                    {/* Error within Drawer */}
                    {errorMessage && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 text-red-400 font-bold text-xs">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Nom Français */}
                    <div>
                        <label htmlFor="name_fr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Nom en Français <span className="text-red-500">*</span></label>
                        <input
                            id="name_fr"
                            type="text"
                            required
                            value={formData.name_fr}
                            onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                            placeholder={drawerType === "lubricants" ? "Ex: Cepsa Xtar 5W30" : "Ex: Tajine Kefta"}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                        />
                    </div>

                    {/* Nom Arabe (Restaurant Only) */}
                    {drawerType !== "lubricants" && (
                        <div>
                            <label htmlFor="name_ar" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Nom en Arabe</label>
                            <input
                                id="name_ar"
                                type="text"
                                value={formData.name_ar}
                                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                placeholder="Ex: طاجين كفتة"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors text-right h-[48px] font-arabic"
                            />
                        </div>
                    )}

                    {/* Prix & Temps / Caractéristiques */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="base_price" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">
                                {drawerType === "lubricants" ? "Prix (DH)" : "Prix de Base (DH)"} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="base_price"
                                type="number"
                                required
                                min="1"
                                value={formData.base_price}
                                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                placeholder={drawerType === "lubricants" ? "Ex: 350" : "Ex: 35"}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-amber-500 font-black placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>
                        <div>
                            <label htmlFor="prep_time" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">
                                {drawerType === "lubricants" ? "Caractéristiques (séparées par des virgules)" : "Temps de Préparation"}
                            </label>
                            <input
                                id="prep_time"
                                type="text"
                                value={formData.prep_time}
                                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                                placeholder={drawerType === "lubricants" ? "Ex: Protection Max, Éco-Carburant, Longue Durée" : "Ex: 15 min"}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>
                    </div>

                    {/* Catégorie & Badge */}
                    {drawerType === "lubricants" ? (
                        <div>
                            <label htmlFor="category_id" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Type de Lubrifiant</label>
                            <select
                                id="category_id"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 text-sm text-white font-bold outline-none focus:border-amber-500 transition-colors h-[48px]"
                            >
                                <option value="Synthétique">🛢️ Synthétique</option>
                                <option value="Semi-Synthétique">🛢️ Semi-Synthétique</option>
                                <option value="Minérale">🛢️ Minérale</option>
                                <option value="Huile de Boîte">⚙️ Huile de Boîte</option>
                            </select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category_id" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Catégorie</label>
                                <select
                                    id="category_id"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 text-sm text-white font-bold outline-none focus:border-amber-500 transition-colors h-[48px]"
                                >
                                    <option value="FastFood">🍔 Fast Food / Snacks</option>
                                    <option value="Plats">🍲 Plats & Beldi</option>
                                    <option value="Ftour">🍳 Ftour (Ptit Déj)</option>
                                    <option value="Salades">🥗 Salades</option>
                                    <option value="Desserts">🍰 Desserts</option>
                                    <option value="Boissons">🍹 Boissons</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="badge" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Badge (Optionnel)</label>
                                <input
                                    id="badge"
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="Ex: Populaire, Nouveau"
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Description Française */}
                    <div>
                        <label htmlFor="description_fr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Description en Français <span className="text-red-500">*</span></label>
                        <textarea
                            id="description_fr"
                            rows={3}
                            required
                            value={formData.description_fr}
                            onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                            placeholder={drawerType === "lubricants" ? "Description du lubrifiant, viscosité, compatibilité..." : "Description alléchante..."}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors resize-none"
                        />
                    </div>

                    {/* Description Arabe (Restaurant Only) */}
                    {drawerType !== "lubricants" && (
                        <div>
                            <label htmlFor="description_ar" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Description en Arabe</label>
                            <textarea
                                id="description_ar"
                                rows={3}
                                value={formData.description_ar}
                                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                placeholder="وصف الطبق باللغة العربية..."
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors text-right resize-none font-arabic"
                            />
                        </div>
                    )}

                    {/* Image Upload & URL Fallback */}
                    <div className="space-y-3">
                        <label className="text-[10px] text-gray-400 font-black uppercase block">Image de l'élément</label>
                        
                        {/* File upload widget */}
                        <label className="flex flex-col items-center justify-center gap-2 w-full min-h-[72px] bg-[#1E293B]/40 hover:bg-[#1E293B]/70 border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl cursor-pointer transition-all p-3 text-center">
                            <Camera className="w-5 h-5 text-orange-500" />
                            <div className="text-[11px] font-black text-gray-300">
                                Sélectionner une Image Locale
                            </div>
                            <div className="text-[9px] text-gray-500 font-bold">
                                Fichiers PNG, JPG ou WEBP (Max 2MB)
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, image_url: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>

                        {/* Text URL fall back */}
                        <div>
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider block mb-1">Ou Coller l'URL directe</span>
                            <div className="relative">
                                <ImageIcon className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
                                <input
                                    id="image_url"
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="Collez le lien de votre image"
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                                />
                            </div>
                        </div>

                        {/* Premium image templates (Only for Restaurant) */}
                        {drawerType === "restaurant" && (
                            <div>
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Gabarits Rapides d'Images Unsplash</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {IMAGE_TEMPLATES.map(temp => (
                                        <button
                                            key={temp.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_url: temp.url })}
                                            className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                                                formData.image_url === temp.url
                                                    ? "bg-orange-500 border-orange-500 text-white shadow"
                                                    : "bg-[#0F172A] border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
                                            }`}
                                        >
                                            {temp.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image Preview & Delete */}
                        {formData.image_url && (
                            <div className="flex gap-2 items-start pt-1">
                                <div className="h-28 flex-1 relative rounded-xl overflow-hidden border border-white/10 bg-[#0F172A]">
                                    <Image 
                                        src={formData.image_url} 
                                        alt="Aperçu de l'élément"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image_url: "" })}
                                    className="p-3 bg-red-600/20 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors self-stretch flex items-center justify-center"
                                    title="Supprimer l'image"
                                >
                                    <Trash className="w-4 h-4 animate-pulse" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* VISUAL CUSTOMIZATION OPTIONS BUILDER (Restaurant Only) */}
                    {drawerType !== "lubricants" && (
                        <div className="border-t border-white/5 pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Option & Suppléments</span>
                                <button
                                    type="button"
                                    onClick={() => setIsJsonMode(!isJsonMode)}
                                    className="text-[9px] font-black text-orange-400 hover:text-orange-300 uppercase tracking-wider"
                                >
                                    {isJsonMode ? "Mode Visuel (Facile)" : "Mode Expert (JSON)"}
                                </button>
                            </div>

                            {isJsonMode ? (
                                // Expert JSON mode
                                <div>
                                    <textarea
                                        id="customization_json"
                                        rows={4}
                                        value={formData.customization_json}
                                        onChange={(e) => setFormData({ ...formData, customization_json: e.target.value })}
                                        placeholder='Ex: {"sauce": {"label": "Sauce", "type": "radio", "options": [{"id": "alg", "label": "Algérienne"}]}}'
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors font-mono resize-y"
                                    />
                                    <span className="text-[9px] text-gray-500 mt-1 block">Format JSON brut pour les configurations complexes.</span>
                                </div>
                            ) : (
                                // Visual builder mode
                                <div className="space-y-4">
                                    {visualCustomizations.length === 0 ? (
                                        <div className="text-center py-4 bg-[#0F172A] rounded-2xl border border-white/5 text-[10px] text-gray-500 font-bold">
                                            Aucun supplément / option pour le moment.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {visualCustomizations.map((group, groupIdx) => (
                                                <div key={group.id} className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 space-y-3 relative">
                                                    {/* Group Header */}
                                                    <div className="flex justify-between items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={group.label}
                                                            onChange={(e) => updateGroupLabel(group.id, e.target.value)}
                                                            placeholder="Nom du groupe (ex: Sauce, Suppléments...)"
                                                            className="bg-transparent border-b border-white/10 font-bold text-xs text-white pb-1 outline-none focus:border-orange-500 flex-1"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCustomizationGroup(group.id)}
                                                            className="text-red-500 hover:text-red-400 p-1"
                                                            title="Supprimer ce groupe"
                                                        >
                                                            <Trash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Group Settings */}
                                                    <div className="flex items-center gap-4 text-[10px]">
                                                        <span className="text-gray-500 font-bold uppercase">Type de sélection:</span>
                                                        <label className="flex items-center gap-1.5 cursor-pointer text-white">
                                                            <input
                                                                type="radio"
                                                                name={`group_type_${group.id}`}
                                                                checked={group.type === "radio"}
                                                                onChange={() => updateGroupType(group.id, "radio")}
                                                                className="w-3.5 h-3.5 text-orange-500 bg-[#1E293B] border-white/10"
                                                            />
                                                            Choix Unique (Radio)
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer text-white">
                                                            <input
                                                                type="radio"
                                                                name={`group_type_${group.id}`}
                                                                checked={group.type === "checkbox"}
                                                                onChange={() => updateGroupType(group.id, "checkbox")}
                                                                className="w-3.5 h-3.5 text-orange-500 bg-[#1E293B] border-white/10"
                                                            />
                                                            Choix Multiples (Checkboxes)
                                                        </label>
                                                    </div>

                                                    {/* Options List */}
                                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                                        {group.options.map((option, optionIdx) => (
                                                            <div key={option.id} className="flex items-center gap-2">
                                                                {/* Option label input */}
                                                                <input
                                                                    type="text"
                                                                    value={option.label}
                                                                    onChange={(e) => updateOptionData(group.id, option.id, "label", e.target.value)}
                                                                    placeholder="Option (ex: Fromage, Ketchup)"
                                                                    className="bg-[#1E293B] border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white outline-none focus:border-orange-500 flex-1"
                                                                />
                                                                {/* Option price input */}
                                                                <div className="relative w-20">
                                                                    <input
                                                                        type="number"
                                                                        value={option.price || ""}
                                                                        onChange={(e) => updateOptionData(group.id, option.id, "price", e.target.value)}
                                                                        placeholder="0"
                                                                        className="bg-[#1E293B] border border-white/5 rounded-lg py-1.5 px-2 pl-6 text-xs text-amber-500 font-bold w-full text-right outline-none focus:border-orange-500"
                                                                    />
                                                                    <span className="text-gray-500 text-[10px] absolute left-2 top-2">DH</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeOptionFromGroup(group.id, option.id)}
                                                                    className="text-gray-500 hover:text-red-400 p-1"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => addOptionToGroup(group.id)}
                                                            className="text-[10px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 mt-1"
                                                        >
                                                            <PlusCircle className="w-3.5 h-3.5" /> Ajouter une option
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={addCustomizationGroup}
                                        className="w-full py-2.5 bg-[#0F172A] border border-dashed border-white/10 hover:border-white/20 text-[10px] font-black text-orange-500 hover:text-orange-400 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Créer un groupe de suppléments
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Featured & Available Toggles */}
                    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 space-y-4">
                        {drawerType !== "lubricants" && (
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/10 bg-[#1E293B] text-orange-500 focus:ring-0 cursor-pointer"
                                />
                                <div>
                                    <span className="text-xs font-bold text-white block">Plat Vedette (Featured)</span>
                                    <span className="text-[9px] text-gray-500 block">Sera mis en valeur en haut du menu</span>
                                </div>
                            </label>
                        )}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.is_available}
                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                className="w-5 h-5 rounded border-white/10 bg-[#1E293B] text-orange-500 focus:ring-0 cursor-pointer"
                            />
                            <div>
                                <span className="text-xs font-bold text-white block">Disponible Immédiatement</span>
                                <span className="text-[9px] text-gray-500 block">Visible et commandable directement par le client</span>
                            </div>
                        </label>
                    </div>

                    {/* Submit Section inside Drawer */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {editingItem 
                            ? (drawerType === "lubricants" ? "Mettre à jour le lubrifiant" : "Mettre à jour le plat") 
                            : (drawerType === "lubricants" ? "Ajouter le lubrifiant" : "Ajouter le plat au Restaurant")}
                    </button>
                </form>
            </DarkSheet>
        </div>
    );
}
