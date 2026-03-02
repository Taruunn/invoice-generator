import { NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD = process.env.APP_PASSWORD;
const APP_SECRET = process.env.APP_SECRET || 'default-secret';

export async function POST(request) {
    const body = await request.json();
    const { username, password } = body || {};

    if (username === APP_USERNAME && password === APP_PASSWORD) {
        // Create a signed token
        const payload = `${username}:${Date.now()}`;
        const signature = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
        const token = Buffer.from(payload).toString('base64') + '.' + signature;

        return NextResponse.json({ token, message: 'Login successful' });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
}
