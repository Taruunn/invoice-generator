import crypto from 'crypto';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';

export default function handler(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const [payloadB64, signature] = token.split('.');
        const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
        const expectedSig = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');

        if (signature === expectedSig) {
            return res.status(200).json({ valid: true });
        }
    } catch (e) {
        // fall through
    }

    return res.status(401).json({ error: 'Invalid token' });
}
