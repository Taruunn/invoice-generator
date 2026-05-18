'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Save, Plus, Trash2 } from 'lucide-react';

const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    display: 'block',
    marginBottom: 6,
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
};

const textareaStyle = {
    ...inputStyle,
    minHeight: 72,
    resize: 'vertical',
    lineHeight: 1.5,
};

const sectionTitleStyle = {
    fontSize: 11,
    fontWeight: 800,
    color: '#1e293b',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    margin: '20px 0 12px',
    paddingBottom: 8,
    borderBottom: '1px solid #e2e8f0',
};

function SectionTitle({ children }) {
    return <h4 style={sectionTitleStyle}>{children}</h4>;
}

/**
 * Master prefill form — same fields as the invoice template (merged into new month slots).
 * Omits invoice # and dates (those come from the month you create).
 */
export default function PrefillModal({
    isOpen,
    onClose,
    workspaceLabel,
    initialJson,
    onSave,
    isSaving,
}) {
    const [form, setForm] = useState(() => emptyFormFromInitial({}));

    const resetFromInitial = useCallback(() => {
        setForm(emptyFormFromInitial(initialJson));
    }, [initialJson]);

    useEffect(() => {
        if (isOpen) resetFromInitial();
    }, [isOpen, resetFromInitial]);

    const setField = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setItem = useCallback((index, field, value) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
        }));
    }, []);

    const addItemRow = useCallback(() => {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), desc: '', qty: 1, rate: 0 }],
        }));
    }, []);

    const removeItemRow = useCallback((index) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.length <= 1 ? prev.items : prev.items.filter((_, i) => i !== index),
        }));
    }, []);

    if (!isOpen) return null;

    const handleSave = () => {
        const items = form.items.map((row, i) => ({
            id: i + 1,
            desc: row.desc ?? '',
            qty: Number(row.qty) || 0,
            rate: Number(row.rate) || 0,
        }));

        const payload = {
            ...initialJson,
            senderName: form.senderName,
            tradeName: form.tradeName,
            senderAddress: form.senderAddress,
            senderGst: form.senderGst,
            senderPan: form.senderPan,
            senderEmail: form.senderEmail,

            invoiceTitle: form.invoiceTitle,
            invoiceNoLabel: form.invoiceNoLabel,
            dateLabel: form.dateLabel,
            dueDateLabel: form.dueDateLabel,
            currency: form.currency,

            billToLabel: form.billToLabel,
            receiverName: form.receiverName,
            receiverAddress: form.receiverAddress,
            receiverVat: form.receiverVat,

            items,

            subtotalLabel: form.subtotalLabel,
            taxLabel: form.taxLabel,
            taxAmount: parseFloat(form.taxAmount) || 0,
            totalLabel: form.totalLabel,

            notesTitle: form.notesTitle,
            notesContent: form.notesContent,
            termsTitle: form.termsTitle,
            termsContent: form.termsContent,
        };

        delete payload.invoiceNo;
        delete payload.invoiceDate;
        delete payload.dueDate;

        onSave(payload);
    };

    return (
        <div className="modal-overlay">
            <div
                className="modal"
                style={{
                    width: 'min(720px, 96vw)',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div className="modal-header">
                    <h3>Master prefill · {workspaceLabel}</h3>
                    <button type="button" className="btn-icon" onClick={() => !isSaving && onClose()} disabled={isSaving}>
                        <X size={18} />
                    </button>
                </div>

                <div
                    className="modal-body"
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        minHeight: 0,
                        paddingRight: 4,
                    }}
                >
                    <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
                        Saved values merge into each <strong>new</strong> invoice when you pick a month. Invoice number and dates still come from that month.
                        You can use HTML in rich fields (e.g. <code style={{ fontSize: 12 }}>&lt;br/&gt;</code>, <code style={{ fontSize: 12 }}>&lt;b&gt;</code>).
                    </p>

                    <SectionTitle>From — sender</SectionTitle>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Name / company</label>
                            <input style={inputStyle} value={form.senderName} onChange={(e) => setField('senderName', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Trade name</label>
                            <input style={inputStyle} value={form.tradeName} onChange={(e) => setField('tradeName', e.target.value)} placeholder="Optional" />
                        </div>
                        <div>
                            <label style={labelStyle}>Address</label>
                            <textarea style={textareaStyle} rows={4} value={form.senderAddress} onChange={(e) => setField('senderAddress', e.target.value)} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>GST line</label>
                                <input style={inputStyle} value={form.senderGst} onChange={(e) => setField('senderGst', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>PAN line</label>
                                <input style={inputStyle} value={form.senderPan} onChange={(e) => setField('senderPan', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Email line</label>
                            <input style={inputStyle} value={form.senderEmail} onChange={(e) => setField('senderEmail', e.target.value)} />
                        </div>
                    </div>

                    <SectionTitle>Invoice header — titles & labels</SectionTitle>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Main title (e.g. INVOICE)</label>
                                <input style={inputStyle} value={form.invoiceTitle} onChange={(e) => setField('invoiceTitle', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Currency symbol</label>
                                <input style={inputStyle} value={form.currency} onChange={(e) => setField('currency', e.target.value)} maxLength={8} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Invoice # label</label>
                                <input style={inputStyle} value={form.invoiceNoLabel} onChange={(e) => setField('invoiceNoLabel', e.target.value)} />
                            </div>
                            <div />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Date label</label>
                                <input style={inputStyle} value={form.dateLabel} onChange={(e) => setField('dateLabel', e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Due date label</label>
                                <input style={inputStyle} value={form.dueDateLabel} onChange={(e) => setField('dueDateLabel', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <SectionTitle>Bill to — client</SectionTitle>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Section title (e.g. BILL TO)</label>
                            <input style={inputStyle} value={form.billToLabel} onChange={(e) => setField('billToLabel', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Client name</label>
                            <input style={inputStyle} value={form.receiverName} onChange={(e) => setField('receiverName', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Client address</label>
                            <textarea style={textareaStyle} rows={3} value={form.receiverAddress} onChange={(e) => setField('receiverAddress', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>VAT / tax ID line</label>
                            <input style={inputStyle} value={form.receiverVat} onChange={(e) => setField('receiverVat', e.target.value)} />
                        </div>
                    </div>

                    <SectionTitle>Default line items</SectionTitle>
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: '#94a3b8' }}>
                        First row is the template for new invoices; add more default rows if you usually bill multiple lines.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {form.items.map((row, index) => (
                            <div
                                key={row.id ?? index}
                                style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 12,
                                    padding: 14,
                                    background: '#fafafa',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Line {index + 1}</span>
                                    {form.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItemRow(index)}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                fontFamily: 'inherit',
                                                padding: 4,
                                            }}
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    style={{ ...textareaStyle, marginBottom: 12 }}
                                    rows={5}
                                    value={row.desc}
                                    onChange={(e) => setItem(index, 'desc', e.target.value)}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={labelStyle}>Qty</label>
                                        <input
                                            type="number"
                                            style={inputStyle}
                                            value={row.qty}
                                            onChange={(e) => setItem(index, 'qty', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Rate</label>
                                        <input
                                            type="number"
                                            style={inputStyle}
                                            value={row.rate}
                                            onChange={(e) => setItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addItemRow}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                alignSelf: 'flex-start',
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px dashed #cbd5e1',
                                background: '#fff',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#475569',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            <Plus size={16} />
                            Add default line
                        </button>
                    </div>

                    <SectionTitle>Totals — labels</SectionTitle>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Subtotal label</label>
                            <input style={inputStyle} value={form.subtotalLabel} onChange={(e) => setField('subtotalLabel', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Total label</label>
                            <input style={inputStyle} value={form.totalLabel} onChange={(e) => setField('totalLabel', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Tax label</label>
                            <input style={inputStyle} value={form.taxLabel} onChange={(e) => setField('taxLabel', e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Default tax amount</label>
                            <input
                                type="number"
                                step="any"
                                style={inputStyle}
                                value={form.taxAmount}
                                onChange={(e) => setField('taxAmount', e.target.value)}
                            />
                        </div>
                    </div>

                    <SectionTitle>Payment details</SectionTitle>
                    <div>
                        <label style={labelStyle}>Section title</label>
                        <input style={{ ...inputStyle, marginBottom: 12 }} value={form.notesTitle} onChange={(e) => setField('notesTitle', e.target.value)} />
                        <label style={labelStyle}>Content (bank details, etc.)</label>
                        <textarea style={textareaStyle} rows={6} value={form.notesContent} onChange={(e) => setField('notesContent', e.target.value)} />
                    </div>

                    <SectionTitle>Terms</SectionTitle>
                    <div>
                        <label style={labelStyle}>Section title</label>
                        <input style={{ ...inputStyle, marginBottom: 12 }} value={form.termsTitle} onChange={(e) => setField('termsTitle', e.target.value)} />
                        <label style={labelStyle}>Content</label>
                        <textarea style={textareaStyle} rows={6} value={form.termsContent} onChange={(e) => setField('termsContent', e.target.value)} />
                    </div>
                </div>

                <div
                    className="modal-footer"
                    style={{
                        borderTop: '1px solid #e5e7eb',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        flexShrink: 0,
                    }}
                >
                    <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {isSaving ? 'Saving…' : 'Save prefill'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function emptyFormFromInitial(initialJson) {
    const j = initialJson && typeof initialJson === 'object' ? initialJson : {};

    const rawItems = Array.isArray(j.items) && j.items.length > 0 ? j.items : [{ desc: '', qty: 1, rate: 0 }];

    return {
        senderName: j.senderName ?? '',
        tradeName: j.tradeName ?? '',
        senderAddress: j.senderAddress ?? '',
        senderGst: j.senderGst ?? '',
        senderPan: j.senderPan ?? '',
        senderEmail: j.senderEmail ?? '',

        invoiceTitle: j.invoiceTitle ?? 'INVOICE',
        invoiceNoLabel: j.invoiceNoLabel ?? '#',
        dateLabel: j.dateLabel ?? 'Date:',
        dueDateLabel: j.dueDateLabel ?? 'Due Date:',
        currency: j.currency ?? '$',

        billToLabel: j.billToLabel ?? 'BILL TO',
        receiverName: j.receiverName ?? '',
        receiverAddress: j.receiverAddress ?? '',
        receiverVat: j.receiverVat ?? '',

        items: rawItems.map((row, i) => ({
            id: typeof row.id === 'number' ? row.id : i + 1,
            desc: row.desc ?? '',
            qty: Number(row.qty) || 0,
            rate: Number(row.rate) || 0,
        })),

        subtotalLabel: j.subtotalLabel ?? 'Subtotal',
        taxLabel: j.taxLabel ?? 'Tax',
        taxAmount: j.taxAmount !== undefined && j.taxAmount !== '' ? String(j.taxAmount) : '0',
        totalLabel: j.totalLabel ?? 'Total',

        notesTitle: j.notesTitle ?? 'Payment details',
        notesContent: j.notesContent ?? '',
        termsTitle: j.termsTitle ?? 'Terms',
        termsContent: j.termsContent ?? '',
    };
}
