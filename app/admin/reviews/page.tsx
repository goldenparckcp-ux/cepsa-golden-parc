"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle, Trash2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { adminDb } from "@/lib/admin-api";

type Review = {
    id: string;
    name: string;
    text: string;
    stars: number;
    is_approved: boolean;
    created_at: string;
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadReviews = async () => {
        setLoading(true);
        setError("");
        try {
            const { data, error } = await adminDb("client_reviews")
                .select("*")
                .order("created_at", { ascending: false });
                
            if (error) throw error;
            setReviews(data || []);
        } catch (err: any) {
            setError("Erreur lors du chargement des avis: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleApprove = async (id: string, currentStatus: boolean) => {
        setActionLoading(id);
        try {
            const { error } = await adminDb("client_reviews")
                .update({ is_approved: !currentStatus })
                .eq("id", id);
                
            if (error) throw error;
            setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
        } catch (err: any) {
            alert("Erreur: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
        
        setActionLoading(id);
        try {
            const { error } = await adminDb("client_reviews")
                .delete()
                .eq("id", id);
                
            if (error) throw error;
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            alert("Erreur: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Star className="w-8 h-8 text-amber-500" />
                        Avis Clients
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm font-medium">
                        Gérez les commentaires et les notes laissés par vos clients.
                    </p>
                </div>
                
                <button 
                    onClick={loadReviews}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Aucun avis</h3>
                    <p className="text-gray-400">Il n'y a pas encore d'avis clients dans la base de données.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reviews.map(review => (
                        <div 
                            key={review.id} 
                            className={`bg-[#0F172A] border ${review.is_approved ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'} rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 transition-all relative overflow-hidden`}
                        >
                            {/* Status Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${review.is_approved ? 'bg-green-500' : 'bg-amber-500'}`} />

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white">{review.name || "Client Anonyme"}</h3>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-4 h-4 ${i < review.stars ? "fill-amber-500 text-amber-500" : "fill-transparent text-gray-600"}`} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 ml-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-gray-300 bg-white/5 p-4 rounded-xl text-sm italic">
                                    "{review.text}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={() => handleApprove(review.id, review.is_approved)}
                                    disabled={actionLoading === review.id}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                                        review.is_approved 
                                            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20" 
                                            : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                                    }`}
                                >
                                    {actionLoading === review.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    {review.is_approved ? "Masquer" : "Approuver"}
                                </button>
                                
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    disabled={actionLoading === review.id}
                                    className="flex items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
                                    title="Supprimer"
                                >
                                    {actionLoading === review.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
