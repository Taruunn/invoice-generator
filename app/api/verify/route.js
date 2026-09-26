import { NextResponse } from 'next/server';
import { verifyMasterToken } from '../../../lib/workspace-auth';

export async function GET(request) {
    if (verifyMasterToken(request)) {
        return NextResponse.json({ valid: true });
    }
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
