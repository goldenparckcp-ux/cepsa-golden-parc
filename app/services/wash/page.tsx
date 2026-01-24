'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Bike, Car, Truck, Droplet, Sparkles, Wind, Clock, ArrowRight } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';
import InlineLoginModal from '@/components/modals/InlineLoginModal';

type VehicleType = 'moto' | 'voiture' | '4x4';
type ServiceType = 'express' | 'complete' | 'vapeur';

interface Service {
    id: ServiceType;
    name: string;
    description: string;
    duration: number;
    price: number;
    icon: any;
}

export default function CarWashPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
    const [serviceType, setServiceType] = useState<ServiceType | null>(null);
    const [timeSlot, setTimeSlot] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const services: Service[] = [
        {
            id: 'express',
            name: 'Express',
            description: 'Exterior wash only - Quick & efficient',
            duration: 30,
            price: 40,
            icon: Droplet,
        },
        {
            id: 'complete',
            name: 'Complete',
            description: 'Interior + Exterior - Full clean',
            duration: 60,
            price: 80,
            icon: Sparkles,
        },
        {
            id: 'vapeur',
            name: 'Vapeur',
            description: 'Steam clean - Deep sanitization',
            duration: 90,
            price: 250,
            icon: Wind,
        },
    ];

    // Generate time slots starting from NOW, every 30 mins
    const generateTimeSlots = () => {
        const slots = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Round up to next 30-min slot
        let startHour = currentHour;
        let startMinute = currentMinute < 30 ? 30 : 0;
        if (currentMinute >= 30) {
            startHour++;
        }

        // Generate slots from now until 18:00
        for (let hour = startHour; hour <= 18; hour++) {
            if (hour === startHour && startMinute === 30) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            } else {
                slots.push(`${hour.toString().padStart(2, '0')}:00`);
                if (hour < 18) {
                    slots.push(`${hour.toString().padStart(2, '0')}:30`);
                }
            }
        }

        return slots;
    };

    const timeSlots = generateTimeSlots();

    const handleVehicleSelect = (type: VehicleType) => {
        setVehicleType(type);
        setStep(2);
    };

    const handleServiceSelect = (type: ServiceType) => {
        setServiceType(type);
        setStep(3);
    };

    const handleTimeSelect = (time: string) => {
        setTimeSlot(time);
    };

    const handleConfirmBooking = async () => {
        if (!vehicleType || !serviceType || !timeSlot) return;

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
            const selectedService = services.find(s => s.id === serviceType);

            // Construct scheduled timestamp (approximate based on slot)
            // Assuming today for simplicity or selected date logic
            const [hours, mins] = timeSlot ? timeSlot.split(':') : ['10', '00'];
            const scheduledDate = new Date();
            scheduledDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

            // Fetch user phone from metadata or auth
            const { data: { user } } = await supabase.auth.getUser();
            const phone = user?.phone || "+212000000000"; // Fallback

            const { data, error } = await supabase
                .from('service_bookings')
                .insert({
                    service_type: 'lavage',
                    service_name: selectedService?.name || 'Lavage',
                    customer_phone: phone,
                    vehicle_info: `${vehicleType} (${selectedService?.name})`,
                    scheduled_at: scheduledDate.toISOString(),
                    status: 'scheduled',
                    notes: `Slot: ${timeSlot}`
                });

            if (error) throw error;

            router.push('/dashboard/services'); // Redirect to Services Dashboard instead of generic orders
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

    const selectedService = services.find(s => s.id === serviceType);

    return (
        <div className="min-h-screen bg-navy-dark pb-24">
            {/* Header */}
            <div className="bg-navy-surface border-b border-navy-border p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Droplet className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Car Wash (Lavage)</h1>
                            <p className="text-sm text-text-secondary">Professional car cleaning while you rest</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-premium-gold' : 'bg-navy-dark'}`} />
                        <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-premium-gold' : 'bg-navy-dark'}`} />
                        <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-premium-gold' : 'bg-navy-dark'}`} />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Step 1: Vehicle Type */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6">Select Your Vehicle Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleVehicleSelect('moto')}
                                className="p-8 bg-navy-surface rounded-2xl border-2 border-navy-border hover:border-premium-gold transition-all group"
                            >
                                <Bike className="w-16 h-16 text-premium-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">🏍️ Moto</h3>
                                <p className="text-sm text-text-muted">Motorcycle</p>
                            </button>

                            <button
                                onClick={() => handleVehicleSelect('voiture')}
                                className="p-8 bg-navy-surface rounded-2xl border-2 border-navy-border hover:border-premium-gold transition-all group"
                            >
                                <Car className="w-16 h-16 text-premium-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">🚗 Voiture</h3>
                                <p className="text-sm text-text-muted">Standard Car</p>
                            </button>

                            <button
                                onClick={() => handleVehicleSelect('4x4')}
                                className="p-8 bg-navy-surface rounded-2xl border-2 border-navy-border hover:border-premium-gold transition-all group"
                            >
                                <Truck className="w-16 h-16 text-premium-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">🚙 4x4/Truck</h3>
                                <p className="text-sm text-text-muted">Large Vehicle</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Service Type */}
                {step === 2 && (
                    <div>
                        <button
                            onClick={() => setStep(1)}
                            className="text-premium-gold hover:underline mb-4 flex items-center gap-2"
                        >
                            ← Back to vehicle selection
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Choose Service Type</h2>
                        <div className="space-y-4">
                            {services.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => handleServiceSelect(service.id)}
                                        className="w-full p-6 bg-navy-surface rounded-2xl border-2 border-navy-border hover:border-premium-gold transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-navy-dark flex items-center justify-center flex-shrink-0 group-hover:bg-premium-gold/10 transition-colors">
                                                <Icon className="w-7 h-7 text-premium-gold" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
                                                <p className="text-sm text-text-secondary mb-3">{service.description}</p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{service.duration} mins</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-premium-gold">
                                                        {service.price} DH
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-6 h-6 text-premium-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Time Slot */}
                {step === 3 && (
                    <div>
                        <button
                            onClick={() => setStep(2)}
                            className="text-premium-gold hover:underline mb-4 flex items-center gap-2"
                        >
                            ← Back to service selection
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Select Time Slot</h2>

                        {/* Summary */}
                        <div className="bg-navy-surface rounded-2xl border border-navy-border p-6 mb-6">
                            <h3 className="font-bold text-white mb-4">Booking Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Vehicle:</span>
                                    <span className="text-white font-bold capitalize">{vehicleType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Service:</span>
                                    <span className="text-white font-bold">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Duration:</span>
                                    <span className="text-white font-bold">{selectedService?.duration} mins</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-navy-border">
                                    <span className="text-text-muted">Total:</span>
                                    <span className="text-2xl font-bold text-premium-gold">{selectedService?.price} DH</span>
                                </div>
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="overflow-x-auto scrollbar-custom pb-4">
                            <div className="flex gap-3 min-w-max">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`px-6 py-4 rounded-xl font-bold transition-all ${timeSlot === time
                                            ? 'bg-premium-gold text-navy-dark'
                                            : 'bg-navy-surface text-white border border-navy-border hover:border-premium-gold'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Confirm Button */}
                        {timeSlot && (
                            <button
                                onClick={handleConfirmBooking}
                                disabled={isBooking}
                                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
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
