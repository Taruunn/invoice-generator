import React, { useState } from 'react';
import { FileText, Loader2, Lock } from 'lucide-react';

/**
 * LoginScreen — simple password gate with username/password from .env
 */
export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                sessionStorage.setItem('auth_token', data.token);
                onLogin(data.token);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Server error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5',
            backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            fontFamily: '"Inter", sans-serif',
        }}>
            <form onSubmit={handleSubmit} style={{
                width: 380,
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)',
                padding: '48px 40px',
                textAlign: 'center',
            }}>
                {/* Brand */}
                <div style={{
                    width: 48, height: 48, background: '#4f46e5', borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', color: '#fff',
                }}>
                    <FileText size={22} />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 4, letterSpacing: '-0.02em' }}>ProInvoice</h1>
                <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>Sign in to access your invoices</p>

                {/* Error */}
                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                        padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                        marginBottom: 20, textAlign: 'left',
                    }}>
                        {error}
                    </div>
                )}

                {/* Username */}
                <div style={{ marginBottom: 16, textAlign: 'left' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        required
                        style={{
                            width: '100%', padding: '10px 14px', border: '1px solid #e2e5ea',
                            borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
                            outline: 'none', transition: 'border-color 0.15s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e5ea'}
                    />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 28, textAlign: 'left' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        style={{
                            width: '100%', padding: '10px 14px', border: '1px solid #e2e5ea',
                            borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
                            outline: 'none', transition: 'border-color 0.15s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e5ea'}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: '12px 0', background: '#4f46e5', color: '#fff',
                        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                        fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 3px rgba(79,70,229,0.3)',
                    }}
                >
                    {loading ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
                    {loading ? 'Signing in…' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
