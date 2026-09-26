import crypto from 'crypto';

export const WORKSPACES = ['pallavi', 'tarun'];

/**
 * Tokens are signed with APP_SECRET + APP_PASSWORD, so changing the password
 * (or the secret) signs everyone out.
 */
function signingKey() {
    return `${process.env.APP_SECRET || 'default-secret'}|${process.env.APP_PASSWORD || ''}`;
}

export function signMasterToken(username) {
    const payload = `${username}:${Date.now()}`;
    const signature = crypto.createHmac('sha256', signingKey()).update(payload).digest('hex');
    return Buffer.from(payload).toString('base64') + '.' + signature;
}

export function verifyMasterToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    try {
        const [payloadB64, signature] = token.split('.');
        const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const expectedSig = crypto.createHmac('sha256', signingKey()).update(payload).digest('hex');
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
 * Master token must be valid and X-Workspace must name a known workspace.
 * @returns {{ ok: true, workspace: string } | { ok: false, status: number, error: string }}
 */
export function resolveWorkspaceRequest(request) {
    if (!verifyMasterToken(request)) {
        return { ok: false, status: 401, error: 'Unauthorized' };
    }
    const workspace = getWorkspaceHeader(request);
    if (!workspace) {
        return { ok: false, status: 400, error: 'Missing or invalid X-Workspace header (pallavi | tarun)' };
    }
    return { ok: true, workspace };
}
