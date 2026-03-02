'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast notification system — replaces alert() calls
 * Usage: <Toast /> placed once, then call window.__showToast('message', 'success')
 */
let toastCallback = null;

export function showToast(message, type = 'success') {
    if (toastCallback) toastCallback(message, type);
}

export default function Toast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        toastCallback = (message, type) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        };
        return () => { toastCallback = null; };
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24,
            display: 'flex', flexDirection: 'column', gap: 8,
            zIndex: 99999, pointerEvents: 'none',
        }}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 18px',
                        background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${toast.type === 'error' ? '#fee2e2' : '#dcfce7'}`,
                        borderRadius: 12,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        fontSize: 13, fontWeight: 500,
                        color: toast.type === 'error' ? '#dc2626' : '#16a34a',
                        pointerEvents: 'auto',
                        animation: 'toast-in 0.3s ease-out',
                        minWidth: 260,
                    }}
                >
                    {toast.type === 'error'
                        ? <XCircle size={18} style={{ flexShrink: 0 }} />
                        : <CheckCircle size={18} style={{ flexShrink: 0 }} />}
                    <span style={{ flex: 1 }}>{toast.message}</span>
                    <button
                        onClick={() => dismiss(toast.id)}
                        style={{
                            border: 'none', background: 'transparent',
                            cursor: 'pointer', padding: 2, color: 'inherit',
                            opacity: 0.5, flexShrink: 0,
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
