'use client';

import React, { useState } from 'react';
import { X, Loader2, Lock, ArrowLeft } from 'lucide-react';

export default function TarunWorkspaceModal({
    isOpen,
    onClose,
    onSuccess,
    masterToken,
}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/login/tarun', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${masterToken}`,
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
                onSuccess(data.token);
                setPassword('');
                setUsername('');
            } else {
                setError(data.error || 'Could not unlock Tarun workspace');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ width: 400 }}>
                <div className="modal-header">
                    <h3>Tarun workspace</h3>
                    <button type="button" className="btn-icon" onClick={onClose} disabled={loading}>
                        <X size={18} />
                    </button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        Enter the Tarun workspace credentials (set in <code style={{ fontSize: 12 }}>.env</code>).
                    </p>
                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '10px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                        }}>
                            {error}
                        </div>
                    )}
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #e5e7eb',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid #e5e7eb',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {loading ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
                            {loading ? 'Checking…' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
