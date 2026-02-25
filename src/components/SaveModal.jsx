import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function SaveModal({ isOpen, onClose, onSave, isSaving, defaultName }) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(defaultName || 'My Invoice');
        }
    }, [isOpen, defaultName]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ width: 400 }}>
                <div className="modal-header">
                    <h3>Save Invoice</h3>
                    <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <form id="save-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Invoice Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Acme Corp - March Retainer"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    </form>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                    <button className="btn btn-ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
                    <button form="save-form" type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? <span className="spin">⏳</span> : <Save size={15} />}
                        {isSaving ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
}
