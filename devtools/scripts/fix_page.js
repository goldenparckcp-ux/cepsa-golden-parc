const fs = require('fs');
const path = require('path');

const pageFile = path.join(process.cwd(), 'app/admin/page.tsx');
let content = fs.readFileSync(pageFile, 'utf8');

const targetStr = `            const [{ data: ro }, { data: hr }, { data: pb }, { data: sb }] = await Promise.all([
                supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false }),
                supabase.from("hotel_reservations").select("*").order("created_at", { ascending: false }),
                supabase.from("pool_bookings").select("*").order("created_at", { ascending: false }),
                supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
            ]);

            const rOrders = ro || [];
            setAllRestoOrders(rOrders);

            const hRes = hr || [];
            setAllHotelReservations(hRes);

            const pBook = pb || [];
            setAllPoolBookings(pBook);

            const sBook = sb || [];`;

const replaceStr = `            const res = await fetch("/api/admin/data");
            if (!res.ok) throw new Error("Failed to fetch admin data");
            const data = await res.json();
            
            const rOrders: any[] = data.orders || [];
            setAllRestoOrders(rOrders);

            const hRes: any[] = data.reservations || [];
            setAllHotelReservations(hRes);

            const pBook: any[] = data.poolBookings || [];
            setAllPoolBookings(pBook);

            const sBook: any[] = data.serviceBookings || [];`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(pageFile, content);
console.log("Updated app/admin/page.tsx");
