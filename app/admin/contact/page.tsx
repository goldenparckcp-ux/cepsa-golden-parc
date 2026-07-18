"use client";

import React, { useState, useEffect } from "react";
import { Save, Phone, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminContactPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [contact, setContact] = useState({
        id: "",
        title_fr: "",
        title_ar: "",
        desc_fr: "",
        desc_ar: "",
        link_path: "",
        email: ""
    });

    const loadContact = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("home_promos")
                .select("*")
                .eq("sort_order", -999)
                .single();
            if (data) {
                setContact({
                    id: data.id,
                    title_fr: data.title_fr || "",
                    title_ar: data.title_ar || "",
                    desc_fr: data.desc_fr || "",
                    desc_ar: data.desc_ar || "",
                    link_path: data.link_path || "",
                    email: data.gradient_class || ""
                });
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadContact();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("home_promos")
                .update({
                    title_fr: contact.title_fr,
                    title_ar: contact.title_ar,
                    desc_fr: contact.desc_fr,
                    desc_ar: contact.desc_ar,
                    link_path: contact.link_path,
                    gradient_class: contact.email
                })
                .eq("id", contact.id);
            
            if (!error) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                        <Phone className="w-8 h-8 text-primary" />
                        Coordonnées & FAQ
                    </h1>
                    <p className="text-gray-400 mt-1">Gérez le numéro de téléphone et les textes affichés dans la boîte de contact en bas de la page FAQ.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading || !contact.id}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Enregistrer
                </button>
            </div>

            {success && (
                <div className="bg-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 border border-green-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                    Modifications enregistrées avec succès !
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="bg-bg-card rounded-2xl border border-white/5 p-6 space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Numéro de téléphone</label>
                        <input
                            type="text"
                            value={contact.link_path}
                            onChange={e => setContact({...contact, link_path: e.target.value})}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                            placeholder="Ex: 06 61 69 01 79"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">Adresse E-mail de support</label>
                        <input
                            type="text"
                            value={contact.email}
                            onChange={e => setContact({...contact, email: e.target.value})}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                            placeholder="Ex: contact@goldenparkstation.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-white font-bold border-b border-white/10 pb-2">Version Française (FR)</h3>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Titre (FR)</label>
                                <input
                                    type="text"
                                    value={contact.title_fr}
                                    onChange={e => setContact({...contact, title_fr: e.target.value})}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Sous-titre / Description (FR)</label>
                                <textarea
                                    value={contact.desc_fr}
                                    onChange={e => setContact({...contact, desc_fr: e.target.value})}
                                    rows={3}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-4" dir="rtl">
                            <h3 className="text-white font-bold border-b border-white/10 pb-2">Version Arabe (AR)</h3>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Titre (AR)</label>
                                <input
                                    type="text"
                                    value={contact.title_ar}
                                    onChange={e => setContact({...contact, title_ar: e.target.value})}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-right"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Sous-titre / Description (AR)</label>
                                <textarea
                                    value={contact.desc_ar}
                                    onChange={e => setContact({...contact, desc_ar: e.target.value})}
                                    rows={3}
                                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-right"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
