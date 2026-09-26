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
    const { toEmail, ccEmail, subject, message, pdfBase64, fromEmail, filename } = body || {};
    if (!toEmail || !subject || !pdfBase64) {
        return NextResponse.json({ error: 'Missing required fields (toEmail, subject, pdfBase64)' }, { status: 400 });
    }

    const splitList = (raw) =>
        String(raw || '')
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e.length > 0);
    const recipients = splitList(toEmail);
    const ccRecipients = splitList(ccEmail);

    let transportOptions;
    let senderUser;
    let fromDisplayName;
    let bccSelf = false;

    if (auth.workspace === 'pallavi') {
        // Hostinger mailbox (hello@tarun.codes): plain SMTP with the mailbox password.
        // SMTP does not drop a copy in Hostinger's Sent folder, so we BCC the mailbox to keep a record.
        senderUser = process.env.HOSTINGER_EMAIL_USER;
        const pass = process.env.HOSTINGER_EMAIL_PASSWORD;
        fromDisplayName = process.env.EMAIL_FROM_NAME_PALLAVI || 'Tarun Kumar';
        bccSelf = true;
        if (!senderUser || !pass) {
            console.error('Hostinger SMTP credentials missing for workspace', auth.workspace);
            return NextResponse.json(
                {
                    error:
                        'Set HOSTINGER_EMAIL_USER and HOSTINGER_EMAIL_PASSWORD (the mailbox password from Hostinger hPanel → Emails).',
                },
                { status: 500 }
            );
        }
        transportOptions = {
            host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
            port: 465,
            secure: true,
            auth: { user: senderUser, pass },
        };
    } else {
        senderUser = process.env.GMAIL_USER;
        const pass = normalizeGmailAppPassword(process.env.GMAIL_APP_PASSWORD);
        fromDisplayName = process.env.EMAIL_FROM_NAME_TARUN || 'Tarun Kumar';
        if (!senderUser || !pass) {
            console.error('Gmail credentials missing for workspace', auth.workspace);
            return NextResponse.json(
                { error: 'Server configuration error (set GMAIL_USER and GMAIL_APP_PASSWORD for Tarun)' },
                { status: 500 }
            );
        }
        transportOptions = { service: 'gmail', auth: { user: senderUser, pass } };
    }

    try {
        const transporter = nodemailer.createTransport(transportOptions);

        const info = await transporter.sendMail({
            from: `${fromDisplayName} <${senderUser}>`,
            to: recipients.join(', '),
            ...(ccRecipients.length > 0 ? { cc: ccRecipients.join(', ') } : {}),
            ...(bccSelf ? { bcc: senderUser } : {}),
            replyTo: fromEmail || senderUser,
            subject: subject,
            text: message || 'Please find your invoice attached.',
            attachments: [
                {
                    filename: filename || 'invoice.pdf',
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
