import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyMasterToken } from '../../../../lib/workspace-auth';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';

function tarunSigningKey() {
    const user = process.env.TARUN_WORKSPACE_USERNAME || '';
    const pass = process.env.TARUN_WORKSPACE_PASSWORD || '';
    if (!user || !pass) return null;
    return `${APP_SECRET}|tarun_ws|${user}|${pass}`;
}

export async function POST(request) {
    if (!verifyMasterToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = tarunSigningKey();
    if (!key) {
        return NextResponse.json(
            { error: 'Tarun workspace login is not configured (set TARUN_WORKSPACE_USERNAME and TARUN_WORKSPACE_PASSWORD)' },
            { status: 503 }
        );
    }

    const body = await request.json();
    const { username, password } = body || {};

    const expectedUser = process.env.TARUN_WORKSPACE_USERNAME;
    const expectedPass = process.env.TARUN_WORKSPACE_PASSWORD;

    if (username !== expectedUser || password !== expectedPass) {
        return NextResponse.json({ error: 'Invalid Tarun workspace credentials' }, { status: 401 });
    }

    const payload = `tarun_ws:${username}:${Date.now()}`;
    const signature = crypto.createHmac('sha256', key).update(payload).digest('hex');
    const token = Buffer.from(payload).toString('base64') + '.' + signature;

    return NextResponse.json({ token, message: 'Tarun workspace unlocked' });
}
