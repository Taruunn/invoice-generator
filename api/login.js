import crypto from 'crypto';

const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD = process.env.APP_PASSWORD;
const APP_SECRET = process.env.APP_SECRET || 'default-secret';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body || {};

    if (username === APP_USERNAME && password === APP_PASSWORD) {
        // Create a signed token
        const payload = `${username}:${Date.now()}`;
        const signature = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
        const token = Buffer.from(payload).toString('base64') + '.' + signature;

        return res.status(200).json({ token, message: 'Login successful' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
}
