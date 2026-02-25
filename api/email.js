import crypto from 'crypto';

// Validate auth token (same as invoices route)
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];
    try {
        const [payloadBase64, signature] = token.split('.');
        if (!payloadBase64 || !signature) return false;

        const APP_SECRET = process.env.APP_SECRET;
        if (!APP_SECRET) return false;

        const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');

        // Verify signature
        const expectedSignature = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
        if (signature !== expectedSignature) return false;

        return true;
    } catch (err) {
        return false;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify Auth
    if (!verifyToken(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Validate Env
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY is missing');
        return res.status(500).json({ error: 'Server configuration error (missing RESEND_API_KEY)' });
    }

    // 3. Extract Body
    const { toEmail, subject, message, pdfBase64 } = req.body || {};
    if (!toEmail || !subject || !pdfBase64) {
        return res.status(400).json({ error: 'Missing required fields (toEmail, subject, pdfBase64)' });
    }

    // Process multiple emails if provided
    const recipients = toEmail.split(',').map(e => e.trim()).filter(e => e.length > 0);

    try {
        // 4. Send Email via Resend HTTP API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Invoice Generator <onboarding@resend.dev>', // Free tier Resend test domain
                to: recipients,
                subject: subject,
                text: message || 'Please find your invoice attached.',
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        content: pdfBase64,
                    }
                ]
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, id: data.id });
        } else {
            console.error('Resend API Error:', data);
            return res.status(response.status).json({ error: data.message || 'Failed to send email via Resend' });
        }
    } catch (err) {
        console.error('Email send exception:', err);
        return res.status(500).json({ error: 'Internal server error while sending email' });
    }
}
