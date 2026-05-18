'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, CalendarCheck, Eye, SlidersHorizontal, ArrowLeftRight, Trash2 } from 'lucide-react';

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Dashboard({
    invoices,
    onCreateInvoice,
    onViewInvoice,
    onDeleteInvoice,
    isLoading,
    workspaceLabel,
    onMasterPrefill,
    onSwitchWorkspace,
}) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const invoiceMap = {};
    (invoices || []).forEach((inv) => {
        const m = Number(inv.month);
        if (Number.isFinite(m)) invoiceMap[m] = inv;
    });

    return (
        <div style={{
            minHeight: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
            background: '#f8f9fb',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Header */}
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #eee',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: '#fff', border: '1px solid #eee',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                        <img src="/ysm-logo.png" alt="YSM" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0, letterSpacing: -0.5 }}>Invoice Timeline</h1>
                        <p style={{ fontSize: 12, color: '#999', margin: 0, fontWeight: 500 }}>
                            Manage your {currentYear} invoices · Saved months show <strong style={{ color: '#64748b' }}>Delete saved invoice</strong> to reset a slot
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {workspaceLabel && (
                        <span style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#3730a3',
                            background: '#eef2ff',
                            padding: '6px 12px',
                            borderRadius: 999,
                            letterSpacing: 0.02,
                        }}>
                            {workspaceLabel}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onMasterPrefill}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        <SlidersHorizontal size={16} />
                        Master prefill
                    </button>
                    <button
                        type="button"
                        onClick={onSwitchWorkspace}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        <ArrowLeftRight size={16} />
                        Switch workspace
                    </button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#f0f4ff',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#4f6ef7',
                    }}>
                        <CalendarCheck size={14} />
                        {currentYear}
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                        <div style={{
                            width: 32, height: 32, border: '3px solid #e5e7eb',
                            borderTopColor: '#4f6ef7', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        <span style={{ color: '#999', fontSize: 13 }}>Loading...</span>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 16,
                        maxWidth: 1100,
                        margin: '0 auto',
                    }}>
                        {MONTHS.map((month, idx) => {
                            const monthNum = idx + 1;
                            const invoice = invoiceMap[monthNum];
                            const isCurrent = monthNum === currentMonth;

                            return (
                                <motion.div
                                    key={month}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    onClick={() => {
                                        if (!invoice) onCreateInvoice(monthNum);
                                    }}
                                    style={{
                                        background: '#fff',
                                        borderRadius: 16,
                                        border: invoice
                                            ? '1.5px solid #86efac'
                                            : isCurrent
                                                ? '1.5px solid #93c5fd'
                                                : '1px solid #f0f0f0',
                                        padding: 16,
                                        cursor: invoice ? 'default' : 'pointer',
                                        position: 'relative',
                                        boxShadow: invoice
                                            ? '0 4px 20px rgba(16,185,129,0.08)'
                                            : '0 2px 10px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 12,
                                        transition: 'box-shadow 0.2s',
                                    }}
                                >
                                    {/* Top row */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, fontWeight: 800,
                                                background: invoice ? '#ecfdf5' : '#f5f5f5',
                                                color: invoice ? '#059669' : '#999',
                                            }}>
                                                {String(monthNum).padStart(2, '0')}
                                            </span>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{month}</span>
                                        </div>
                                        {invoice && (
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: 3,
                                                fontSize: 10, fontWeight: 700, color: '#059669',
                                                background: '#ecfdf5', padding: '2px 8px', borderRadius: 10,
                                            }}>
                                                <CheckCircle2 size={10} /> Saved
                                            </span>
                                        )}
                                        {isCurrent && !invoice && (
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, color: '#3b82f6',
                                                background: '#eff6ff', padding: '2px 8px', borderRadius: 10,
                                            }}>
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions — saved months use explicit buttons so Delete is always visible */}
                                    {invoice ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewInvoice(invoice);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    padding: '10px 12px',
                                                    background: '#f0fdf4',
                                                    borderRadius: 10,
                                                    border: 'none',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: '#059669',
                                                    cursor: 'pointer',
                                                    fontFamily: 'inherit',
                                                    width: '100%',
                                                }}
                                            >
                                                <Eye size={14} />
                                                View invoice
                                            </button>
                                            {typeof onDeleteInvoice === 'function' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteInvoice(invoice);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 6,
                                                        padding: '10px 12px',
                                                        background: '#fff',
                                                        borderRadius: 10,
                                                        border: '1.5px solid #fecaca',
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        fontFamily: 'inherit',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <Trash2 size={14} strokeWidth={2} />
                                                    Delete saved invoice
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: 6, padding: '8px 0',
                                            background: '#fafafa', borderRadius: 10,
                                            border: '1.5px dashed #e0e0e0',
                                            fontSize: 12, fontWeight: 600, color: '#aaa',
                                        }}>
                                            <Plus size={14} />
                                            Create New
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center', padding: '12px 0',
                fontSize: 11, color: '#ccc', fontWeight: 500, flexShrink: 0,
            }}>
                Powered by YSM
            </div>
        </div>
    );
}
