'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChefHat, Clock, CheckCircle, AlertCircle, MapPin, Package } from 'lucide-react';

interface Order {
    id: string;
    order_number: string;
    table_number?: string | null;  // QR CODE TABLE DETECTION
    service_type: 'takeaway' | 'dine-in';
    items: {
        name: string;
        quantity: number;
        modifications?: string;
    }[];
    created_at: string;
    status: 'pending' | 'preparing' | 'ready';
}

export default function KitchenDisplayPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
        // Set up real-time subscription
        const subscription = supabase
            .channel('kitchen_orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                loadOrders();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadOrders = async () => {
        try {
            console.log('Fetching orders...');
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['pending', 'preparing'])
                .order('created_at', { ascending: true });

            if (error) throw error;
            console.log('Orders loaded:', data);
            setOrders(data || []);
        } catch (err) {
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReady = async (orderId: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'ready' })
                .eq('id', orderId);

            if (error) throw error;

            // Remove from display immediately for better UX
            setOrders(prev => prev.filter(order => order.id !== orderId));

            // Play notification sound if possible? (Simulated for now)
            const audio = new Audio('/sounds/notification.mp3'); // Assuming file exists or fails silently
            audio.play().catch(() => { });

        } catch (err) {
            console.error('Error marking order ready:', err);
            alert('Failed to mark order as ready');
        }
    };

    const getTimeElapsed = (createdAt: string) => {
        const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
        return minutes;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-dark p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-cepsa-red/10 flex items-center justify-center">
                            <ChefHat className="w-7 h-7 text-cepsa-red" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Kitchen Display System</h1>
                            <p className="text-text-secondary">Active food orders - {orders.length} pending</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500 rounded-lg">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400 font-bold">Dine-In (Serve to Table)</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500 rounded-lg">
                            <Package className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-orange-400 font-bold">Takeaway (Pack in Bag)</span>
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 rounded-full bg-navy-surface flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">All Caught Up!</h2>
                        <p className="text-text-secondary">No pending orders at the moment</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {orders.map((order) => {
                            const timeElapsed = getTimeElapsed(order.created_at);
                            const isUrgent = timeElapsed > 15;
                            const isDineIn = order.service_type === 'dine-in' && order.table_number;

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-navy-surface rounded-2xl border-2 p-6 ${isUrgent
                                        ? 'border-cepsa-red'
                                        : isDineIn
                                            ? 'border-green-500'  // GREEN for Dine-In
                                            : 'border-orange-500'  // ORANGE for Takeaway
                                        }`}
                                >
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">
                                                Order #{order.order_number}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {/* SERVICE TYPE BADGE */}
                                                {isDineIn ? (
                                                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500 text-green-400 text-sm font-bold flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        Table {order.table_number}
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500 text-orange-400 text-sm font-bold flex items-center gap-2">
                                                        <Package className="w-4 h-4" />
                                                        Takeaway
                                                    </div>
                                                )}

                                                {/* STATUS BADGE */}
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${order.status === 'preparing'
                                                    ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400'
                                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500'
                                                    }`}>
                                                    {order.status === 'preparing' ? 'In Progress' : 'New'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* TIME INDICATOR */}
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isUrgent ? 'bg-cepsa-red/10 border border-cepsa-red' : 'bg-navy-dark'
                                            }`}>
                                            {isUrgent && <AlertCircle className="w-5 h-5 text-cepsa-red" />}
                                            <Clock className={`w-5 h-5 ${isUrgent ? 'text-cepsa-red' : 'text-yellow-400'}`} />
                                            <span className={`font-bold ${isUrgent ? 'text-cepsa-red' : 'text-yellow-400'}`}>
                                                {timeElapsed}m
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-3 mb-6">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="bg-navy-dark rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="font-bold text-white text-lg">{item.name}</span>
                                                    <span className="px-3 py-1 rounded-full bg-yellow-400 text-navy-dark text-sm font-bold">
                                                        x{item.quantity}
                                                    </span>
                                                </div>
                                                {item.modifications && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <AlertCircle className="w-4 h-4 text-cepsa-red" />
                                                        <span className="text-cepsa-red font-bold">{item.modifications}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mark Ready Button */}
                                    <button
                                        onClick={() => handleMarkReady(order.id)}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {isDineIn ? 'Serve to Table' : 'Ready for Pickup'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
