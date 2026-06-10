import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({
            error: "GEMINI_API_KEY non configurée sur le serveur",
            debug: "Env var missing"
        }, { status: 500 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { stats, topItems, recentOrders } = body;

    const topPlats = (topItems || []).slice(0, 5)
        .map((item: any, i: number) => `${i + 1}. ${item.name}: ${item.qty} vendus × ${item.avgPrice}DH = ${item.revenue}DH`)
        .join("\n") || "Aucune vente enregistrée";

    const recentList = (recentOrders || []).slice(0, 5)
        .map((o: any) => `- ${o.order_number}: ${o.total_price || o.subtotal}DH [${o.status}]`)
        .join("\n") || "Aucune commande récente";

    const prompt = `Tu es un consultant business expert pour Golden Parc Cepsa, un complexe marocain (restaurant, hôtel, piscine, services auto).

DONNÉES ACTUELLES:
- CA Total: ${stats?.totalRevenue || 0} DH (Restaurant: ${stats?.restoRevenue || 0} DH, Hôtel: ${stats?.hotelRevenue || 0} DH, Piscine: ${stats?.poolRevenue || 0} DH, Services: ${stats?.servicesRevenue || 0} DH)
- Occupation hôtel: ${stats?.occupancyRate || 0}% (sur 10 chambres)
- Piscine: ${stats?.activePoolGuests || 0} personnes actives
- Commandes en attente: ${stats?.pendingOrdersCount || 0}
- Complétées aujourd'hui: ${stats?.completedOrdersToday || 0}
- Panier moyen: ${stats?.avgOrderValue || 0} DH
- Total commandes: ${stats?.totalOrdersCount || 0}

TOP PLATS:
${topPlats}

COMMANDES RECENTES:
${recentList}

Génère 4 conseils business courts, précis et actionnables basés sur ces chiffres réels. Réponds UNIQUEMENT avec ce JSON (pas de markdown, pas d'explication):
{"insights":[{"type":"revenue","icon":"💰","title":"Titre","message":"Conseil court","priority":"high"},{"type":"opportunity","icon":"🚀","title":"Titre","message":"Conseil court","priority":"medium"},{"type":"attention","icon":"⚠️","title":"Titre","message":"Conseil court","priority":"high"},{"type":"revenue","icon":"📈","title":"Titre","message":"Conseil court","priority":"medium"}],"summary":"Résumé en une phrase"}`;

    let geminiRes: Response;
    try {
        geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 800,
                    }
                }),
                signal: AbortSignal.timeout(20000)
            }
        );
    } catch (fetchErr: any) {
        return NextResponse.json({
            error: `Erreur réseau vers Gemini: ${fetchErr.message}`
        }, { status: 502 });
    }

    if (!geminiRes.ok) {
        const errBody = await geminiRes.text().catch(() => "unknown");
        return NextResponse.json({
            error: `Gemini HTTP ${geminiRes.status}`,
            detail: errBody.slice(0, 500)
        }, { status: 502 });
    }

    let geminiData: any;
    try {
        geminiData = await geminiRes.json();
    } catch {
        return NextResponse.json({ error: "Réponse Gemini invalide (non-JSON)" }, { status: 502 });
    }

    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
        return NextResponse.json({
            error: "Gemini n'a pas retourné de texte",
            debug: JSON.stringify(geminiData).slice(0, 300)
        }, { status: 502 });
    }

    // Extract JSON from response (handle markdown code blocks)
    let parsed: any;
    try {
        // Try direct parse first
        parsed = JSON.parse(rawText);
    } catch {
        // Try to extract JSON from markdown code block
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                          rawText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
            try {
                parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } catch {
                // Build a fallback from the raw text
                parsed = {
                    insights: [{
                        type: "attention",
                        icon: "💡",
                        title: "Analyse disponible",
                        message: rawText.slice(0, 200),
                        priority: "medium"
                    }],
                    summary: "Analyse IA générée"
                };
            }
        } else {
            parsed = {
                insights: [{
                    type: "revenue",
                    icon: "📊",
                    title: "Données analysées",
                    message: rawText.slice(0, 200),
                    priority: "medium"
                }],
                summary: rawText.slice(0, 100)
            };
        }
    }

    return NextResponse.json(parsed);
}
