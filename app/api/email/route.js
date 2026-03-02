import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const APP_SECRET = process.env.APP_SECRET || 'default-secret';

function verifyToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];
    try {
        const [payloadBase64, signature] = token.split('.');
        if (!payloadBase64 || !signature) return false;
        if (!APP_SECRET) return false;

        const payload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const expectedSignature = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
        return signature === expectedSignature;
    } catch (err) {
        return false;
    }
}

export async function POST(request) {
    // 1. Verify Auth
    if (!verifyToken(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Env
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        console.error('Gmail credentials missing');
        return NextResponse.json({ error: 'Server configuration error (missing Gmail credentials)' }, { status: 500 });
    }

    // 3. Extract Body
    const body = await request.json();
    const { toEmail, subject, message, pdfBase64, fromEmail } = body || {};
    if (!toEmail || !subject || !pdfBase64) {
        return NextResponse.json({ error: 'Missing required fields (toEmail, subject, pdfBase64)' }, { status: 400 });
    }

    // Process multiple recipients
    const recipients = toEmail.split(',').map(e => e.trim()).filter(e => e.length > 0);

    try {
        // 4. Create Gmail SMTP transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });

        // 5. Send Email
        const info = await transporter.sendMail({
            from: `Tarun Kumar <${GMAIL_USER}>`,
            to: recipients.join(', '),
            replyTo: fromEmail || GMAIL_USER,
            subject: subject,
            text: message || 'Please find your invoice attached.',
            attachments: [
                {
                    filename: 'invoice.pdf',
                    content: pdfBase64,
                    encoding: 'base64',
                },
            ],
        });

        return NextResponse.json({ success: true, id: info.messageId });
    } catch (err) {
        console.error('Email send failed:', err);
        return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
    }
}
