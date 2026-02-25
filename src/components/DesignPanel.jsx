import React from 'react';
import { X, Check } from 'lucide-react';

const TEMPLATE_INFO = [
    { id: 'template1', name: 'Classic', desc: 'Clean & minimal' },
    { id: 'template2', name: 'Typewriter', desc: 'Monospace & retro' },
];

const COLORS = [
    '#0f172a', '#2563eb', '#16a34a', '#dc2626',
    '#9333ea', '#ea580c', '#0d9488', '#be185d',
];

const FONTS = [
    { value: 'font-inter', label: 'Inter', style: 'Modern Sans' },
    { value: 'font-roboto', label: 'Roboto', style: 'Classic Sans' },
    { value: 'font-space', label: 'Space Grotesk', style: 'Tech' },
    { value: 'font-merriweather', label: 'Merriweather', style: 'Classic Serif' },
    { value: 'font-playfair', label: 'Playfair Display', style: 'Premium Serif' },
];

/* Mini Template Previews */
const TemplateMiniPreview = ({ id, color }) => {
    const previews = {
        template1: (
            <div className="mini-preview" style={{ padding: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                        <div className="mini-line long" style={{ width: '60%', height: 4, background: '#333' }} />
                        <div className="mini-line short" style={{ width: '40%', marginTop: 3 }} />
                    </div>
                    <div className="mini-line" style={{ width: '30%', height: 6, background: color, opacity: 0.3 }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ borderTop: '1.5px solid #333', marginTop: 4, paddingTop: 4 }}>
                        <div className="mini-line long" />
                        <div className="mini-line medium" />
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #eee', marginTop: 'auto', paddingTop: 4, display: 'flex', gap: 4 }}>
                    <div className="mini-line" style={{ width: '45%' }} />
                    <div className="mini-line" style={{ width: '45%' }} />
                </div>
            </div>
        ),
        template2: (
            <div className="mini-preview" style={{ background: '#f5f5f0', padding: 8 }}>
                {/* Big title */}
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                    <div className="mini-line" style={{ width: '50%', height: 5, background: '#1a1a1a', margin: '0 auto' }} />
                </div>
                {/* Bordered info box */}
                <div style={{ border: '1px solid #1a1a1a', display: 'flex', marginBottom: 6, height: 14 }}>
                    <div style={{ flex: 1, borderRight: '1px solid #1a1a1a', padding: 2 }}>
                        <div className="mini-line" style={{ width: '70%', height: 2 }} />
                    </div>
                    <div style={{ flex: 1, padding: 2 }}>
                        <div className="mini-line" style={{ width: '60%', height: 2, marginLeft: 'auto' }} />
                    </div>
                </div>
                {/* Table lines */}
                <div style={{ borderTop: '1.5px solid #1a1a1a', borderBottom: '1px solid #ccc', paddingTop: 3, paddingBottom: 3, marginBottom: 3 }}>
                    <div className="mini-line long" style={{ height: 2 }} />
                </div>
                <div style={{ borderBottom: '1px solid #ccc', paddingBottom: 3, marginBottom: 3 }}>
                    <div className="mini-line medium" style={{ height: 2 }} />
                </div>
                {/* Total */}
                <div style={{ borderTop: '2px solid #1a1a1a', marginTop: 4, paddingTop: 3 }}>
                    <div className="mini-line short" style={{ height: 3, background: '#1a1a1a', marginLeft: 'auto' }} />
                </div>
            </div>
        ),
    };
    return previews[id] || null;
};

/**
 * DesignPanel — floating slide-out panel with template / font / color controls.
 */
export default function DesignPanel({ settings, onUpdate, onClose }) {
    return (
        <>
            <div className="design-panel-overlay" onClick={onClose} />
            <aside className="design-panel">
                <div className="design-panel-header">
                    <h2>Design Settings</h2>
                    <button className="design-panel-close" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <div className="design-panel-body">
                    {/* Template Picker */}
                    <div className="design-section">
                        <div className="design-section-label">Template</div>
                        <div className="template-grid">
                            {TEMPLATE_INFO.map((t) => (
                                <button
                                    key={t.id}
                                    className={`template-card ${settings.template === t.id ? 'active' : ''}`}
                                    onClick={() => onUpdate({ template: t.id })}
                                >
                                    {settings.template === t.id && (
                                        <div className="template-card-check">
                                            <Check size={12} />
                                        </div>
                                    )}
                                    <div className="template-card-preview">
                                        <TemplateMiniPreview id={t.id} color={settings.color} />
                                    </div>
                                    <div className="template-card-label">{t.name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 1 }}>{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Picker — only shown for Classic template */}
                    {settings.template === 'template1' && (
                        <div className="design-section">
                            <div className="design-section-label">Font Family</div>
                            <select
                                className="font-select"
                                value={settings.font}
                                onChange={(e) => onUpdate({ font: e.target.value })}
                            >
                                {FONTS.map((f) => (
                                    <option key={f.value} value={f.value}>
                                        {f.label} — {f.style}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {settings.template === 'template2' && (
                        <div className="design-section">
                            <div className="design-section-label">Font</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', padding: '8px 0' }}>
                                Typewriter template uses Courier New (monospace) — font selection is disabled for this template.
                            </div>
                        </div>
                    )}

                    {/* Color Picker */}
                    <div className="design-section">
                        <div className="design-section-label">Theme Color</div>
                        <div className="color-palette">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    className={`color-swatch ${settings.color === c ? 'active' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => onUpdate({ color: c })}
                                    title={c}
                                />
                            ))}
                            <input
                                type="color"
                                className="color-custom"
                                value={settings.color}
                                onChange={(e) => onUpdate({ color: e.target.value })}
                                title="Custom color"
                            />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
