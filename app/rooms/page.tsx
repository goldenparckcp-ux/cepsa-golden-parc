'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Hotel, Bed, Wifi, Droplet, Tv, Wind, Users, Car, Moon, Sun } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';
import InlineLoginModal from '@/components/modals/InlineLoginModal';

interface Room {
    id: string;
    name: string;
    description: string;
    price: number;
    capacity: number;
    amenities: string[];
    image: string;
}

export default function RoomsPage() {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [checkInTime, setCheckInTime] = useState<'tonight' | 'tomorrow'>('tonight');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const rooms: Room[] = [
        {
            id: '1',
            name: 'Standard Solo',
            description: 'Perfect for solo travelers. Single bed, private shower, and high-speed WiFi.',
            price: 350,
            capacity: 1,
            amenities: ['Single Bed', 'Shower', 'WiFi', 'Parking'],
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=500&auto=format&fit=crop',
        },
        {
            id: '2',
            name: 'Double Comfort',
            description: 'Spacious room with queen bed, flat-screen TV, and climate control.',
            price: 500,
            capacity: 2,
            amenities: ['Queen Bed', 'TV', 'AC', 'WiFi', 'Shower', 'Parking'],
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=500&auto=format&fit=crop',
        },
        {
            id: '3',
            name: 'Family Suite',
            description: 'Ideal for families. Two beds, separate living area, and premium amenities.',
            price: 800,
            capacity: 4,
            amenities: ['2 Beds', 'Living Area', 'TV', 'AC', 'WiFi', 'Shower', 'Parking'],
            image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=500&auto=format&fit=crop',
        },
    ];

    const getAmenityIcon = (amenity: string) => {
        const lower = amenity.toLowerCase();
        if (lower.includes('bed')) return <Bed className="w-4 h-4" />;
        if (lower.includes('wifi')) return <Wifi className="w-4 h-4" />;
        if (lower.includes('shower')) return <Droplet className="w-4 h-4" />;
        if (lower.includes('tv')) return <Tv className="w-4 h-4" />;
        if (lower.includes('ac')) return <Wind className="w-4 h-4" />;
        if (lower.includes('living')) return <Users className="w-4 h-4" />;
        if (lower.includes('parking')) return <Car className="w-4 h-4" />;
        return <Hotel className="w-4 h-4" />;
    };

    const handleBookNow = async (room: Room) => {
        setSelectedRoom(room);
        setIsBooking(true);

        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                // Not logged in - show login modal
                setIsBooking(false);
                setIsLoginModalOpen(true);
                return;
            }

            // User is logged in - proceed to create booking
            await createBooking(user.id, room);
        } catch (err) {
            console.error('Auth check error:', err);
            setIsBooking(false);
            setIsLoginModalOpen(true);
        }
    };

    const createBooking = async (userId: string, room: Room) => {
        try {
            const checkInDate = checkInTime === 'tonight'
                ? new Date()
                : new Date(Date.now() + 24 * 60 * 60 * 1000);

            // TODO: Save to Supabase hotel_bookings table
            // const { data, error } = await supabase
            //   .from('hotel_bookings')
            //   .insert({
            //     user_id: userId,
            //     room_id: room.id,
            //     room_name: room.name,
            //     check_in_date: checkInDate.toISOString(),
            //     nights: 1,
            //     total_amount: room.price,
            //     status: 'confirmed',
            //   });

            // For now, redirect to orders page
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

        if (selectedRoom) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await createBooking(user.id, selectedRoom);
            }
        }
    };

    const getCheckInLabel = () => {
        if (checkInTime === 'tonight') {
            return 'Tonight • Check-in after 6 PM';
        } else {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            return `Tomorrow • ${tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-surface-dark to-bg-dark p-6 border-b border-white/10">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-premium-gold/10 flex items-center justify-center">
                            <Hotel className="w-6 h-6 text-premium-gold" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Rest & Recharge</h1>
                            <p className="text-sm text-text-secondary">Soundproof rooms for weary travelers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 py-6">
                {/* Check-in Time Selector */}
                <div className="card mb-6">
                    <h3 className="font-bold text-lg mb-4">When do you need rest?</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setCheckInTime('tonight')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${checkInTime === 'tonight'
                                    ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/20'
                                    : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                }`}
                        >
                            <Moon className={`w-8 h-8 mx-auto mb-2 ${checkInTime === 'tonight' ? 'text-premium-gold' : 'text-text-muted'
                                }`} />
                            <p className="font-bold text-sm">Tonight</p>
                            <p className="text-xs text-text-muted">After 6 PM</p>
                        </button>

                        <button
                            onClick={() => setCheckInTime('tomorrow')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${checkInTime === 'tomorrow'
                                    ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/20'
                                    : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                }`}
                        >
                            <Sun className={`w-8 h-8 mx-auto mb-2 ${checkInTime === 'tomorrow' ? 'text-premium-gold' : 'text-text-muted'
                                }`} />
                            <p className="font-bold text-sm">Tomorrow</p>
                            <p className="text-xs text-text-muted">Next day</p>
                        </button>
                    </div>
                    <p className="text-sm text-text-secondary mt-3 text-center">
                        {getCheckInLabel()}
                    </p>
                </div>

                {/* Room Cards */}
                <div className="space-y-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="group">
                            <div className="relative overflow-hidden rounded-2xl border-2 border-white/10 hover:border-premium-gold transition-all duration-300">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${room.image})` }}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                                {/* Content */}
                                <div className="relative p-6">
                                    {/* Capacity Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark/60 backdrop-blur-md border border-white/20 mb-4">
                                        <Users className="w-4 h-4 text-premium-gold" />
                                        <span className="text-xs font-bold">Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                                    <p className="text-sm text-text-secondary mb-4">{room.description}</p>

                                    {/* Amenities */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {room.amenities.map((amenity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark/60 backdrop-blur-md border border-white/20 text-xs"
                                            >
                                                {getAmenityIcon(amenity)}
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price & Book Button */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-3xl font-bold text-premium-gold">
                                                {room.price} <span className="text-lg">MAD</span>
                                            </p>
                                            <p className="text-xs text-text-muted">per night</p>
                                        </div>
                                        <button
                                            onClick={() => handleBookNow(room)}
                                            disabled={isBooking}
                                            className="btn-primary px-8 py-3 flex items-center gap-2"
                                        >
                                            {isBooking && selectedRoom?.id === room.id ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Booking...
                                                </>
                                            ) : (
                                                'Book Now'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Card */}
                <div className="card mt-6 bg-premium-gold/5 border-premium-gold/20">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Hotel className="w-5 h-5 text-premium-gold" />
                        Quick Check-in
                    </h4>
                    <p className="text-sm text-text-secondary">
                        Your room will be ready upon arrival. Digital key sent to your phone after booking.
                    </p>
                </div>
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
