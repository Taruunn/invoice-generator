'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, FilePlus } from 'lucide-react';

/**
 * SaveModal — shows two options when an invoice is loaded:
 *   1. "Save" — direct update (no name prompt)
 *   2. "Save as New" — prompts for a name, creates a new invoice
 *
 * When no invoice is loaded, goes straight to the name prompt.
 */
export default function SaveModal({ isOpen, onClose, onSave, onSaveAsNew, isSaving, defaultName, hasExistingInvoice }) {
    const [name, setName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(defaultName || 'My Invoice');
            // If no existing invoice, go straight to name input
            setShowNameInput(!hasExistingInvoice);
        }
    }, [isOpen, defaultName, hasExistingInvoice]);

    if (!isOpen) return null;

    const handleSaveAsNew = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSaveAsNew(name.trim());
        }
    };

    // Choice screen — shown when an existing invoice is loaded
    if (hasExistingInvoice && !showNameInput) {
        return (
            <div className="modal-overlay">
                <div className="modal" style={{ width: 380 }}>
                    <div className="modal-header">
                        <h3>Save Invoice</h3>
                        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                    </div>
                    <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Save (update existing) */}
                        <button
                            className="btn btn-primary"
                            onClick={() => { onSave(); }}
                            disabled={isSaving}
                            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14 }}
                        >
                            {isSaving ? <span className="spin">⏳</span> : <Save size={16} />}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>
                            Updates the current invoice
                        </div>

                        <div style={{ width: '100%', height: 1, background: '#f3f4f6', margin: '4px 0' }} />

                        {/* Save as New */}
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowNameInput(true)}
                            disabled={isSaving}
                            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14 }}
                        >
                            <FilePlus size={16} />
                            Save as New
                        </button>
                        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>
                            Creates a new copy with a new name
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Name input screen — for "Save as New" or new invoices
    return (
        <div className="modal-overlay">
            <div className="modal" style={{ width: 400 }}>
                <div className="modal-header">
                    <h3>{hasExistingInvoice ? 'Save as New Invoice' : 'Save Invoice'}</h3>
                    <button className="btn-icon" onClick={() => {
                        if (hasExistingInvoice) {
                            setShowNameInput(false);
                        } else {
                            onClose();
                        }
                    }}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <form id="save-form" onSubmit={handleSaveAsNew} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                    <button className="btn btn-ghost" onClick={() => {
                        if (hasExistingInvoice) {
                            setShowNameInput(false);
                        } else {
                            onClose();
                        }
                    }} disabled={isSaving}>
                        {hasExistingInvoice ? 'Back' : 'Cancel'}
                    </button>
                    <button form="save-form" type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? <span className="spin">⏳</span> : <FilePlus size={15} />}
                        {isSaving ? 'Saving...' : 'Save as New'}
                    </button>
                </div>
            </div>
        </div>
    );
}
