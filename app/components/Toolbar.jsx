'use client';
import React from 'react';
import {
    Bold, Italic, Underline,
    Printer, Download, Loader2, Paintbrush,
    Save, LogOut, Check, Mail, ArrowLeft,
} from 'lucide-react';

/**
 * Toolbar — top bar with back button, formatting, save, and action buttons.
 */
export default function Toolbar({
    isDesignPanelOpen,
    onToggleDesignPanel,
    onPrint,
    onDownloadPDF,
    isGeneratingPdf,
    onEmail,
    onSave,
    isSaving,
    saveStatus,
    onLogout,
    isDirty,
    onBack,
    invoiceMonth,
}) {
    const execCmd = (cmd) => {
        document.execCommand(cmd, false, null);
    };

    return (
        <header className="toolbar no-print">
            <div className="toolbar-left">
                {/* Back button */}
                <button
                    className="btn-icon"
                    onClick={onBack}
                    data-tooltip="Back to dashboard"
                    style={{ marginRight: 8 }}
                >
                    <ArrowLeft size={16} />
                </button>

                {/* Brand + month indicator */}
                <div className="toolbar-brand" style={{ gap: 10 }}>
                    <img src="/ysm-logo.png" alt="YSM" style={{ height: 18, objectFit: 'contain' }} />
                    {invoiceMonth && (
                        <>
                            <div style={{ width: 1, height: 16, background: '#e5e7eb' }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
                                {invoiceMonth} Invoice
                            </span>
                        </>
                    )}
                </div>

                {isDirty && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: 20, border: '1px solid #fef3c7', fontWeight: 600, marginLeft: 12 }}>
                        <div style={{ width: 6, height: 6, background: '#f59e0b', borderRadius: '50%' }} />
                        Unsaved
                    </div>
                )}

                <div className="toolbar-divider" />

                {/* Format Buttons */}
                <div className="toolbar-format-group">
                    <button className="toolbar-format-btn" onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} data-tooltip="Bold">
                        <Bold size={15} />
                    </button>
                    <button className="toolbar-format-btn" onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} data-tooltip="Italic">
                        <Italic size={15} />
                    </button>
                    <button className="toolbar-format-btn" onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} data-tooltip="Underline">
                        <Underline size={15} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                {/* Save Button */}
                <button
                    className="btn btn-primary"
                    onClick={onSave}
                    disabled={isSaving}
                    style={{ padding: '6px 14px', fontSize: 12 }}
                >
                    {isSaving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving…' : 'Save'}
                </button>
                {saveStatus && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> {saveStatus}
                    </span>
                )}
            </div>

            <div className="toolbar-right">
                {/* Design Panel Toggle */}
                <button
                    className={`btn-icon ${isDesignPanelOpen ? 'active' : ''}`}
                    onClick={onToggleDesignPanel}
                    data-tooltip="Design settings"
                >
                    <Paintbrush size={16} />
                </button>

                <div className="toolbar-divider" />

                {/* Print */}
                <button className="btn btn-ghost" onClick={onPrint} data-tooltip="Print">
                    <Printer size={15} />
                    Print
                </button>

                {/* Email */}
                <button className="btn btn-ghost" onClick={isGeneratingPdf ? undefined : onEmail} data-tooltip="Send via Email">
                    <Mail size={15} />
                    Email
                </button>

                {/* Download PDF */}
                <button className="btn btn-primary" onClick={onDownloadPDF} disabled={isGeneratingPdf}>
                    {isGeneratingPdf ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                    {isGeneratingPdf ? 'Generating…' : 'Download PDF'}
                </button>

                <div className="toolbar-divider" />

                {/* Logout */}
                <button className="btn-icon" onClick={onLogout} data-tooltip="Sign out">
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
