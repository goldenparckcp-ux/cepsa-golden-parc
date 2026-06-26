"use client";

import React, { useState, useEffect } from "react";
import { 
    PlusCircle, Save, RefreshCw, CheckCircle2, Image as ImageIcon, 
    Trash2, Edit, X, Star, EyeOff, Search 
} from "lucide-react";
import { adminDb } from "@/lib/admin-api";

// Selection of quick Unsplash image templates for premium styling
const IMAGE_TEMPLATES = [
    { name: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
    { name: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
    { name: "Plat Beldi", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800" },
    { name: "Salade", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
    { name: "Café / Jus", url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800" },
    { name: "Dessert", url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800" }
];

const INITIAL_FORM = {
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
};

export default function AdminContentPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Edit mode
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM);

    useEffect(() => {
        // Basic auth check
        const stored = localStorage.getItem("staff_session");
        if (!stored) {
            window.location.href = "/admin";
            return;
        }
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setFetchLoading(true);
        try {
            const { data, error } = await adminDb("restaurant_items")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error("Error fetching items:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name_fr || !formData.base_price || !formData.description_fr) {
            alert("Veuillez remplir au moins le nom, le prix et la description en Français.");
            return;
        }

        setLoading(true);
        setSuccessMessage("");

        const payload = {
            name_fr: formData.name_fr,
            name_ar: formData.name_ar,
            category_id: formData.category_id,
            base_price: Number(formData.base_price),
            description_fr: formData.description_fr,
            description_ar: formData.description_ar,
            image_url: formData.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
            prep_time: formData.prep_time,
            badge: formData.badge || null,
            is_featured: formData.is_featured,
            is_available: formData.is_available
        };

        try {
            if (editingId) {
                // Update
                const { error } = await adminDb("restaurant_items")
                    .update(payload)
                    .eq("id", editingId);
                if (error) throw error;
                setSuccessMessage(`Plat "${formData.name_fr}" modifié avec succès !`);
            } else {
                // Insert
                const { error } = await adminDb("restaurant_items")
                    .insert([payload]);
                if (error) throw error;
                setSuccessMessage(`Plat "${formData.name_fr}" ajouté avec succès !`);
            }
            
            setFormData(INITIAL_FORM);
            setEditingId(null);
            fetchItems();
            window.scrollTo({ top: 0, behavior: "smooth" });
            
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (err: any) {
            alert("Erreur de sauvegarde: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            name_fr: item.name_fr || "",
            name_ar: item.name_ar || "",
            category_id: item.category_id || "FastFood",
            base_price: item.base_price?.toString() || "",
            description_fr: item.description_fr || "",
            description_ar: item.description_ar || "",
            image_url: item.image_url || "",
            prep_time: item.prep_time || "15 min",
            badge: item.badge || "",
            is_featured: item.is_featured || false,
            is_available: item.is_available ?? true
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ? Cette action est irréversible.`)) {
            return;
        }
        
        try {
            const { error } = await adminDb("restaurant_items").delete().eq("id", id);
            if (error) throw error;
            setSuccessMessage(`Plat "${name}" supprimé.`);
            fetchItems();
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (err: any) {
            alert("Erreur lors de la suppression: " + err.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(INITIAL_FORM);
    };

    const toggleAvailability = async (id: number, currentStatus: boolean) => {
        try {
            await adminDb("restaurant_items").update({ is_available: !currentStatus }).eq("id", id);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredItems = items.filter(item => 
        item.name_fr?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.category_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-16 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/10">
                    <PlusCircle className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Gestion de Contenu</h1>
                    <p className="text-xs text-gray-400 font-medium">Ajoutez, modifiez ou supprimez les plats du menu</p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 text-green-400 font-bold text-sm animate-shake">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: FORM */}
                <div className="xl:col-span-1">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 relative overflow-hidden sticky top-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">
                                {editingId ? "Modifier le plat" : "Nouveau plat"}
                            </h2>
                            {editingId && (
                                <button onClick={handleCancelEdit} type="button" className="text-gray-400 hover:text-white flex items-center gap-1 text-xs bg-white/5 px-2 py-1 rounded-lg">
                                    <X className="w-3 h-3" /> Annuler
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nom Français */}
                            <div>
                                <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Nom FR <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name_fr}
                                    onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500"
                                />
                            </div>

                            {/* Nom Arabe */}
                            <div>
                                <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Nom AR</label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold placeholder-gray-600 outline-none focus:border-amber-500 text-right"
                                />
                            </div>

                            {/* Prix & Categorie */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Prix (DH) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.base_price}
                                        onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-sm text-amber-500 font-black outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Catégorie</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:border-amber-500"
                                    >
                                        <option value="FastFood">Fast Food</option>
                                        <option value="Plats">Plats & Beldi</option>
                                        <option value="Ftour">Ftour</option>
                                        <option value="Salades">Salades</option>
                                        <option value="Desserts">Desserts</option>
                                        <option value="Boissons">Boissons</option>
                                    </select>
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div>
                                <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Description FR <span className="text-red-500">*</span></label>
                                <textarea
                                    rows={2}
                                    required
                                    value={formData.description_fr}
                                    onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:border-amber-500 resize-none"
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Description AR</label>
                                <textarea
                                    rows={2}
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-sm text-white font-bold outline-none focus:border-amber-500 resize-none text-right"
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="text-[10px] text-gray-400 font-black uppercase mb-1.5 block">Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {IMAGE_TEMPLATES.map(temp => (
                                        <button
                                            key={temp.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_url: temp.url })}
                                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                                formData.image_url === temp.url
                                                    ? "bg-amber-500 text-black"
                                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                            }`}
                                        >
                                            {temp.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Switches */}
                            <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-[#0F172A] text-amber-500 focus:ring-0"
                                    />
                                    <span className="text-xs font-bold text-white">Vedette (Star)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-[#0F172A] text-amber-500 focus:ring-0"
                                    />
                                    <span className="text-xs font-bold text-white">En Stock</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-black font-black text-sm rounded-xl flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingId ? "Enregistrer les modifications" : "Ajouter au menu"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: LIST */}
                <div className="xl:col-span-2">
                    <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-6 flex flex-col h-full min-h-[600px]">
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <h2 className="text-lg font-bold text-white">Menu Actuel ({items.length})</h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher un plat..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:border-amber-500 outline-none"
                                />
                            </div>
                        </div>

                        {fetchLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <RefreshCw className="w-8 h-8 animate-spin mb-3 text-amber-500" />
                                <p>Chargement des plats...</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <p>Aucun plat trouvé.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: "calc(100vh - 250px)" }}>
                                {filteredItems.map(item => (
                                    <div key={item.id} className={`bg-[#0F172A] border border-white/5 rounded-2xl p-3 flex gap-4 transition-all ${editingId === item.id ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : 'hover:border-white/10'}`}>
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-[#1E293B]">
                                            <img src={item.image_url} alt={item.name_fr} className="w-full h-full object-cover" />
                                            {!item.is_available && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                    <EyeOff className="w-6 h-6 text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-white font-bold truncate text-sm">
                                                    {item.is_featured && <Star className="w-3 h-3 text-amber-400 inline mr-1 fill-amber-400" />}
                                                    {item.name_fr}
                                                </h3>
                                                <span className="text-amber-500 font-black text-sm shrink-0">{item.base_price} DH</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.category_id}</p>
                                            
                                            <div className="mt-auto pt-3 flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className="flex-1 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    <Edit className="w-3 h-3" /> Modifier
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id, item.name_fr)}
                                                    className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => toggleAvailability(item.id, item.is_available)}
                                                    className={`p-1.5 rounded-lg transition-colors ${item.is_available ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'}`}
                                                    title={item.is_available ? "Désactiver" : "Activer"}
                                                >
                                                    {item.is_available ? <CheckCircle2 className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
