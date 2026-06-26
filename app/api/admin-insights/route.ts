import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from '@/lib/auth-guard';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    // Auth check: staff only
    const auth = await verifyStaffAuth();
    if (!auth.success) return auth.response;

    // Rate limiting: 5 requests per minute
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(ip, 5, 60000);
    if (!rl.success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

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

    const prompt = `Tu es un consultant business expert pour Golden Parc Cepsa, un complexe marocain (restaurant, hôtel, piscine, service de lubrifiants/vidange).

DONNÉES ACTUELLES:
- CA Total: ${stats?.totalRevenue || 0} DH (Restaurant: ${stats?.restoRevenue || 0} DH, Hôtel: ${stats?.hotelRevenue || 0} DH, Piscine: ${stats?.poolRevenue || 0} DH, Services (Lubrifiants): ${stats?.servicesRevenue || 0} DH)
- Taux d'occupation physique de l'hôtel (actuel): ${stats?.occupancyRate || 0}% (sur 10 chambres). Note: Le chiffre d'affaires de l'hôtel provient des réservations payées/confirmées à l'avance, ce qui est normal même si l'occupation physique instantanée est faible ou de 0%. Ne dis pas que l'hôtel est inoccupé ou en perte s'il a généré du chiffre d'affaires significatif.
- Piscine: ${stats?.activePoolGuests || 0} personnes actives
- Commandes en attente: ${stats?.pendingOrdersCount || 0}
- Complétées aujourd'hui: ${stats?.completedOrdersToday || 0}
- Panier moyen: ${stats?.avgOrderValue || 0} DH
- Total commandes: ${stats?.totalOrdersCount || 0}

TOP PLATS:
${topPlats}

COMMANDES RECENTES:
${recentList}

NOTES IMPORTANTES:
- Le service de lavage de voiture (Lavage Auto) a été définitivement supprimé. Ne conseille jamais de relancer ou d'activer le lavage auto. Concentre-toi sur le service restant de Lubrifiants/Vidange ou les autres espaces (resto, hôtel, piscine).

Génère 4 conseils business courts, précis et actionnables basés sur ces chiffres réels. Choisis des icônes emojis appropriées pour chaque conseil.`;

    const models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let geminiRes: Response | null = null;
    let lastErrorMsg = "";
    let lastErrorStatus = 502;

    for (const model of models) {
        try {
            geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.6,
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: "OBJECT",
                                properties: {
                                    insights: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                type: { type: "STRING", enum: ["revenue", "opportunity", "attention", "warning"] },
                                                icon: { type: "STRING" },
                                                title: { type: "STRING" },
                                                message: { type: "STRING" },
                                                priority: { type: "STRING", enum: ["high", "medium", "low"] }
                                            },
                                            required: ["type", "icon", "title", "message", "priority"]
                                        }
                                    },
                                    summary: { type: "STRING" }
                                },
                                required: ["insights", "summary"]
                            }
                        }
                    }),
                    signal: AbortSignal.timeout(20000)
                }
            );

            if (geminiRes.ok) {
                break;
            } else {
                const errBody = await geminiRes.text().catch(() => "unknown");
                lastErrorMsg = `Gemini HTTP ${geminiRes.status}: ${errBody.slice(0, 300)}`;
                lastErrorStatus = geminiRes.status;
                geminiRes = null;
            }
        } catch (fetchErr: any) {
            lastErrorMsg = `Erreur réseau vers Gemini (${model}): ${fetchErr.message}`;
            lastErrorStatus = 502;
            geminiRes = null;
        }
    }

    if (!geminiRes) {
        return NextResponse.json({
            error: "Tous les modèles Gemini ont échoué",
            detail: lastErrorMsg
        }, { status: lastErrorStatus });
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
