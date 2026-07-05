import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CheckoutClient from './CheckoutClient';
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { bookingId?: string; type?: string; payment?: string; amount?: string }
}) {
  const { bookingId, type, payment, amount } = searchParams;

  if (!bookingId || !type) {
    redirect('/');
  }

  let dbTotalPrice = 0;
  let title = '';
  let details = '';
  let tableName = '';

  // Fetch based on type
  if (type === 'hotel') {
      const { data: hotel } = await supabase.from('hotel_reservations').select('*').eq('id', bookingId).maybeSingle();
      if (!hotel) redirect('/hotel');
      dbTotalPrice = hotel.total_price;
      title = `Réservation Hôtel - ${hotel.booking_type === 'night' ? 'Nuitée' : 'Sieste'}`;
      details = `Chambre: ${hotel.room_type} | Référence: ${bookingId.split('-')[0]}`;
      tableName = 'hotel_reservations';
  } else if (type === 'pool') {
      const { data: pool } = await supabase.from('pool_bookings').select('*').eq('id', bookingId).maybeSingle();
      if (!pool) redirect('/services/pool');
      dbTotalPrice = pool.total_price;
      title = `Réservation Piscine`;
      details = `Date: ${pool.booking_date} | Personnes: ${pool.guests} | Référence: ${bookingId.split('-')[0]}`;
      tableName = 'pool_bookings';
  } else if (type === 'restaurant') {
      const { data: resto } = await supabase.from('restaurant_orders').select('*').eq('id', bookingId).maybeSingle();
      if (!resto) redirect('/restaurant');
      dbTotalPrice = resto.total_price;
      title = `Commande Restaurant`;
      details = `Table/Chambre: ${resto.table_number || 'N/A'} | Référence: ${bookingId.split('-')[0]}`;
      tableName = 'restaurant_orders';
  } else if (type === 'topup') {
      dbTotalPrice = Number(amount) || 0;
      title = 'Recharge Portefeuille';
      details = 'Wallet Numérique';
      tableName = 'transactions';
  } else {
      redirect('/');
  }

  // Calculate final amount
  let finalAmount = dbTotalPrice;
  if (type !== 'topup') {
      if (payment === 'full_discounted') {
          finalAmount = Math.round(dbTotalPrice * 0.90);
      } else if (payment === 'deposit') {
          finalAmount = Math.max(Math.round(dbTotalPrice * 0.3), 20); // 30% or 20 MAD min
      }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans relative overflow-x-hidden">
        {/* Header */}
        <header className="p-6 flex items-center justify-between border-b border-white/5 relative z-20 bg-[#0B0F19]/80 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Retour</span>
            </Link>
            <div className="flex items-center gap-2 text-green-500">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-bold tracking-wider uppercase">Paiement Sécurisé</span>
            </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col lg:flex-row relative z-10">
            {/* Background effects */}
            <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            {/* Left Column: Summary */}
            <div className="lg:w-1/2 p-6 md:p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-br from-black/20 to-transparent">
                <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-left-8 duration-700">
                    <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Récapitulatif.</h1>
                    <p className="text-gray-400 mb-12">Vérifiez les détails de votre commande avant de procéder au paiement.</p>

                    <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] group-hover:bg-amber-500/20 transition-all duration-700" />
                        
                        <div className="relative z-10">
                            <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">Service</div>
                            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                            <p className="text-gray-400 text-sm mb-8">{details}</p>

                            <div className="h-px w-full bg-white/10 mb-8" />

                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">Total à payer</div>
                                    <div className="text-4xl font-black text-white flex items-baseline gap-1">
                                        {finalAmount.toFixed(2)} <span className="text-amber-500 text-lg font-bold">MAD</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                                        Equivalent PayPal : {(finalAmount / 10).toFixed(2)} USD
                                    </div>
                                </div>
                                {payment === 'full_discounted' && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                                        -10% Inclus
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Methods */}
            <div className="lg:w-1/2 p-6 md:p-12 lg:p-20 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">
                    <h2 className="text-2xl font-bold mb-8">Choisissez votre méthode</h2>
                    
                    <CheckoutClient 
                        bookingId={bookingId}
                        amount={finalAmount}
                        serviceType={type as any}
                        tableName={tableName}
                        paymentType={payment as any}
                    />

                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                            Paiement 100% Sécurisé & Chiffré
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-8 px-3 bg-white/10 rounded-lg flex items-center justify-center text-[9px] font-bold text-white tracking-wider">VISA</div>
                            <div className="h-8 px-3 bg-white/10 rounded-lg flex items-center justify-center text-[9px] font-bold text-white tracking-wider">MASTERCARD</div>
                            <div className="h-8 px-3 bg-white/10 rounded-lg flex items-center justify-center text-[9px] font-bold text-white tracking-wider">CMI</div>
                            <div className="h-8 px-3 bg-white/10 rounded-lg flex items-center justify-center text-[9px] font-bold text-white tracking-wider">PAYPAL</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
