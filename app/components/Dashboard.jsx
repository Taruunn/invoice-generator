'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, CheckCircle2, CalendarCheck, Eye } from 'lucide-react';

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function Dashboard({ invoices, onCreateInvoice, onViewInvoice, isLoading }) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const invoiceMap = {};
    (invoices || []).forEach((inv) => { invoiceMap[inv.month] = inv; });

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
                        <p style={{ fontSize: 12, color: '#999', margin: 0, fontWeight: 500 }}>Manage your {currentYear} invoices</p>
                    </div>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#f0f4ff', padding: '6px 14px', borderRadius: 20,
                    fontSize: 13, fontWeight: 700, color: '#4f6ef7',
                }}>
                    <CalendarCheck size={14} />
                    {currentYear}
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
                                    onClick={() => invoice ? onViewInvoice(invoice) : onCreateInvoice(monthNum)}
                                    style={{
                                        background: '#fff',
                                        borderRadius: 16,
                                        border: invoice
                                            ? '1.5px solid #86efac'
                                            : isCurrent
                                                ? '1.5px solid #93c5fd'
                                                : '1px solid #f0f0f0',
                                        padding: 16,
                                        cursor: 'pointer',
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

                                    {/* Action button */}
                                    {invoice ? (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: 6, padding: '8px 0',
                                            background: '#f0fdf4', borderRadius: 10,
                                            fontSize: 12, fontWeight: 600, color: '#059669',
                                        }}>
                                            <Eye size={14} />
                                            View Invoice
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
