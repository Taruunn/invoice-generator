import React, { useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';

export default function EmailModal({ isOpen, onClose, onSend, isSending }) {
    const [toEmail, setToEmail] = useState('');
    const [subject, setSubject] = useState('Your Invoice');
    const [message, setMessage] = useState('Hi there,\n\nPlease find your invoice attached.\n\nThank you for your business!');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (toEmail.trim() && subject.trim()) {
            onSend({ toEmail, subject, message });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ width: 440 }}>
                <div className="modal-header">
                    <h3>Send Invoice via Email</h3>
                    <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <form id="email-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>To (Email Address)</label>
                            <input
                                type="email"
                                required
                                value={toEmail}
                                onChange={(e) => setToEmail(e.target.value)}
                                placeholder="client@example.com"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Subject</label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Invoice from ProInvoice"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Message</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                style={{ height: 120, resize: 'vertical' }}
                            />
                        </div>

                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                            background: '#f3f4f6', borderRadius: 8, fontSize: 13, color: '#4b5563'
                        }}>
                            <Paperclip size={16} />
                            <span><strong>invoice.pdf</strong> will be attached automatically.</span>
                        </div>

                    </form>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                    <button className="btn btn-ghost" onClick={onClose} disabled={isSending}>Cancel</button>
                    <button form="email-form" type="submit" className="btn btn-primary" disabled={isSending}>
                        {isSending ? <span className="spin">⏳</span> : <Send size={15} />}
                        {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    );
}
