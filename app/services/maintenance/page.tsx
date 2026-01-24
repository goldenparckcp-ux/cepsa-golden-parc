'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Wrench, Droplets, Gauge, Snowflake, Battery, Clock, ArrowRight } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';
import InlineLoginModal from '@/components/modals/InlineLoginModal';

interface MaintenanceService {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    icon: any;
    options?: string[];
}

type Urgency = 'now' | 'later';

export default function MechanicPage() {
    const router = useRouter();
    const [selectedService, setSelectedService] = useState<MaintenanceService | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [urgency, setUrgency] = useState<Urgency | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const services: MaintenanceService[] = [
        {
            id: 'vidange',
            name: '🛢️ Vidange (Oil Change)',
            description: 'Premium oil change with filter replacement',
            price: 350,
            duration: 45,
            icon: Droplets,
            options: ['Castrol Edge 5W-30', 'Shell Helix Ultra', 'Total Quartz 9000'],
        },
        {
            id: 'pneu',
            name: '🔧 Pneu (Tire Check)',
            description: 'Pressure check, balancing & puncture repair',
            price: 150,
            duration: 30,
            icon: Gauge,
        },
        {
            id: 'clim',
            name: '❄️ Clim (A/C Refill)',
            description: 'Air conditioning gas refill and system check',
            price: 400,
            duration: 60,
            icon: Snowflake,
        },
        {
            id: 'batterie',
            name: '🔋 Batterie',
            description: 'Jump start, testing, or battery replacement',
            price: 200,
            duration: 20,
            icon: Battery,
            options: ['Jump Start Only', 'Test & Charge', 'Replace Battery'],
        },
    ];

    const handleServiceSelect = (service: MaintenanceService) => {
        setSelectedService(service);
        setSelectedOption(null);
        setUrgency(null);
    };

    const handleConfirmBooking = async () => {
        if (!selectedService || !urgency) return;

        setIsBooking(true);

        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                setIsBooking(false);
                setIsLoginModalOpen(true);
                return;
            }

            await createBooking(user.id);
        } catch (err) {
            console.error('Auth check error:', err);
            setIsBooking(false);
            setIsLoginModalOpen(true);
        }
    };

    const createBooking = async (userId: string) => {
        try {
            // TODO: Save to Supabase maintenance_bookings table
            // const { data, error } = await supabase
            //   .from('maintenance_bookings')
            //   .insert({
            //     user_id: userId,
            //     service_id: selectedService?.id,
            //     service_name: selectedService?.name,
            //     selected_option: selectedOption,
            //     urgency: urgency,
            //     price: selectedService?.price,
            //     status: 'pending',
            //   });

            router.push('/orders');
        } catch (err) {
            console.error('Error creating booking:', err);
            alert('Failed to create booking. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    const handleLoginSuccess = async () => {
        setIsLoginModalOpen(false);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await createBooking(user.id);
        }
    };

    return (
        <div className="min-h-screen bg-navy-dark pb-24">
            {/* Header */}
            <div className="bg-navy-surface border-b border-navy-border p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Car Maintenance (Siyana)</h1>
                            <p className="text-sm text-text-secondary">Quick highway maintenance services</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6">
                {!selectedService ? (
                    /* Services Grid */
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6">Select Service</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => handleServiceSelect(service)}
                                        className="p-6 bg-navy-surface rounded-2xl border-2 border-navy-border hover:border-premium-gold transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-xl bg-navy-dark flex items-center justify-center flex-shrink-0 group-hover:bg-premium-gold/10 transition-colors">
                                                <Icon className="w-7 h-7 text-premium-gold" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                                                <p className="text-sm text-text-secondary">{service.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <Clock className="w-4 h-4" />
                                                <span>{service.duration} mins</span>
                                            </div>
                                            <div className="text-xl font-bold text-premium-gold">
                                                {service.price} DH
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Info Card */}
                        <div className="mt-6 bg-navy-surface rounded-2xl border border-navy-border p-6">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-premium-gold" />
                                Professional Service
                            </h3>
                            <p className="text-sm text-text-secondary">
                                All services performed by certified mechanics with quality parts and warranty.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Service Details & Booking */
                    <div>
                        <button
                            onClick={() => setSelectedService(null)}
                            className="text-premium-gold hover:underline mb-4 flex items-center gap-2"
                        >
                            ← Back to services
                        </button>

                        {/* Service Summary */}
                        <div className="bg-navy-surface rounded-2xl border border-navy-border p-6 mb-6">
                            <h2 className="text-2xl font-bold text-white mb-4">{selectedService.name}</h2>
                            <p className="text-text-secondary mb-4">{selectedService.description}</p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <Clock className="w-5 h-5" />
                                    <span>{selectedService.duration} minutes</span>
                                </div>
                                <div className="text-3xl font-bold text-premium-gold">
                                    {selectedService.price} DH
                                </div>
                            </div>
                        </div>

                        {/* Options (if available) */}
                        {selectedService.options && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-4">Select Option</h3>
                                <div className="space-y-3">
                                    {selectedService.options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSelectedOption(option)}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedOption === option
                                                    ? 'border-premium-gold bg-premium-gold/10'
                                                    : 'border-navy-border bg-navy-surface hover:border-premium-gold/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-white">{option}</span>
                                                {selectedOption === option && (
                                                    <div className="w-6 h-6 rounded-full bg-premium-gold flex items-center justify-center">
                                                        <span className="text-navy-dark text-sm">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Urgency Selection */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-4">When do you need this?</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setUrgency('now')}
                                    className={`p-6 rounded-xl border-2 transition-all ${urgency === 'now'
                                            ? 'border-cepsa-red bg-cepsa-red/10'
                                            : 'border-navy-border bg-navy-surface hover:border-cepsa-red/50'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">🚨</div>
                                    <h4 className="font-bold text-white mb-1">Now (Urgent)</h4>
                                    <p className="text-sm text-text-muted">Immediate service</p>
                                </button>

                                <button
                                    onClick={() => setUrgency('later')}
                                    className={`p-6 rounded-xl border-2 transition-all ${urgency === 'later'
                                            ? 'border-premium-gold bg-premium-gold/10'
                                            : 'border-navy-border bg-navy-surface hover:border-premium-gold/50'
                                        }`}
                                >
                                    <div className="text-4xl mb-2">📅</div>
                                    <h4 className="font-bold text-white mb-1">Later</h4>
                                    <p className="text-sm text-text-muted">Schedule for later</p>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        {urgency && (
                            <button
                                onClick={handleConfirmBooking}
                                disabled={isBooking}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isBooking ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Confirming...
                                    </>
                                ) : (
                                    <>
                                        Confirm Booking
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Inline Login Modal */}
            <InlineLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={handleLoginSuccess}
            />

            <BottomNav />
        </div>
    );
}
