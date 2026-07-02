"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, CheckCircle2, Sliders } from "lucide-react";
import Image from "next/image";

type HeroSlide = {
    id: string;
    page: 'restaurant' | 'pool' | 'lubricants' | 'hotel';
    title: string;
    subtitle: string;
    badge_text: string;
    cta_text: string;
    image_url: string;
    order_index: number;
    is_active: boolean;
};

type GalleryItem = {
    id: string;
    image_url: string;
    caption: string;
    order_index: number;
};

export default function AdminHeroPage() {
    const [adminMode, setAdminMode] = useState<'hero' | 'gallery'>('hero');
    
    // Sliders state
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [activePage, setActivePage] = useState<'restaurant' | 'pool' | 'lubricants' | 'hotel'>('restaurant');
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

    // Gallery state
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (adminMode === 'hero') {
            fetchSlides();
        } else {
            fetchGallery();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePage, adminMode]);

    const fetchSlides = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hero_sliders')
            .select('*')
            .eq('page', activePage)
            .order('order_index', { ascending: true });

        if (!error && data) {
            setSlides(data as HeroSlide[]);
        }
        setLoading(false);
    };

    const fetchGallery = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('station_gallery')
            .select('*')
            .order('order_index', { ascending: true });

        if (!error && data) {
            setGalleryItems(data as GalleryItem[]);
        }
        setLoading(false);
    };

    const handleSaveSlide = async (slide: HeroSlide) => {
        const { id, ...rest } = slide;
        const isNew = !id;
        const { error } = isNew 
            ? await supabase.from('hero_sliders').insert([rest])
            : await supabase.from('hero_sliders').update(rest).eq('id', id);

        if (!error) {
            setEditingSlide(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            fetchSlides();
        } else {
            console.error("Error saving slide:", error);
            alert("Erreur lors de la sauvegarde: " + error.message);
        }
    };

    const handleDeleteSlide = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce slide ?")) return;
        const { error } = await supabase.from('hero_sliders').delete().eq('id', id);
        if (!error) {
            fetchSlides();
        }
    };

    const handleSaveGallery = async (item: GalleryItem) => {
        const { id, ...rest } = item;
        const isNew = !id;
        const { error } = isNew
            ? await supabase.from('station_gallery').insert([rest])
            : await supabase.from('station_gallery').update(rest).eq('id', id);

        if (!error) {
            setEditingItem(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            fetchGallery();
        } else {
            console.error("Error saving gallery item:", error);
            alert("Erreur lors de la sauvegarde: " + error.message);
        }
    };

    const handleDeleteGallery = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette image de la galerie ?")) return;
        const { error } = await supabase.from('station_gallery').delete().eq('id', id);
        if (!error) {
            fetchGallery();
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header and Mode Selector */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-wider">Gestion du Contenu Visuel</h1>
                    <p className="text-gray-400 mt-1">Personnalisez les bannières principales et les photos de la station.</p>
                </div>
                
                {/* Mode Selector Tabs */}
                <div className="flex bg-[#111827] rounded-2xl border border-white/10 p-1.5 gap-1.5 shrink-0 shadow-lg">
                    <button
                        onClick={() => setAdminMode('hero')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            adminMode === 'hero' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Sliders className="w-4 h-4" /> Bannières (Hero Sliders)
                    </button>
                    <button
                        onClick={() => setAdminMode('gallery')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            adminMode === 'gallery' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" /> Galerie Photos (Station)
                    </button>
                </div>
            </div>

            {adminMode === 'hero' ? (
                // --- HERO SLIDERS VIEW ---
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-lg font-black text-white uppercase tracking-wide">Modifier les bannières par page</h2>
                        <div className="flex flex-wrap bg-[#111827] rounded-xl border border-white/10 p-1 gap-1">
                            {(['restaurant', 'pool', 'lubricants', 'hotel'] as const).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setActivePage(page)}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        activePage === page ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {page === 'lubricants' ? 'Lubrifiants' : page === 'pool' ? 'Piscine' : page}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full h-64 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {slides.map((slide) => (
                                    <div key={slide.id} className="group relative bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-colors shadow-2xl">
                                        <div className="relative h-48 w-full bg-black">
                                            {slide.image_url ? (
                                                <Image src={slide.image_url} alt={slide.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-white/20"><ImageIcon className="w-12 h-12" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <button onClick={() => setEditingSlide(slide)} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteSlide(slide.id)} className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {slide.badge_text && (
                                                <div className="absolute top-4 left-4 bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded">
                                                    {slide.badge_text}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-white font-bold text-lg mb-1">{slide.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2">{slide.subtitle}</p>
                                        </div>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setEditingSlide({ id: '', page: activePage, title: '', subtitle: '', badge_text: '', cta_text: '', image_url: '', order_index: slides.length, is_active: true })}
                                    className="h-full min-h-[300px] border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-amber-500 transition-colors bg-white/5 hover:bg-white/10 group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-xs">Ajouter un Slide</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                // --- PHOTO GALLERY VIEW ---
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-black text-white uppercase tracking-wide">Galerie d'images de la station (Accueil)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full h-64 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {galleryItems.map((item) => (
                                    <div key={item.id} className="group relative bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-colors shadow-2xl">
                                        <div className="relative h-48 w-full bg-black">
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.caption} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-white/20"><ImageIcon className="w-12 h-12" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <button onClick={() => setEditingItem(item)} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteGallery(item.id)} className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="absolute top-4 left-4 bg-[#0F172A]/80 border border-white/10 text-white text-[10px] font-black px-2.5 py-1 rounded-xl">
                                                Ordre: {item.order_index}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-white font-bold text-base">{item.caption}</h3>
                                        </div>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setEditingItem({ id: '', image_url: '', caption: '', order_index: galleryItems.length })}
                                    className="h-full min-h-[300px] border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-amber-500 transition-colors bg-white/5 hover:bg-white/10 group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-xs">Ajouter une Image</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Sliders Edit Modal */}
            {editingSlide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingSlide(null)} />
                    <div className="relative bg-[#0B0F19] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">{editingSlide.id ? 'Modifier Slide' : 'Nouveau Slide'}</h2>
                            <button onClick={() => setEditingSlide(null)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Titre</label>
                                <input 
                                    type="text" 
                                    value={editingSlide.title}
                                    onChange={e => setEditingSlide({...editingSlide, title: e.target.value})}
                                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Ex: Votre Séjour de Rêve"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sous-titre</label>
                                <textarea 
                                    value={editingSlide.subtitle}
                                    onChange={e => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors min-h-[80px]"
                                    placeholder="Ex: Détente et confort absolu au cœur du Golden Park"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Badge (Optionnel)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.badge_text}
                                        onChange={e => setEditingSlide({...editingSlide, badge_text: e.target.value})}
                                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Ex: OFFRE SPÉCIALE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ordre de tri</label>
                                    <input 
                                        type="number" 
                                        value={editingSlide.order_index}
                                        onChange={e => setEditingSlide({...editingSlide, order_index: Number(e.target.value)})}
                                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Image</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={editingSlide.image_url}
                                        onChange={(e) => setEditingSlide({ ...editingSlide, image_url: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                    <div className="relative">
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            id="upload-image"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    const ext = file.name.split('.').pop();
                                                    const fileName = `${Date.now()}.${ext}`;
                                                    const { error } = await supabase.storage
                                                        .from('images')
                                                        .upload(`heroes/${fileName}`, file, {
                                                            cacheControl: '3600',
                                                            upsert: false
                                                        });
                                                    if (error) throw error;
                                                    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(`heroes/${fileName}`);
                                                    setEditingSlide({ ...editingSlide, image_url: publicUrl });
                                                } catch (err: any) {
                                                    alert("Erreur upload: " + err.message);
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="upload-image" 
                                            className="cursor-pointer flex items-center justify-center gap-2 w-full py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-sm font-bold text-gray-300 transition-colors"
                                        >
                                            <ImageIcon className="w-4 h-4" /> Uploader une image
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {editingSlide.image_url && (
                                <div className="mt-4 relative h-40 w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                                    <Image src={editingSlide.image_url} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#111827] flex justify-end gap-4">
                            <button onClick={() => setEditingSlide(null)} className="px-6 py-3 rounded-xl text-white font-bold hover:bg-white/5 transition-colors">Annuler</button>
                            <button onClick={() => handleSaveSlide(editingSlide)} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/25">
                                <Save className="w-5 h-5" />
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
                    <div className="relative bg-[#0B0F19] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">{editingItem.id ? 'Modifier Photo' : 'Ajouter Photo'}</h2>
                            <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Légende (Caption)</label>
                                <input 
                                    type="text" 
                                    value={editingItem.caption}
                                    onChange={e => setEditingItem({...editingItem, caption: e.target.value})}
                                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Ex: Station Carburant"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ordre de tri</label>
                                <input 
                                    type="number" 
                                    value={editingItem.order_index}
                                    onChange={e => setEditingItem({...editingItem, order_index: Number(e.target.value)})}
                                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Image</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={editingItem.image_url}
                                        onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                    <div className="relative">
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            id="upload-gallery-image"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    const ext = file.name.split('.').pop();
                                                    const fileName = `${Date.now()}.${ext}`;
                                                    const { error } = await supabase.storage
                                                        .from('images')
                                                        .upload(`gallery/${fileName}`, file, {
                                                            cacheControl: '3600',
                                                            upsert: false
                                                        });
                                                    if (error) throw error;
                                                    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(`gallery/${fileName}`);
                                                    setEditingItem({ ...editingItem, image_url: publicUrl });
                                                } catch (err: any) {
                                                    alert("Erreur upload: " + err.message);
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="upload-gallery-image" 
                                            className="cursor-pointer flex items-center justify-center gap-2 w-full py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-sm font-bold text-gray-300 transition-colors"
                                        >
                                            <ImageIcon className="w-4 h-4" /> Uploader une image
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {editingItem.image_url && (
                                <div className="mt-4 relative h-40 w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                                    <Image src={editingItem.image_url} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#111827] flex justify-end gap-4">
                            <button onClick={() => setEditingItem(null)} className="px-6 py-3 rounded-xl text-white font-bold hover:bg-white/5 transition-colors">Annuler</button>
                            <button onClick={() => handleSaveGallery(editingItem)} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/25">
                                <Save className="w-5 h-5" />
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in z-50">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold">Modifications sauvegardées avec succès!</span>
                </div>
            )}
        </div>
    );
}
