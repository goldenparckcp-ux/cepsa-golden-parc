"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Save, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type HeroSlide = {
    id: string;
    page: 'hotel' | 'restaurant' | 'pool';
    title: string;
    subtitle: string;
    badge_text: string;
    cta_text: string;
    image_url: string;
    order_index: number;
    is_active: boolean;
};

export default function AdminHeroPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState<'hotel' | 'restaurant' | 'pool'>('hotel');
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchSlides();
    }, [activePage]);

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

    const handleSave = async (slide: HeroSlide) => {
        const isNew = !slide.id;
        const { data, error } = isNew 
            ? await supabase.from('hero_sliders').insert([slide]).select()
            : await supabase.from('hero_sliders').update(slide).eq('id', slide.id).select();

        if (!error) {
            setEditingSlide(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            fetchSlides();
        } else {
            console.error("Error saving slide:", error);
            alert("Erreur lors de la sauvegarde.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce slide ?")) return;
        const { error } = await supabase.from('hero_sliders').delete().eq('id', id);
        if (!error) {
            fetchSlides();
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-wider">Gestion des Sliders</h1>
                    <p className="text-gray-400 mt-1">Personnalisez les images et textes des bannières principales.</p>
                </div>
                <div className="flex bg-[#111827] rounded-xl border border-white/10 p-1">
                    {(['hotel', 'restaurant', 'pool'] as const).map((page) => (
                        <button
                            key={page}
                            onClick={() => setActivePage(page)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                                activePage === page ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </div>

            {/* List of Slides */}
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
                                        <button onClick={() => handleDelete(slide.id)} className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors">
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

                        {/* Add New Button */}
                        <button 
                            onClick={() => setEditingSlide({ id: '', page: activePage, title: '', subtitle: '', badge_text: '', cta_text: '', image_url: '', order_index: slides.length, is_active: true })}
                            className="h-full min-h-[300px] border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-amber-500 transition-colors bg-white/5 hover:bg-white/10 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-amber-500/20 flex items-center justify-center transition-colors">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="font-bold uppercase tracking-widest text-sm">Ajouter un Slide</span>
                        </button>
                    </>
                )}
            </div>

            {/* Edit Modal */}
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
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Texte Bouton (Optionnel)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.cta_text || ''}
                                        onChange={e => setEditingSlide({...editingSlide, cta_text: e.target.value})}
                                        className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Ex: Réserver"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image URL</label>
                                <input 
                                    type="text" 
                                    value={editingSlide.image_url}
                                    onChange={e => setEditingSlide({...editingSlide, image_url: e.target.value})}
                                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="https://..."
                                />
                                {editingSlide.image_url && (
                                    <div className="mt-4 relative h-40 w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                                        <Image src={editingSlide.image_url} alt="Preview" fill className="object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#111827] flex justify-end gap-4">
                            <button onClick={() => setEditingSlide(null)} className="px-6 py-3 rounded-xl text-white font-bold hover:bg-white/5 transition-colors">Annuler</button>
                            <button onClick={() => handleSave(editingSlide)} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/25">
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
                    <span className="font-bold">Slide sauvegardé avec succès!</span>
                </div>
            )}
        </div>
    );
}
