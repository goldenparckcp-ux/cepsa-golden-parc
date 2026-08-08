import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyStaffAuth } from '@/lib/auth-guard';


export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

import { z } from 'zod';

const RestaurantOrderUpdateSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  deposit_paid: z.boolean().optional(),
  deposit_amount: z.number().optional(),
  updated_at: z.string().optional(),
  completed_at: z.string().optional(),
});

// GET all restaurant orders
export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;



    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("order_number");

    let query = supabase.from("restaurant_orders").select("*");

    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH a restaurant order (update status, etc.)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;



    const supabase = getAdminSupabase();
    if (!supabase) throw new Error('Missing Supabase server credentials.');

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing id or updates in body.' }, { status: 400 });
    }

    const parsedUpdates = RestaurantOrderUpdateSchema.safeParse(updates);
    if (!parsedUpdates.success) {
      return NextResponse.json({ error: 'Invalid update payload', details: parsedUpdates.error.flatten().fieldErrors }, { status: 400 });
    }

    const { error } = await supabase
      .from("restaurant_orders")
      .update(parsedUpdates.data)
      .eq("id", id);

    if (error) throw error;

    // Trigger Type 2 Status Notification for Client
    if (parsedUpdates.data.status) {
      try {
        const { data: order } = await supabase
          .from("restaurant_orders")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (order) {
          const newStatus = parsedUpdates.data.status;
          const orderNum = order.order_number || order.id.slice(0, 6);
          let title = "";
          let message = "";

          if (newStatus === "preparing") {
            title = "👩‍🍳 Commande en préparation";
            message = `La cuisine du Golden Parc a commencé la préparation de votre commande #${orderNum}.`;
          } else if (newStatus === "ready") {
            title = "🛎️ Commande prête !";
            message = `Votre commande #${orderNum} est prête et vous attend !`;
          } else if (newStatus === "completed") {
            title = "✅ Commande servie";
            message = `Merci d'avoir choisi le Golden Parc ! Bon appétit.`;
          }

          if (title && message) {
            await supabase.from("notifications").insert({
              user_id: order.user_id || "global",
              customer_phone: order.customer_phone,
              type: "personal",
              title,
              message,
              booking_id: order.id,
              booking_table: "restaurant_orders",
              is_read: false,
              action_type: "none"
            });
          }
        }
      } catch (notifErr) {
        console.warn("Status notification trigger error:", notifErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
