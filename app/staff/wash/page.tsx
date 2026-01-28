'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Droplet, Car, Clock, Play, CheckCircle } from 'lucide-react';

interface WashBooking {
    id: string;
    booking_number: string;
    vehicle_type: 'moto' | 'voiture' | '4x4';
    car_model?: string;
    license_plate?: string;
    service_type: 'express' | 'complete' | 'vapeur';
    time_slot: string;
    status: 'pending' | 'washing' | 'done';
    price: number;
}

export default function CarWashStaffPage() {
    const [bookings, setBookings] = useState<WashBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            // TODO: Fetch real bookings from database
            // const { data } = await supabase
            //   .from('wash_bookings')
            //   .select('*')
            //   .in('status', ['pending', 'washing'])
            //   .order('time_slot');

            // Mock data
            const mockBookings: WashBooking[] = [
                {
                    id: '1',
                    booking_number: 'W001',
                    vehicle_type: 'voiture',
                    car_model: 'Toyota Corolla',
                    license_plate: '12345-A-67',
                    service_type: 'complete',
                    time_slot: '14:00',
                    status: 'pending',
                    price: 80,
                },
                {
                    id: '2',
                    booking_number: 'W002',
                    vehicle_type: '4x4',
                    car_model: 'Land Cruiser',
                    license_plate: '98765-B-43',
                    service_type: 'vapeur',
                    time_slot: '14:30',
                    status: 'washing',
                    price: 250,
                },
            ];

            setBookings(mockBookings);
        } catch (err) {
            console.error('Error loading bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartWash = async (bookingId: string) => {
        try {
            // TODO: Update status in database
            // await supabase
            //   .from('wash_bookings')
            //   .update({ status: 'washing' })
            //   .eq('id', bookingId);

            setBookings(prev => prev.map(booking =>
                booking.id === bookingId ? { ...booking, status: 'washing' as const } : booking
            ));
        } catch (err) {
            console.error('Error starting wash:', err);
            alert('Failed to start wash');
        }
    };

    const handleFinishWash = async (bookingId: string) => {
        try {
            // TODO: Update status in database
            // await supabase
            //   .from('wash_bookings')
            //   .update({ status: 'done' })
            //   .eq('id', bookingId);

            // Remove from display
            setBookings(prev => prev.filter(booking => booking.id !== bookingId));

            // TODO: Send notification to customer
        } catch (err) {
            console.error('Error finishing wash:', err);
            alert('Failed to finish wash');
        }
    };

    const getServiceLabel = (type: string) => {
        const labels = {
            express: 'Express (30min)',
            complete: 'Complete (60min)',
            vapeur: 'Vapeur (90min)',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getVehicleIcon = (type: string) => {
        return type === 'moto' ? '🏍️' : type === '4x4' ? '🚙' : '🚗';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-premium-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-dark p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Droplet className="w-7 h-7 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Car Wash Queue</h1>
                            <p className="text-text-secondary">Active bookings - {bookings.length} in queue</p>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 rounded-full bg-navy-surface flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No Active Bookings</h2>
                        <p className="text-text-secondary">All washes completed</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className={`bg-navy-surface rounded-2xl border-2 p-6 ${booking.status === 'washing' ? 'border-premium-gold' : 'border-navy-border'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    {/* Booking Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="text-4xl">{getVehicleIcon(booking.vehicle_type)}</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    {booking.booking_number} - {booking.car_model || 'Vehicle'}
                                                </h3>
                                                <p className="text-text-secondary">{booking.license_plate}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-text-muted mb-1">Service Type</p>
                                                <p className="font-bold text-white">{getServiceLabel(booking.service_type)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted mb-1">Time Slot</p>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-premium-gold" />
                                                    <p className="font-bold text-white">{booking.time_slot}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted mb-1">Vehicle Type</p>
                                                <p className="font-bold text-white capitalize">{booking.vehicle_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-text-muted mb-1">Price</p>
                                                <p className="font-bold text-premium-gold">{booking.price} MAD</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="ml-6">
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleStartWash(booking.id)}
                                                className="btn-primary flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <Play className="w-5 h-5" />
                                                Start Wash
                                            </button>
                                        )}
                                        {booking.status === 'washing' && (
                                            <div className="space-y-3">
                                                <div className="px-4 py-2 rounded-lg bg-premium-gold/10 border border-premium-gold text-center">
                                                    <p className="text-sm font-bold text-premium-gold">In Progress</p>
                                                </div>
                                                <button
                                                    onClick={() => handleFinishWash(booking.id)}
                                                    className="btn-primary flex items-center gap-2 whitespace-nowrap w-full"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    Finish
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
