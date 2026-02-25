import React from 'react';
import EditableText from '../components/EditableText.jsx';

/**
 * Template 2 — Typewriter / Monospace
 * Inspired by classic typewritten invoices. Monospace font, off-white paper,
 * thin bordered info box, line-separated items, minimal and utilitarian.
 */
export default function Template2({ data, settings, formatCurrency, onUpdate, onItemUpdate, subtotal, total }) {
    const mono = '"Courier New", "Courier", monospace';

    return (
        <div style={{
            padding: '48px 52px',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#f5f5f0',
            fontFamily: mono,
            fontSize: 13,
            color: '#1a1a1a',
            letterSpacing: '0.01em',
        }}>
            {/* Big INVOICE Title */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <EditableText
                    value={data.invoiceTitle}
                    onChange={(v) => onUpdate('invoiceTitle', v)}
                    tag="h1"
                    style={{
                        fontSize: 38,
                        fontWeight: 900,
                        fontFamily: mono,
                        letterSpacing: '0.08em',
                        color: '#111',
                        textTransform: 'uppercase',
                    }}
                />
            </div>

            {/* Info Box — bordered */}
            <div style={{
                border: '1px solid #1a1a1a',
                display: 'flex',
                marginBottom: 40,
            }}>
                {/* Left: Invoice # + Date */}
                <div style={{
                    flex: 1,
                    padding: '16px 20px',
                    borderRight: '1px solid #1a1a1a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                        <span style={{ textTransform: 'uppercase' }}>Invoice No.</span>
                        <EditableText value={data.invoiceNo} onChange={(v) => onUpdate('invoiceNo', v)} tag="span" style={{ fontFamily: mono }} />
                    </div>
                    <div style={{ fontSize: 12 }}>
                        <EditableText value={data.invoiceDate} onChange={(v) => onUpdate('invoiceDate', v)} tag="span" style={{ fontFamily: mono }} />
                    </div>
                </div>
                {/* Right: Billed To */}
                <div style={{
                    flex: 1,
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    textAlign: 'right',
                }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#666', marginBottom: 2 }}>
                        <EditableText value={data.billToLabel} onChange={(v) => onUpdate('billToLabel', v)} tag="span" style={{ fontFamily: mono }} />
                    </div>
                    <EditableText value={data.receiverName} onChange={(v) => onUpdate('receiverName', v)} style={{ fontWeight: 700, fontFamily: mono, fontSize: 13 }} />
                    <EditableText value={data.receiverAddress} onChange={(v) => onUpdate('receiverAddress', v)} style={{ fontSize: 11, fontFamily: mono, color: '#444' }} />
                </div>
            </div>

            {/* Sender Details (small, top-right style) */}
            <div style={{ marginBottom: 32, fontSize: 11, color: '#555', lineHeight: 1.8 }}>
                <EditableText value={data.senderName} onChange={(v) => onUpdate('senderName', v)} style={{ fontWeight: 700, fontFamily: mono, fontSize: 13, color: '#111', marginBottom: 4 }} />
                <EditableText value={data.tradeName} onChange={(v) => onUpdate('tradeName', v)} style={{ fontFamily: mono, marginBottom: 4 }} />
                <EditableText value={data.senderAddress} onChange={(v) => onUpdate('senderAddress', v)} style={{ fontFamily: mono, marginBottom: 4 }} />
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11 }}>
                    <EditableText value={data.senderGst} onChange={(v) => onUpdate('senderGst', v)} tag="span" style={{ fontFamily: mono }} />
                    <EditableText value={data.senderPan} onChange={(v) => onUpdate('senderPan', v)} tag="span" style={{ fontFamily: mono }} />
                    <EditableText value={data.senderEmail} onChange={(v) => onUpdate('senderEmail', v)} tag="span" style={{ fontFamily: mono }} />
                </div>
            </div>

            {/* Items Table */}
            <div style={{ flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono }}>
                    <thead>
                        <tr style={{ borderTop: '1.5px solid #1a1a1a', borderBottom: '1.5px solid #1a1a1a' }}>
                            <th style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', width: '50%' }}>Item</th>
                            <th style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rate</th>
                            <th style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Qty</th>
                            <th style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #ccc' }}>
                                <td style={{ padding: '14px 8px 14px 0', fontSize: 12, textTransform: 'uppercase' }}>
                                    <EditableText value={item.desc} onChange={(v) => onItemUpdate(item.id, 'desc', v)} placeholder="Description" style={{ fontFamily: mono }} />
                                </td>
                                <td style={{ padding: '14px 0', fontSize: 12, textAlign: 'right' }}>
                                    <input type="number" className="inline-number-input" value={item.rate} onChange={(e) => onItemUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)} style={{ textAlign: 'right', width: 80, fontFamily: mono }} />
                                </td>
                                <td style={{ padding: '14px 0', fontSize: 12, textAlign: 'center' }}>
                                    <input type="number" className="inline-number-input" value={item.qty} onChange={(e) => onItemUpdate(item.id, 'qty', parseFloat(e.target.value) || 0)} style={{ textAlign: 'center', width: 50, fontFamily: mono }} />
                                </td>
                                <td style={{ padding: '14px 0', fontSize: 12, fontWeight: 700, textAlign: 'right' }}>
                                    {formatCurrency(item.qty * item.rate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <div style={{ width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, textTransform: 'uppercase' }}>
                            <EditableText value={data.subtotalLabel} onChange={(v) => onUpdate('subtotalLabel', v)} style={{ fontFamily: mono }} />
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, textTransform: 'uppercase' }}>
                            <EditableText value={data.taxLabel} onChange={(v) => onUpdate('taxLabel', v)} style={{ fontFamily: mono }} />
                            <input type="number" className="inline-number-input" value={data.taxAmount} onChange={(e) => onUpdate('taxAmount', parseFloat(e.target.value) || 0)} style={{ textAlign: 'right', width: 80, fontFamily: mono }} />
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                            fontSize: 16, fontWeight: 900, textTransform: 'uppercase',
                            borderTop: '2px solid #1a1a1a', marginTop: 8,
                        }}>
                            <EditableText value={data.totalLabel} onChange={(v) => onUpdate('totalLabel', v)} style={{ fontFamily: mono }} />
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Bank + Terms */}
            <div style={{ marginTop: 'auto', paddingTop: 32, borderTop: '1px solid #ccc', fontSize: 11 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    <div>
                        <EditableText value={data.notesTitle} onChange={(v) => onUpdate('notesTitle', v)} style={{ fontWeight: 700, fontFamily: mono, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }} />
                        <EditableText value={data.notesContent} onChange={(v) => onUpdate('notesContent', v)} style={{ fontFamily: mono, lineHeight: 1.8, color: '#444' }} />
                    </div>
                    <div>
                        <EditableText value={data.termsTitle} onChange={(v) => onUpdate('termsTitle', v)} style={{ fontWeight: 700, fontFamily: mono, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }} />
                        <EditableText value={data.termsContent} onChange={(v) => onUpdate('termsContent', v)} style={{ fontFamily: mono, lineHeight: 1.8, color: '#444' }} />
                    </div>
                </div>

                {/* Thank You */}
                <div style={{ textAlign: 'right', marginTop: 24, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Thank you for your business!
                </div>
            </div>
        </div>
    );
}
