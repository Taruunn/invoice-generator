import React from 'react';
import {
    FileText, Bold, Italic, Underline,
    Printer, Download, Loader2, Paintbrush,
    Save, FolderOpen, FilePlus, LogOut, Check, Mail,
} from 'lucide-react';

/**
 * Toolbar — top app bar with branding, text formatting, save/load, and action buttons.
 */
export default function Toolbar({
    isDesignPanelOpen,
    onToggleDesignPanel,
    onPrint,
    onDownloadPDF,
    isGeneratingPdf,
    onEmailClick,
    onSave,
    isSaving,
    saveStatus,
    onLoad,
    onNew,
    onLogout,
    currentInvoiceId,
    isDirty
}) {
    const execCmd = (cmd) => {
        document.execCommand(cmd, false, null);
    };

    return (
        <header className="toolbar no-print">
            <div className="toolbar-left">
                {/* Brand */}
                <div className="toolbar-brand" style={{ gap: 10 }}>
                    <img src="/ysm-logo.png" alt="YourStoreMatters" style={{ height: 18, objectFit: 'contain' }} />
                    <div style={{ width: 1, height: 16, background: '#e5e7eb' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#4b5563' }}>Invoice Generator</span>
                </div>
                {isDirty && (
                    <div className="dirty-indicator" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: 20, border: '1px solid #fef3c7', fontWeight: 600, marginLeft: 16 }}>
                        <div style={{ width: 6, height: 6, background: '#f59e0b', borderRadius: '50%' }}></div>
                        Unsaved changes
                    </div>
                )}
                <div className="toolbar-divider" />

                {/* Format Buttons */}
                <div className="toolbar-format-group">
                    <button
                        className="toolbar-format-btn"
                        onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
                        data-tooltip="Bold"
                    >
                        <Bold size={15} />
                    </button>
                    <button
                        className="toolbar-format-btn"
                        onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
                        data-tooltip="Italic"
                    >
                        <Italic size={15} />
                    </button>
                    <button
                        className="toolbar-format-btn"
                        onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
                        data-tooltip="Underline"
                    >
                        <Underline size={15} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                {/* File Actions */}
                <button className="btn-icon" onClick={onNew} data-tooltip="New invoice">
                    <FilePlus size={16} />
                </button>
                <button className="btn-icon" onClick={onLoad} data-tooltip="Open saved invoices">
                    <FolderOpen size={16} />
                </button>
                <button
                    className="btn-icon"
                    onClick={onSave}
                    data-tooltip={currentInvoiceId ? 'Update invoice' : 'Save invoice'}
                    style={isSaving ? { opacity: 0.6, pointerEvents: 'none' } : {}}
                >
                    {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                </button>
                {saveStatus && (
                    <span style={{
                        fontSize: 12, fontWeight: 600, color: '#10b981',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
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
                <button className="btn btn-ghost" onClick={onPrint} data-tooltip="Print invoice">
                    <Printer size={15} />
                    Print
                </button>

                {/* Send Email */}
                <button className="btn btn-ghost" onClick={isGeneratingPdf ? undefined : onEmailClick} data-tooltip="Send via Email">
                    <Mail size={15} />
                    Email
                </button>

                {/* Download PDF */}
                <button
                    className="btn btn-primary"
                    onClick={onDownloadPDF}
                    disabled={isGeneratingPdf}
                >
                    {isGeneratingPdf ? (
                        <Loader2 size={15} className="spin" />
                    ) : (
                        <Download size={15} />
                    )}
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
