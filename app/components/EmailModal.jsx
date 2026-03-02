'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip } from 'lucide-react';

/**
 * EmailModal — Gmail-style compose with:
 *  - From (sender email, read-only from env)
 *  - To with email chip/pill input
 *  - Dynamic subject from invoice data
 *  - Message body
 *  - Attachment indicator
 */
export default function EmailModal({
    isOpen, onClose, onSend, isSending,
    senderEmail, invoiceSubject, attachmentName, invoiceMonth,
}) {
    const [recipients, setRecipients] = useState(
        (process.env.NEXT_PUBLIC_RECIPIENTS || '').split(',').filter(Boolean)
    );
    const [inputValue, setInputValue] = useState('');
    const [fromEmail, setFromEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    // Sync dynamic subject when modal opens
    useEffect(() => {
        if (isOpen) {
            setSubject(invoiceSubject || '');
            setFromEmail(senderEmail || process.env.NEXT_PUBLIC_SENDER_EMAIL || '');
            setMessage(`Hi there,\n\nPlease find ${invoiceMonth || 'this month\'s'} invoice attached.\n\nThank you`);
        }
    }, [isOpen, invoiceSubject, senderEmail, invoiceMonth]);

    if (!isOpen) return null;

    // --- Email validation ---
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // --- Add email chip ---
    const addEmail = (raw) => {
        const email = raw.trim().toLowerCase();
        if (email && isValidEmail(email) && !recipients.includes(email)) {
            setRecipients((prev) => [...prev, email]);
        }
        setInputValue('');
    };

    const removeEmail = (email) => {
        setRecipients((prev) => prev.filter((e) => e !== email));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
            e.preventDefault();
            if (inputValue.trim()) addEmail(inputValue);
        }
        // Backspace when input is empty removes last chip
        if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
            removeEmail(recipients[recipients.length - 1]);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        // Split by comma, semicolon, space, or newline
        const emails = pasted.split(/[,;\s\n]+/);
        emails.forEach((email) => {
            if (email.trim()) addEmail(email);
        });
    };

    const handleBlur = () => {
        if (inputValue.trim()) addEmail(inputValue);
    };

    // --- Get initial/avatar for email chip ---
    const getInitial = (email) => {
        return email.charAt(0).toUpperCase();
    };

    const getAvatarColor = (email) => {
        // Generate a deterministic color from email string
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#8e24aa', '#00897b', '#e65100', '#1565c0', '#6d4c41'];
        return colors[Math.abs(hash) % colors.length];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add any pending input
        if (inputValue.trim()) addEmail(inputValue);
        const allRecipients = [...recipients];
        if (inputValue.trim() && isValidEmail(inputValue.trim())) {
            allRecipients.push(inputValue.trim().toLowerCase());
        }
        if (allRecipients.length > 0 && subject.trim()) {
            onSend({
                toEmail: allRecipients.join(', '),
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

                        {/* To — chip input */}
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '12px 0', borderBottom: '1px solid #f3f4f6',
                            fontSize: 13,
                        }}>
                            <span style={{ color: '#9ca3af', fontWeight: 500, minWidth: 40, paddingTop: 6 }}>To</span>
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
                                {recipients.map((email) => (
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
                                    placeholder={recipients.length === 0 ? 'Type email and press Enter' : ''}
                                    style={{
                                        border: 'none', outline: 'none', background: 'transparent',
                                        fontSize: 13, color: '#374151', flex: 1, minWidth: 150,
                                        padding: '4px 0', fontFamily: 'inherit',
                                    }}
                                />
                            </div>
                        </div>

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
