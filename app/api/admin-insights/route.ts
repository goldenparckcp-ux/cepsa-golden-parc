import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { stats, topItems, recentOrders } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // Build a rich business context prompt
        const prompt = `Tu es un consultant business expert en restauration, hôtellerie et loisirs. 
Analyse les données suivantes d'un parc de loisirs / hôtel / restaurant marocain (Golden Parc Cepsa) et donne des conseils concrets, actionnables et pertinents en FRANÇAIS.

=== DONNÉES TEMPS RÉEL ===
📊 Chiffre d'Affaires Global: ${stats.totalRevenue.toLocaleString()} DH
  - Restaurant: ${stats.restoRevenue.toLocaleString()} DH (${stats.totalRevenue > 0 ? Math.round((stats.restoRevenue / stats.totalRevenue) * 100) : 0}%)
  - Hôtel: ${stats.hotelRevenue.toLocaleString()} DH (${stats.totalRevenue > 0 ? Math.round((stats.hotelRevenue / stats.totalRevenue) * 100) : 0}%)
  - Piscine: ${stats.poolRevenue.toLocaleString()} DH (${stats.totalRevenue > 0 ? Math.round((stats.poolRevenue / stats.totalRevenue) * 100) : 0}%)
  - Services: ${stats.servicesRevenue.toLocaleString()} DH (${stats.totalRevenue > 0 ? Math.round((stats.servicesRevenue / stats.totalRevenue) * 100) : 0}%)

🏨 Hôtel: Taux d'occupation ${stats.occupancyRate}% (sur 10 chambres)
🏊 Piscine: ${stats.activePoolGuests} personnes actives
⏳ Commandes en attente: ${stats.pendingOrdersCount}
✅ Complétées aujourd'hui: ${stats.completedOrdersToday}
🧺 Lavages en cours: ${stats.lavagesCount}
🛒 Panier moyen restaurant: ${stats.avgOrderValue} DH
📦 Total commandes: ${stats.totalOrdersCount}

=== TOP PLATS (par revenu) ===
${topItems.slice(0, 5).map((item: any, i: number) => 
  `${i+1}. ${item.name}: ${item.qty} vendus × ${item.avgPrice}DH = ${item.revenue}DH`
).join('\n')}

=== COMMANDES RÉCENTES ===
${recentOrders.slice(0, 5).map((o: any) => 
  `- ${o.order_number}: ${o.total_price || o.subtotal}DH [${o.status}]`
).join('\n')}

=== INSTRUCTIONS ===
Génère exactement 4 conseils business structurés. Chaque conseil doit être:
- Spécifique aux données ci-dessus (mentionne les chiffres réels)
- Immédiatement actionnable (que faire concrètement)
- Court et percutant (2-3 phrases max)

Format JSON strict (rien d'autre, pas de markdown):
{
  "insights": [
    {
      "type": "revenue" | "attention" | "opportunity" | "warning",
      "icon": "💰" | "⚠️" | "🚀" | "📈" | "🏆" | "⏰" | "🎯" | "💡",
      "title": "Titre court (max 5 mots)",
      "message": "Conseil actionnable avec chiffres réels",
      "priority": "high" | "medium" | "low"
    }
  ],
  "summary": "Une phrase de résumé global de la situation (max 15 mots)"
}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API error:", errText);
            return NextResponse.json({ error: "Gemini API error", detail: errText }, { status: 502 });
        }

        const geminiData = await response.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch {
            // Try to extract JSON from text
            const match = rawText.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : { insights: [], summary: "Analyse indisponible" };
        }

        return NextResponse.json(parsed);

    } catch (err: any) {
        console.error("Admin insights error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
