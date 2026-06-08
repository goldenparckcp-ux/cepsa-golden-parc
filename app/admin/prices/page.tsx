"use client";

import React, { useState, useEffect } from "react";
import { 
    DollarSign, Save, RefreshCw, Sparkles, AlertCircle, CheckCircle2, 
    Utensils, Bed, Ticket, Plus, Trash2, Edit3, Camera, X, Star, 
    ImageIcon, Eye, EyeOff, LayoutGrid, GripVertical, PlusCircle, Trash
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

    // Restaurant Items state
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");

    // Drag and Drop states
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Drawer / Modal states
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Form fields state
    const [formData, setFormData] = useState({
        name_fr: "",
        name_ar: "",
        category_id: "FastFood",
        base_price: "",
        description_fr: "",
        description_ar: "",
        image_url: "",
        prep_time: "15 min",
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
        groups.forEach(group => {
            if (!group.label.trim()) return; // Skip unnamed groups
            const cleanOptions = group.options
                .filter(opt => opt.label.trim())
                .map(opt => ({
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
    };

    const loadData = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            // Load restaurant items from DB
            const { data, error } = await supabase.from("restaurant_items").select("*");
            if (error) throw error;
            if (data) {
                // Sort by sort_order ascending, then category weight
                const categoryWeights: Record<string, number> = { Ftour: 1, Snacks: 2, Plats: 3, Boissons: 4, Desserts: 5 };
                const sorted = [...data].sort((a, b) => {
                    if ((a.sort_order || 0) !== (b.sort_order || 0)) {
                        return (a.sort_order || 0) - (b.sort_order || 0);
                    }
                    const wA = categoryWeights[a.category_id] || 99;
                    const wB = categoryWeights[b.category_id] || 99;
                    if (wA !== wB) return wA - wB;
                    return a.name_fr.localeCompare(b.name_fr);
                });

                // Resequence locally to ensure valid, clean sort_order values (1, 2, 3...)
                const resequenced = sorted.map((item, idx) => ({
                    ...item,
                    sort_order: item.sort_order || (idx + 1)
                }));
                
                setMenuItems(resequenced);

                // Auto-sync missing sort_orders to database in background
                const needsMigration = data.some(item => !item.sort_order);
                if (needsMigration) {
                    for (let i = 0; i < resequenced.length; i++) {
                        if (!data.find(x => x.id === resequenced[i].id)?.sort_order) {
                            supabase.from("restaurant_items").update({ sort_order: resequenced[i].sort_order }).eq("id", resequenced[i].id).then();
                        }
                    }
                }
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
            setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, base_price: newPrice } : item));
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

            if (error) throw error;

            // Update local state
            setMenuItems(prev => prev.map(x => x.id === item.id ? { ...x, is_available: nextState } : x));
            showSuccess(`Le plat est maintenant ${nextState ? "Disponible" : "Indisponible"}`);
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
    };

    const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        // Get the original global sort_orders of the filtered items (sorted)
        const originalOrders = filteredRestoItems
            .map(item => item.sort_order || 0)
            .sort((a, b) => a - b);

        // Reorder locally in the current category list
        const updatedFiltered = [...filteredRestoItems];
        const [movedItem] = updatedFiltered.splice(draggedIndex, 1);
        updatedFiltered.splice(targetIndex, 0, movedItem);

        // Assign the original sort_orders to the new ordered filtered items
        const updatedFilteredWithOrders = updatedFiltered.map((item, idx) => ({
            ...item,
            sort_order: originalOrders[idx]
        }));

        // Merge back into the main menuItems array
        const updatedAll = menuItems.map(item => {
            const match = updatedFilteredWithOrders.find(x => x.id === item.id);
            if (match) {
                return match;
            }
            return item;
        });

        // Sort the entire list globally by sort_order
        const sortedAll = updatedAll.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setMenuItems(sortedAll);
        setDraggedIndex(null);

        // Save new order to Supabase
        try {
            const updates = updatedFilteredWithOrders.map((item) => {
                const originalItem = menuItems.find(x => x.id === item.id);
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
    };

    // Open drawer to add a new item
    const openAddDrawer = () => {
        setFormData({
            name_fr: "",
            name_ar: "",
            category_id: activeCategory === "all" ? "FastFood" : activeCategory,
            base_price: "",
            description_fr: "",
            description_ar: "",
            image_url: "",
            prep_time: "15 min",
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
    };

    // Save added or edited item to DB
    const handleSaveItemForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        
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
                const maxSort = menuItems.reduce((max, item) => Math.max(max, item.sort_order || 0), 0);
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

    // Customization Builder Actions
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

    // Update Hotel Room Prices in LocalStorage (Shared setting simulation)
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
    });

    return (
        <div className="space-y-8 pb-16 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1E293B]/40 p-6 rounded-3xl border border-white/5 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-tr from-[#EA580C] to-amber-500 rounded-2xl shadow-lg shadow-amber-500/10">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Modification des Prix & Menu</h1>
                        <p className="text-xs text-gray-400 font-medium">Glissez-déposez pour réordonner le menu restaurant, et modifiez les tarifs en direct</p>
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
                {/* 1. VISUAL RESTAURANT MENU MANAGER */}
                <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-orange-500" />
                            Grille Restaurant (Visual Menu Editor)
                        </h3>

                        {/* Quick Add "+" Button */}
                        <button
                            onClick={openAddDrawer}
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
                        <div className="h-[68vh] lg:h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
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
                                                            onClick={(e) => { e.stopPropagation(); openEditDrawer(item); }}
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
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* 2. SERVICES & HOTEL PRICING CONTROL (PRO CONFIG PANEL) */}
                <div className="space-y-8">
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
            </div>

            {/* ADD / EDIT DRAWER SHEET */}
            <DarkSheet 
                open={isAddDrawerOpen || !!editingItem} 
                onClose={() => { setIsAddDrawerOpen(false); setEditingItem(null); setErrorMessage(""); }}
                title={editingItem ? `Modifier : ${formData.name_fr}` : "Ajouter un nouveau plat au Restaurant"}
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
                            placeholder="Ex: Tajine Kefta"
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                        />
                    </div>

                    {/* Nom Arabe */}
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

                    {/* Prix de Base & Temps */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="base_price" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Prix de Base (DH) <span className="text-red-500">*</span></label>
                            <input
                                id="base_price"
                                type="number"
                                required
                                min="1"
                                value={formData.base_price}
                                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                placeholder="Ex: 35"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-amber-500 font-black placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>
                        <div>
                            <label htmlFor="prep_time" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Temps de Préparation</label>
                            <input
                                id="prep_time"
                                type="text"
                                value={formData.prep_time}
                                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                                placeholder="Ex: 15 min"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>
                    </div>

                    {/* Catégorie & Badge */}
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

                    {/* Description Française */}
                    <div>
                        <label htmlFor="description_fr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Description en Français <span className="text-red-500">*</span></label>
                        <textarea
                            id="description_fr"
                            rows={3}
                            required
                            value={formData.description_fr}
                            onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                            placeholder="Description alléchante..."
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors resize-none"
                        />
                    </div>

                    {/* Description Arabe */}
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

                    {/* Image URL & Preview */}
                    <div>
                        <label htmlFor="image_url" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">URL de l'Image</label>
                        <div className="relative mb-2">
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

                        {/* Premium image templates */}
                        <div className="mb-3">
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

                        {/* Image Preview Window */}
                        {formData.image_url && (
                            <div className="h-28 relative rounded-xl overflow-hidden border border-white/10 bg-[#0F172A]">
                                <Image 
                                    src={formData.image_url} 
                                    alt="Aperçu du plat"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                    </div>

                    {/* VISUAL CUSTOMIZATION OPTIONS BUILDER */}
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

                    {/* Featured & Available Toggles */}
                    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 space-y-4">
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
                        {editingItem ? "Mettre à jour le plat" : "Ajouter le plat au Restaurant"}
                    </button>
                </form>
            </DarkSheet>
        </div>
    );
}
