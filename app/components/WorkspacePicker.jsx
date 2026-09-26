'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, User, LogOut } from 'lucide-react';

export default function WorkspacePicker({ onSelectPallavi, onSelectTarun, onLogout }) {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8f9fb',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #eee',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={26} color="#0f172a" />
                    <div>
                        <h1 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>Choose workspace</h1>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#64748b',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    <LogOut size={16} />
                    Sign out
                </button>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                gap: 24,
                flexWrap: 'wrap',
            }}>
                <motion.button
                    type="button"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 320 }}
                    onClick={onSelectPallavi}
                    style={{
                        width: 280,
                        textAlign: 'left',
                        padding: 28,
                        borderRadius: 18,
                        border: '1px solid #e8e8ec',
                        background: '#fff',
                        boxShadow: '0 8px 30px rgba(15,23,42,0.06)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: '#faf6ee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                    }}>
                        <img src="/pallavi-logo.svg" alt="" style={{ height: 30 }} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Pallavi Nopany</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        Client invoices in INR, numbered 1, 2, 3… Sent from hello@tarun.codes.
                    </div>
                </motion.button>

                <motion.button
                    type="button"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 320 }}
                    onClick={onSelectTarun}
                    style={{
                        width: 280,
                        textAlign: 'left',
                        padding: 28,
                        borderRadius: 18,
                        border: '1px solid #c7d2fe',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                        boxShadow: '0 8px 30px rgba(79,70,229,0.12)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                    }}>
                        <User size={20} color="#fff" />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Tarun</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        Your existing monthly invoices and defaults.
                    </div>
                </motion.button>
            </div>
        </div>
    );
}
