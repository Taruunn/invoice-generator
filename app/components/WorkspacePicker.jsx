'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Lock, LogOut } from 'lucide-react';

export default function WorkspacePicker({ onSelectVagmi, onSelectTarun, onLogout }) {
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
                    <img src="/ysm-logo.png" alt="YSM" style={{ height: 28, objectFit: 'contain' }} />
                    <div>
                        <h1 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: 0 }}>Choose workspace</h1>
                        <p style={{ fontSize: 12, color: '#999', margin: 0 }}>Vagmi opens directly · Tarun requires an extra sign-in</p>
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
                    onClick={onSelectVagmi}
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
                        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                    }}>
                        <Building2 size={22} color="#4f46e5" />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Vagmi</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        Same invoice editor and templates. Uses Vagmi email settings and prefills when configured.
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
                        <Lock size={20} color="#fff" />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Tarun</div>
                    <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        Your existing invoices and defaults. You will be asked for the Tarun workspace password next.
                    </div>
                </motion.button>
            </div>
        </div>
    );
}
