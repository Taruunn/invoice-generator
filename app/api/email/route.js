import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { resolveWorkspaceRequest } from '../../../lib/workspace-auth';

/** Google prints app passwords with spaces (e.g. `abcd efgh ijkl mnop`); Gmail SMTP expects the same 16 chars — whitespace is ignored. */
function normalizeGmailAppPassword(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return raw.replace(/\s+/g, '');
}

export async function POST(request) {
    const auth = resolveWorkspaceRequest(request);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { toEmail, subject, message, pdfBase64, fromEmail } = body || {};
    if (!toEmail || !subject || !pdfBase64) {
        return NextResponse.json({ error: 'Missing required fields (toEmail, subject, pdfBase64)' }, { status: 400 });
    }

    const recipients = toEmail
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

    let gmailUser;
    let gmailPass;
    let fromDisplayName;

    // Same mail path for both: Gmail SMTP + App Password on each Google account (personal Gmail or Workspace).
    // Vagmi uses her own env vars so mail sends From her address/domain like Tarun does from his.
    if (auth.workspace === 'vagmi') {
        gmailUser = process.env.GMAIL_USER_VAGMI;
        gmailPass = process.env.GMAIL_APP_PASSWORD_VAGMI;
        fromDisplayName = process.env.EMAIL_FROM_NAME_VAGMI || 'Vagmi';
    } else {
        gmailUser = process.env.GMAIL_USER;
        gmailPass = process.env.GMAIL_APP_PASSWORD;
        fromDisplayName = process.env.EMAIL_FROM_NAME_TARUN || 'Tarun Kumar';
    }

    gmailPass = normalizeGmailAppPassword(gmailPass);

    if (!gmailUser || !gmailPass) {
        console.error('Gmail credentials missing for workspace', auth.workspace);
        return NextResponse.json(
            {
                error:
                    auth.workspace === 'vagmi'
                        ? 'Set GMAIL_USER_VAGMI and GMAIL_APP_PASSWORD_VAGMI for Vagmi (Google Account → Security → 2-Step Verification → App passwords). Same method as Tarun: full Gmail address + 16-char app password.'
                        : 'Server configuration error (set GMAIL_USER and GMAIL_APP_PASSWORD for Tarun)',
            },
            { status: 500 }
        );
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });

        const info = await transporter.sendMail({
            from: `${fromDisplayName} <${gmailUser}>`,
            to: recipients.join(', '),
            replyTo: fromEmail || gmailUser,
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

        return NextResponse.json({ success: true, id: info.messageId, workspace: auth.workspace });
    } catch (err) {
        console.error('Email send failed:', err);
        return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
    }
}
