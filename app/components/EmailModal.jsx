'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip } from 'lucide-react';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getInitial = (email) => email.charAt(0).toUpperCase();

// Deterministic avatar color from the email string
const getAvatarColor = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#8e24aa', '#00897b', '#e65100', '#1565c0', '#6d4c41'];
    return colors[Math.abs(hash) % colors.length];
};

/** Gmail-style chip input used for both To and Cc. Pending typed text is flushed on blur. */
function RecipientField({ label, emails, onChange, placeholder }) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const addEmail = (raw) => {
        const email = raw.trim().toLowerCase();
        if (email && isValidEmail(email) && !emails.includes(email)) {
            onChange([...emails, email]);
        }
        setInputValue('');
    };

    const removeEmail = (email) => {
        onChange(emails.filter((e) => e !== email));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
            e.preventDefault();
            if (inputValue.trim()) addEmail(inputValue);
        }
        // Backspace when input is empty removes last chip
        if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
            removeEmail(emails[emails.length - 1]);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        // Split by comma, semicolon, space, or newline
        const pasted = e.clipboardData.getData('text').split(/[,;\s\n]+/);
        const next = [...emails];
        pasted.forEach((raw) => {
            const email = raw.trim().toLowerCase();
            if (email && isValidEmail(email) && !next.includes(email)) next.push(email);
        });
        onChange(next);
    };

    const handleBlur = () => {
        if (inputValue.trim()) addEmail(inputValue);
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 0', borderBottom: '1px solid #f3f4f6',
            fontSize: 13,
        }}>
            <span style={{ color: '#9ca3af', fontWeight: 500, minWidth: 40, paddingTop: 6 }}>{label}</span>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 36,
                    cursor: 'text',
                }}
                onClick={() => inputRef.current?.focus()}
            >
                {emails.map((email) => (
                    <div
                        key={email}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#f3f4f6',
                            borderRadius: 20,
                            padding: '4px 10px 4px 4px',
                            fontSize: 13,
                            color: '#1f2937',
                            border: '1px solid #e5e7eb',
                            transition: 'all 0.15s',
                            maxWidth: '100%',
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: getAvatarColor(email),
                            color: '#fff', fontWeight: 700, fontSize: 11,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {getInitial(email)}
                        </div>
                        {/* Email text */}
                        <span style={{
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {email}
                        </span>
                        {/* Remove */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeEmail(email); }}
                            style={{
                                border: 'none', background: 'transparent',
                                cursor: 'pointer', padding: 0, display: 'flex',
                                color: '#9ca3af', flexShrink: 0,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                {/* Inline input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onBlur={handleBlur}
                    placeholder={emails.length === 0 ? placeholder : ''}
                    style={{
                        border: 'none', outline: 'none', background: 'transparent',
                        fontSize: 13, color: '#374151', flex: 1, minWidth: 150,
                        padding: '4px 0', fontFamily: 'inherit',
                    }}
                />
            </div>
        </div>
    );
}

/**
 * EmailModal — Gmail-style compose with:
 *  - From (sender email, read-only from env)
 *  - To and Cc with email chip/pill input
 *  - Dynamic subject from invoice data
 *  - Message body
 *  - Attachment indicator
 */
export default function EmailModal({
    isOpen, onClose, onSend, isSending,
    senderEmail, invoiceSubject, attachmentName, invoiceMonth,
    initialRecipients, initialCc,
}) {
    const [recipients, setRecipients] = useState([]);
    const [ccRecipients, setCcRecipients] = useState([]);
    const [fromEmail, setFromEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // Reset fields each time the modal opens
    useEffect(() => {
        if (isOpen) {
            setRecipients(Array.isArray(initialRecipients) ? initialRecipients : []);
            setCcRecipients(Array.isArray(initialCc) ? initialCc : []);
            setSubject(invoiceSubject || '');
            setFromEmail(senderEmail || process.env.NEXT_PUBLIC_SENDER_EMAIL || '');
            setMessage(`Hi there,\n\nPlease find ${invoiceMonth || 'this month\'s'} invoice attached.\n\nThank you`);
        }
    }, [isOpen, invoiceSubject, senderEmail, invoiceMonth, initialRecipients, initialCc]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (recipients.length > 0 && subject.trim()) {
            onSend({
                toEmail: recipients.join(', '),
                ccEmail: ccRecipients.join(', '),
                subject,
                message,
                fromEmail,
            });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ width: 520 }}>
                {/* Header */}
                <div className="modal-header">
                    <h3>Send Invoice</h3>
                    <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="modal-body">
                    <form id="email-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                        {/* From */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 0', borderBottom: '1px solid #f3f4f6',
                            fontSize: 13,
                        }}>
                            <span style={{ color: '#9ca3af', fontWeight: 500, minWidth: 40 }}>From</span>
                            <input
                                type="email"
                                value={fromEmail}
                                readOnly
                                disabled
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    background: 'transparent', fontSize: 13,
                                    color: '#6b7280', fontFamily: 'inherit', padding: '4px 0',
                                    cursor: 'default',
                                }}
                            />
                        </div>

                        <RecipientField
                            label="To"
                            emails={recipients}
                            onChange={setRecipients}
                            placeholder="Type email and press Enter"
                        />
                        <RecipientField
                            label="Cc"
                            emails={ccRecipients}
                            onChange={setCcRecipients}
                            placeholder="Optional"
                        />

                        {/* Subject */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 0', borderBottom: '1px solid #f3f4f6',
                            fontSize: 13,
                        }}>
                            <span style={{ color: '#9ca3af', fontWeight: 500, minWidth: 40 }}>Subject</span>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    background: 'transparent', fontSize: 13,
                                    color: '#374151', fontFamily: 'inherit', padding: '4px 0',
                                }}
                            />
                        </div>

                        {/* Message body */}
                        <div style={{ padding: '16px 0' }}>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Compose your message..."
                                style={{
                                    width: '100%', height: 120, resize: 'vertical',
                                    border: 'none', outline: 'none', background: 'transparent',
                                    fontSize: 13, color: '#374151', fontFamily: 'inherit',
                                    lineHeight: 1.6, padding: 0,
                                }}
                            />
                        </div>

                        {/* Attachment */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px', background: '#f9fafb',
                            borderRadius: 10, border: '1px solid #e5e7eb',
                            fontSize: 13, color: '#374151',
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: '#ef4444', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, fontWeight: 800, flexShrink: 0,
                            }}>
                                PDF
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {attachmentName || 'invoice.pdf'}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Auto-attached</div>
                            </div>
                            <Paperclip size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                    <button className="btn btn-ghost" onClick={onClose} disabled={isSending}>Cancel</button>
                    <button
                        form="email-form" type="submit"
                        className="btn btn-primary"
                        disabled={isSending || recipients.length === 0}
                    >
                        {isSending ? <span className="spin">⏳</span> : <Send size={15} />}
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}
