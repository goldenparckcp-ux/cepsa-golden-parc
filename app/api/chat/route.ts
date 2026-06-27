import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    // Rate limiting: 10 requests per minute
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rl = rateLimit(ip, 10, 60000);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const { messages, language } = await req.json();

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const systemInstruction = `Tu es l'assistant virtuel intelligent de "Golden Parc Station GPS", une station-service premium située à Outat El Haj, sur la Route Nationale 15, au Maroc. 
Ton rôle EST STRICTEMENT LIMITÉ à répondre aux questions concernant la station, ses services, son hôtel (Hôtel l'Escale), son restaurant, sa piscine, et son service de lavage. 
Si l'utilisateur pose une question qui n'a aucun rapport avec la station ou ses services (ex: politique, blagues générales, programmation, etc.), tu DOIS poliment refuser de répondre et rediriger la conversation vers les services de la station.

Informations sur la station :
- Station & Carburant : Ouvert 24h/24, 7j/7. Prix compétitifs (Gasoil, Sans Plomb).
- Restaurant & Café : Ouvert de 06:00 à 00:00. Propose des grillades, pizzas, plats marocains.
- Hôtel l'Escale : Ouvert 24h/24. Chambres Standard, Suites Deluxe, Suites Familiales. Propose des nuitées et des siestes (repos rapide en journée).
- Piscine : Ouvert de 09:00 à 19:00. Ambiance Famille (Lundi), Femmes (Jeudi), Mixte (Autres jours).
- Lavage Auto : Lavage rapide, complet, et premium (polissage).
- Boutique & Lubrifiants : Ouvert de 08:00 à 20:00. Catalogue 100% digital.
- Contact : 06 61 69 01 79 (Assistance 24/7).

Instructions de communication :
- Sois professionnel, accueillant et serviable.
- Réponds de manière concise et directe. Ne fais pas de longues phrases inutiles.
- Réponds dans la langue demandée par l'utilisateur ou la langue de l'interface (actuellement : ${language || 'fr'}).
- Ne donne pas d'informations que tu ne possèdes pas. Si tu ne sais pas, dis que le client peut contacter le support au 06 61 69 01 79.`;

        // Format history for Gemini
        const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: "Voici tes instructions système: " + systemInstruction }] },
                { role: 'model', parts: [{ text: "Compris. Je suis l'assistant de Golden Parc Station GPS et je répondrai uniquement aux questions liées à la station." }] },
                ...formattedHistory
            ],
        });

        const lastMessage = messages[messages.length - 1].text;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
