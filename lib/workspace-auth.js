import crypto from 'crypto';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';

export const WORKSPACES = ['vagmi', 'tarun'];

export function verifyMasterToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    try {
        const [payloadB64, signature] = token.split('.');
        const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const expectedSig = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
        return signature === expectedSig;
    } catch {
        return false;
    }
}

function tarunSigningKey() {
    const user = process.env.TARUN_WORKSPACE_USERNAME || '';
    const pass = process.env.TARUN_WORKSPACE_PASSWORD || '';
    if (!user || !pass) return null;
    return `${APP_SECRET}|tarun_ws|${user}|${pass}`;
}

export function verifyTarunWorkspaceToken(token) {
    const key = tarunSigningKey();
    if (!key || !token) return false;
    try {
        const [payloadB64, signature] = token.split('.');
        const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const parts = payload.split(':');
        if (parts[0] !== 'tarun_ws' || parts.length < 3) return false;
        const expectedSig = crypto.createHmac('sha256', key).update(payload).digest('hex');
        return signature === expectedSig;
    } catch {
        return false;
    }
}

export function getWorkspaceHeader(request) {
    const raw = (request.headers.get('x-workspace') || '').trim().toLowerCase();
    if (!raw || !WORKSPACES.includes(raw)) return null;
    return raw;
}

/**
 * Master token must be valid. Tarun workspace additionally requires X-Tarun-Token.
 * @returns {{ ok: true, workspace: string } | { ok: false, status: number, error: string }}
 */
export function resolveWorkspaceRequest(request) {
    if (!verifyMasterToken(request)) {
        return { ok: false, status: 401, error: 'Unauthorized' };
    }
    const workspace = getWorkspaceHeader(request);
    if (!workspace) {
        return { ok: false, status: 400, error: 'Missing or invalid X-Workspace header (vagmi | tarun)' };
    }
    if (workspace === 'tarun') {
        const tarunHeader = request.headers.get('x-tarun-token');
        if (!tarunHeader || !verifyTarunWorkspaceToken(tarunHeader.trim())) {
            return {
                ok: false,
                status: 401,
                error: 'Tarun workspace requires a valid X-Tarun-Token',
            };
        }
    }
    return { ok: true, workspace };
}
