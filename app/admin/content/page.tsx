"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Utensils, Save, RefreshCw, CheckCircle2, Image as ImageIcon, Camera, Layout } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminContentAdditionPage() {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

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
        is_available: true
    });

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
    }, []);

    // Selection of quick Unsplash image templates for premium styling
    const IMAGE_TEMPLATES = [
        { name: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
        { name: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
        { name: "Plat Beldi", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800" },
        { name: "Salade", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
        { name: "Café / Jus", url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800" },
        { name: "Dessert", url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name_fr || !formData.base_price || !formData.description_fr) {
            alert("Veuillez remplir au moins le nom, le prix et la description en Français.");
            return;
        }

        setLoading(true);
        setSuccessMessage("");

        // Final payload to Supabase
        const payload = {
            name_fr: formData.name_fr,
            name_ar: formData.name_ar || null,
            category_id: formData.category_id,
            base_price: Number(formData.base_price),
            description_fr: formData.description_fr,
            description_ar: formData.description_ar || null,
            image_url: formData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            prep_time: formData.prep_time,
            badge: formData.badge || null,
            is_featured: formData.is_featured,
            is_available: formData.is_available,
            created_at: new Date().toISOString()
        };

        try {
            const { error } = await supabase
                .from("restaurant_items")
                .insert([payload]);

            if (error) throw error;

            setSuccessMessage(`Plat "${formData.name_fr}" enregistré avec succès dans la base de données !`);
            
            // Reset form fields
            setFormData({
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
                is_available: true
            });

            // Scroll to top
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err: any) {
            console.error("Content insert failed:", err);
            // If table doesn't support live inserts directly or constraints are missing
            alert("Erreur de sauvegarde: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-16 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/10">
                    <PlusCircle className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Ajouter du Contenu</h1>
                    <p className="text-xs text-gray-400 font-medium">Ajout direct de nouveaux articles ou spécialités culinaires au restaurant</p>
                </div>
            </div>

            {/* Success notification banner */}
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 text-green-400 font-bold text-sm animate-shake">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom & Prix row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Nom Français */}
                        <div>
                            <label htmlFor="nameFr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Nom en Français <span className="text-red-500">*</span></label>
                            <input
                                id="nameFr"
                                type="text"
                                required
                                value={formData.name_fr}
                                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                                placeholder="Ex: Tacos Mixte Royal"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>

                        {/* Nom Arabe */}
                        <div>
                            <label htmlFor="nameAr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Nom en Arabe</label>
                            <input
                                id="nameAr"
                                type="text"
                                value={formData.name_ar}
                                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                placeholder="Ex: طاكوس مشكل ملكي"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors text-right h-[48px]"
                            />
                        </div>

                        {/* Prix de Base */}
                        <div>
                            <label htmlFor="basePrice" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Prix de Base (DH) <span className="text-red-500">*</span></label>
                            <input
                                id="basePrice"
                                type="number"
                                required
                                min="1"
                                value={formData.base_price}
                                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                placeholder="Ex: 55"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-amber-500 font-black placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>
                    </div>

                    {/* Catégorie & Temps & Badge */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Catégorie */}
                        <div>
                            <label htmlFor="categorySelect" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Catégorie</label>
                            <select
                                id="categorySelect"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-amber-500 transition-colors h-[48px] appearance-none"
                            >
                                <option value="FastFood">🍔 Fast Food / Snacks</option>
                                <option value="Plats">🍲 Plats & Beldi</option>
                                <option value="Ftour">🍳 Ftour (Ptit Déj)</option>
                                <option value="Salades">🥗 Salades</option>
                                <option value="Desserts">🍰 Desserts</option>
                                <option value="Boissons">🍹 Boissons</option>
                            </select>
                        </div>

                        {/* Temps de Préparation */}
                        <div>
                            <label htmlFor="prepTime" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Temps de Préparation</label>
                            <input
                                id="prepTime"
                                type="text"
                                value={formData.prep_time}
                                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                                placeholder="Ex: 15 min"
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>

                        {/* Badge Optionnel */}
                        <div>
                            <label htmlFor="badgeText" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Badge Optionnel</label>
                            <input
                                id="badgeText"
                                type="text"
                                value={formData.badge}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                placeholder="Ex: Populaire, Nouveau..."
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                            />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Desc Français */}
                        <div>
                            <label htmlFor="descFr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Description en Français <span className="text-red-500">*</span></label>
                            <textarea
                                id="descFr"
                                rows={3}
                                required
                                value={formData.description_fr}
                                onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                                placeholder="Description alléchante du plat..."
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors resize-none"
                            />
                        </div>

                        {/* Desc Arabe */}
                        <div>
                            <label htmlFor="descAr" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">Description en Arabe</label>
                            <textarea
                                id="descAr"
                                rows={3}
                                value={formData.description_ar}
                                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                placeholder="وصف الطبق باللغة العربية..."
                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 transition-colors text-right resize-none"
                            />
                        </div>
                    </div>

                    {/* IMAGE SELECTION & INPUT */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="imageUrl" className="text-[10px] text-gray-400 font-black uppercase mb-2 block">URL de l'Image du Plat</label>
                            <div className="relative">
                                <ImageIcon className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
                                <input
                                    id="imageUrl"
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="Collez l'URL de votre image ou sélectionnez un template rapide ci-dessous"
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors h-[48px]"
                                />
                            </div>
                        </div>

                        {/* Quick Templates List */}
                        <div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-2">Modèles d'Images Premium Rapides</span>
                            <div className="flex flex-wrap gap-2">
                                {IMAGE_TEMPLATES.map(temp => (
                                    <button
                                        key={temp.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image_url: temp.url })}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                            formData.image_url === temp.url
                                                ? "bg-amber-500 border-amber-500 text-black shadow-md shadow-amber-500/10"
                                                : "bg-[#0F172A] border-white/5 text-gray-300 hover:border-white/10"
                                        }`}
                                    >
                                        {temp.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* TOGGLES SWITCHES */}
                    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-6 justify-around">
                        {/* Featured */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="w-5 h-5 rounded border-white/10 bg-[#1E293B] text-amber-500 focus:ring-0 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-bold text-white block">Plat Vedette (Featured)</span>
                                <span className="text-[10px] text-gray-500 block">Sera mis en valeur en haut du menu</span>
                            </div>
                        </label>

                        {/* Available */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.is_available}
                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                className="w-5 h-5 rounded border-white/10 bg-[#1E293B] text-amber-500 focus:ring-0 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-bold text-white block">Disponible Immédiatement</span>
                                <span className="text-[10px] text-gray-500 block">Les clients pourront le commander dès maintenant</span>
                            </div>
                        </label>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-black font-black text-sm rounded-xl shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer dans le Menu Restaurant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
