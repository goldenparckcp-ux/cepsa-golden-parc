import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const responseCode = formData.get('ProcReturnCode');
        
        const reqUrl = new URL(req.url);
        const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;

        if (responseCode === '00') {
            // Success
            return NextResponse.redirect(`${baseUrl}/profile?payment=success`);
        } else {
            // Failure or cancellation
            return NextResponse.redirect(`${baseUrl}/profile?payment=error&code=${responseCode}`);
        }
    } catch (err) {
        console.error("CMI Return error:", err);
        const reqUrl = new URL(req.url);
        const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;
        return NextResponse.redirect(`${baseUrl}/profile?payment=error`);
    }
}
