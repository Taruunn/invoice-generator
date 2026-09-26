import { NextResponse } from 'next/server';
import { signMasterToken } from '../../../lib/workspace-auth';

const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD = process.env.APP_PASSWORD;

export async function POST(request) {
    const body = await request.json();
    const { username, password } = body || {};

    if (APP_USERNAME && APP_PASSWORD && username === APP_USERNAME && password === APP_PASSWORD) {
        return NextResponse.json({ token: signMasterToken(username), message: 'Login successful' });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
}
