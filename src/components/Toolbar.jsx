import React from 'react';
import {
    FileText, Bold, Italic, Underline,
    Printer, Download, Loader2, Paintbrush,
    Save, FolderOpen, FilePlus, LogOut, Check,
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
    onSave,
    isSaving,
    saveStatus,
    onLoad,
    onNew,
    onLogout,
    currentInvoiceId,
}) {
    const execCmd = (cmd) => {
        document.execCommand(cmd, false, null);
    };

    return (
        <header className="toolbar no-print">
            <div className="toolbar-left">
                {/* Brand */}
                <div className="toolbar-brand">
                    <img src="/logo.svg" alt="ProInvoice Logo" style={{ width: 20, height: 20, borderRadius: 4 }} />
                    <span>ProInvoice</span>
                </div>

                <div className="toolbar-divider" />

                {/* Format Buttons */}
                <div className="toolbar-format-group">
                    <button
                        className="toolbar-format-btn"
                        onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
                        title="Bold"
                    >
                        <Bold size={15} />
                    </button>
                    <button
                        className="toolbar-format-btn"
                        onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
                        title="Italic"
                    >
                        <Italic size={15} />
                    </button>
                    <button
                        className="toolbar-format-btn"
                        onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
                        title="Underline"
                    >
                        <Underline size={15} />
                    </button>
                </div>

                <div className="toolbar-divider" />

                {/* File Actions */}
                <button className="btn-icon" onClick={onNew} title="New invoice">
                    <FilePlus size={16} />
                </button>
                <button className="btn-icon" onClick={onLoad} title="Open saved invoices">
                    <FolderOpen size={16} />
                </button>
                <button
                    className="btn-icon"
                    onClick={onSave}
                    title={currentInvoiceId ? 'Update invoice' : 'Save invoice'}
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
                    title="Design settings"
                >
                    <Paintbrush size={16} />
                </button>

                <div className="toolbar-divider" />

                {/* Print */}
                <button className="btn btn-ghost" onClick={onPrint}>
                    <Printer size={15} />
                    Print
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
                <button className="btn-icon" onClick={onLogout} title="Sign out">
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
