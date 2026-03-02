import { NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';

export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    try {
        const [payloadB64, signature] = token.split('.');
        const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const expectedSig = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');

        if (signature === expectedSig) {
            return NextResponse.json({ valid: true });
        }
    } catch (e) {
        // fall through
    }

    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
