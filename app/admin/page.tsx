'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, ShoppingBag, Fuel, Save } from 'lucide-react';

export default function AdminDashboard() {
    const [fuelPrices, setFuelPrices] = useState({
        gasoil: 11.50,
        sansPlomb: 14.20,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeOrders: 0,
    });

    useEffect(() => {
        loadStats();
        loadFuelPrices();
    }, []);

    const loadStats = async () => {
        try {
            // TODO: Fetch real stats from database
            // Mock data for now
            setStats({
                totalRevenue: 15420.50,
                activeOrders: 12,
            });
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const loadFuelPrices = async () => {
        try {
            // TODO: Fetch from database
            // const { data } = await supabase.from('fuel_prices').select('*').single();
            // setFuelPrices(data);
        } catch (err) {
            console.error('Error loading fuel prices:', err);
        }
    };

    const handleUpdateFuelPrices = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // TODO: Update in database
            // await supabase.from('fuel_prices').update({
            //   gasoil: fuelPrices.gasoil,
            //   sans_plomb: fuelPrices.sansPlomb,
            // });

            alert('Fuel prices updated successfully!');
        } catch (err) {
            console.error('Error updating fuel prices:', err);
            alert('Failed to update fuel prices');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-dark p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-text-secondary">Cepsa Golden Park Management</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-navy-surface rounded-2xl border border-navy-border p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">{stats.totalRevenue.toFixed(2)} MAD</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">Today's earnings</p>
                    </div>

                    {/* Active Orders */}
                    <div className="bg-navy-surface rounded-2xl border border-navy-border p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-premium-gold/10 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-premium-gold" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Active Orders</p>
                                <p className="text-2xl font-bold text-white">{stats.activeOrders}</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">Currently processing</p>
                    </div>

                    {/* Hotel Occupancy */}
                    <div className="bg-navy-surface rounded-2xl border border-navy-border p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Hotel Occupancy</p>
                                <p className="text-2xl font-bold text-white">75%</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted">6 of 8 rooms occupied</p>
                    </div>
                </div>

                {/* Fuel Price Manager */}
                <div className="bg-navy-surface rounded-2xl border border-navy-border p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Fuel className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Fuel Price Manager</h2>
                            <p className="text-sm text-text-secondary">Update prices displayed on landing page</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateFuelPrices} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Gasoil */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">
                                    Gasoil (MAD per liter)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fuelPrices.gasoil}
                                    onChange={(e) => setFuelPrices(prev => ({ ...prev, gasoil: parseFloat(e.target.value) }))}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            {/* Sans Plomb */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">
                                    Sans Plomb (MAD per liter)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={fuelPrices.sansPlomb}
                                    onChange={(e) => setFuelPrices(prev => ({ ...prev, sansPlomb: parseFloat(e.target.value) }))}
                                    className="input w-full"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Update Fuel Prices
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/staff/kitchen"
                        className="bg-navy-surface rounded-xl border border-navy-border p-4 hover:border-premium-gold transition-colors text-center"
                    >
                        <p className="font-bold text-white mb-1">Kitchen Display</p>
                        <p className="text-sm text-text-muted">View active food orders</p>
                    </a>

                    <a
                        href="/staff/wash"
                        className="bg-navy-surface rounded-xl border border-navy-border p-4 hover:border-premium-gold transition-colors text-center"
                    >
                        <p className="font-bold text-white mb-1">Car Wash Queue</p>
                        <p className="text-sm text-text-muted">Manage wash bookings</p>
                    </a>

                    <a
                        href="/staff/mechanic"
                        className="bg-navy-surface rounded-xl border border-navy-border p-4 hover:border-premium-gold transition-colors text-center"
                    >
                        <p className="font-bold text-white mb-1">Mechanic Queue</p>
                        <p className="text-sm text-text-muted">View service requests</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
