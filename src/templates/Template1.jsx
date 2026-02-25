import React from 'react';
import EditableText from '../components/EditableText.jsx';

/**
 * Template 1 — Classic Minimalist
 * Clean layout with strong typography hierarchy.
 */
export default function Template1({ data, settings, formatCurrency, onUpdate, onItemUpdate, subtotal, total }) {
    return (
        <div style={{ padding: 48, minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
                <div style={{ maxWidth: '50%' }}>
                    <EditableText
                        value={data.senderName}
                        onChange={(v) => onUpdate('senderName', v)}
                        placeholder="Your Name / Company"
                        tag="h1"
                        style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 4, letterSpacing: '-0.02em' }}
                    />
                    <EditableText
                        value={data.tradeName}
                        onChange={(v) => onUpdate('tradeName', v)}
                        placeholder="Trade Name"
                        style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}
                    />
                    <EditableText
                        value={data.senderAddress}
                        onChange={(v) => onUpdate('senderAddress', v)}
                        placeholder="Address"
                        style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 12 }}
                    />
                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <EditableText value={data.senderGst} onChange={(v) => onUpdate('senderGst', v)} placeholder="GST" />
                        <EditableText value={data.senderPan} onChange={(v) => onUpdate('senderPan', v)} placeholder="PAN" />
                        <EditableText value={data.senderEmail} onChange={(v) => onUpdate('senderEmail', v)} placeholder="Email" />
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <EditableText
                        value={data.invoiceTitle}
                        onChange={(v) => onUpdate('invoiceTitle', v)}
                        tag="h2"
                        style={{ fontSize: 36, fontWeight: 900, letterSpacing: '0.1em', color: settings.color, opacity: 0.15, marginBottom: 24 }}
                    />
                    <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>{data.invoiceNoLabel}</span>
                            <EditableText value={data.invoiceNo} onChange={(v) => onUpdate('invoiceNo', v)} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>{data.dateLabel}</span>
                            <EditableText value={data.invoiceDate} onChange={(v) => onUpdate('invoiceDate', v)} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>{data.dueDateLabel}</span>
                            <EditableText value={data.dueDate} onChange={(v) => onUpdate('dueDate', v)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill To */}
            <div style={{ marginBottom: 40 }}>
                <EditableText
                    value={data.billToLabel}
                    onChange={(v) => onUpdate('billToLabel', v)}
                    style={{ fontSize: 11, fontWeight: 800, color: '#111', borderBottom: '2px solid #111', display: 'inline-block', paddingBottom: 4, marginBottom: 10, letterSpacing: '0.04em' }}
                />
                <EditableText
                    value={data.receiverName}
                    onChange={(v) => onUpdate('receiverName', v)}
                    style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}
                />
                <EditableText
                    value={data.receiverAddress}
                    onChange={(v) => onUpdate('receiverAddress', v)}
                    style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}
                />
                <EditableText
                    value={data.receiverVat}
                    onChange={(v) => onUpdate('receiverVat', v)}
                    style={{ fontSize: 12, color: '#6b7280' }}
                />
            </div>

            {/* Items Table */}
            <div style={{ flex: 1 }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #111' }}>
                            <th style={{ padding: '12px 0', fontSize: 11, fontWeight: 800, color: '#111', width: '50%' }}>ITEM</th>
                            <th style={{ padding: '12px 0', fontSize: 11, fontWeight: 800, color: '#111', textAlign: 'center' }}>QTY</th>
                            <th style={{ padding: '12px 0', fontSize: 11, fontWeight: 800, color: '#111', textAlign: 'right' }}>RATE</th>
                            <th style={{ padding: '12px 0', fontSize: 11, fontWeight: 800, color: '#111', textAlign: 'right' }}>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
                                <td style={{ padding: '16px 8px 16px 0', fontSize: 13, color: '#374151' }}>
                                    <EditableText value={item.desc} onChange={(v) => onItemUpdate(item.id, 'desc', v)} placeholder="Description" />
                                </td>
                                <td style={{ padding: '16px 0', fontSize: 13, color: '#374151', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        className="inline-number-input"
                                        value={item.qty}
                                        onChange={(e) => onItemUpdate(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                        style={{ textAlign: 'center', width: 50 }}
                                    />
                                </td>
                                <td style={{ padding: '16px 0', fontSize: 13, color: '#374151', textAlign: 'right' }}>
                                    <input
                                        type="number"
                                        className="inline-number-input"
                                        value={item.rate}
                                        onChange={(e) => onItemUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                        style={{ textAlign: 'right', width: 80 }}
                                    />
                                </td>
                                <td style={{ padding: '16px 0', fontSize: 13, color: '#111', fontWeight: 600, textAlign: 'right' }}>
                                    {formatCurrency(item.qty * item.rate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <div style={{ width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#6b7280' }}>
                            <EditableText value={data.subtotalLabel} onChange={(v) => onUpdate('subtotalLabel', v)} />
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                            <EditableText value={data.taxLabel} onChange={(v) => onUpdate('taxLabel', v)} />
                            <span>
                                <input
                                    type="number"
                                    className="inline-number-input"
                                    value={data.taxAmount}
                                    onChange={(e) => onUpdate('taxAmount', parseFloat(e.target.value) || 0)}
                                    style={{ textAlign: 'right', width: 80 }}
                                />
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 18, fontWeight: 800, color: '#111' }}>
                            <EditableText value={data.totalLabel} onChange={(v) => onUpdate('totalLabel', v)} />
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 'auto', paddingTop: 32, borderTop: '1px solid #e5e7eb', fontSize: 12 }}>
                <div>
                    <EditableText value={data.notesTitle} onChange={(v) => onUpdate('notesTitle', v)} style={{ fontWeight: 800, color: '#111', marginBottom: 8 }} />
                    <EditableText value={data.notesContent} onChange={(v) => onUpdate('notesContent', v)} style={{ color: '#6b7280', lineHeight: 1.7 }} />
                </div>
                <div>
                    <EditableText value={data.termsTitle} onChange={(v) => onUpdate('termsTitle', v)} style={{ fontWeight: 800, color: '#111', marginBottom: 8 }} />
                    <EditableText value={data.termsContent} onChange={(v) => onUpdate('termsContent', v)} style={{ color: '#6b7280', lineHeight: 1.7 }} />
                </div>
            </div>
        </div>
    );
}
