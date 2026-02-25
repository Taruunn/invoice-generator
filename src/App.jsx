import React, { useState, useCallback, useEffect } from 'react';
import {
    Plus, Trash2, ZoomIn, ZoomOut,
    Save, FolderOpen, FilePlus, Loader2,
} from 'lucide-react';
import Toolbar from './components/Toolbar.jsx';
import DesignPanel from './components/DesignPanel.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import EmailModal from './components/EmailModal.jsx';
import SaveModal from './components/SaveModal.jsx';
import Template1 from './templates/Template1.jsx';
import Template2 from './templates/Template2.jsx';

// --- Font mapping ---
const FONT_MAP = {
    'font-inter': '"Inter", sans-serif',
    'font-roboto': '"Roboto", sans-serif',
    'font-merriweather': '"Merriweather", serif',
    'font-playfair': '"Playfair Display", serif',
    'font-space': '"Space Grotesk", sans-serif',
};

const TEMPLATES = {
    template1: Template1,
    template2: Template2,
};

// --- API Helper ---
function apiCall(url, options = {}) {
    const token = sessionStorage.getItem('auth_token');
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}

// --- Default Data ---
const DEFAULT_DATA = {
    senderName: 'Tarun Kumar',
    tradeName: '(Trade Name: Dorahi)',
    senderAddress:
        'Plot No. 06, 219, Gelda Colony, Uttari Sundrwas, Rajasthan, 313001, India',
    senderGst: '<b>GST:</b> 08HQAPK7073Q1Z1',
    senderPan: '<b>PAN:</b> HQAPK7073Q',
    senderEmail: '<b>EMAIL:</b> juno.gogle@gmail.com',

    billToLabel: 'BILL TO',
    receiverName: 'GM Commerce Group S.R.L.',
    receiverAddress: 'Via Garigliano 9/A, Altamura (BA), Italy',
    receiverVat: '<b>VAT:</b> IT09143370725',

    invoiceTitle: 'INVOICE',
    invoiceNoLabel: '#',
    invoiceNo: '1',
    dateLabel: 'Date:',
    invoiceDate: 'Feb 24, 2026',
    dueDateLabel: 'Due Date:',
    dueDate: 'Feb 28, 2026',
    currency: '$',

    items: [
        {
            id: 1,
            desc: 'Shopify development and technical services<br/><br/><i>Monthly Retainer (January 2026)</i>',
            qty: 1,
            rate: 667.0,
        },
    ],

    subtotalLabel: 'Subtotal',
    taxLabel: 'IGST (0%)',
    taxAmount: 0.0,
    totalLabel: 'Total',

    notesTitle: 'NOTES',
    notesContent:
        '<b>Name:</b> Tarun Kumar<br/><b>A/C:</b> 77016018913<br/><b>Bank Name:</b> Standard Chartered<br/><b>Branch/City:</b> Jodhpur<br/><b>IFSC:</b> SCBL0036097<br/><b>SWIFT:</b> SCBLINBBDEL',

    termsTitle: 'TERMS',
    termsContent:
        'Export of services, IGST is zero-rated as per LUT (India).<br/>B2B services - place of supply: Italy<br/>LUT Application Reference Number - AD0812250138157 dated 22/12/2025',
};

export default function App() {
    // --- Auth ---
    const [authToken, setAuthToken] = useState(
        sessionStorage.getItem('auth_token')
    );
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Verify existing token on mount
    useEffect(() => {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
            setIsCheckingAuth(false);
            return;
        }
        fetch('/api/verify', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.ok) {
                    setAuthToken(token);
                } else {
                    sessionStorage.removeItem('auth_token');
                    setAuthToken(null);
                }
            })
            .catch(() => {
                // If server isn't reachable (local dev without vercel dev), allow through
                setAuthToken(token);
            })
            .finally(() => setIsCheckingAuth(false));
    }, []);

    const handleLogin = (token) => {
        setAuthToken(token);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('auth_token');
        setAuthToken(null);
    };

    // --- UI State ---
    const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [showInvoiceList, setShowInvoiceList] = useState(false);
    const [invoiceList, setInvoiceList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);

    // --- Email State ---
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // --- Save State ---
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
    const [currentInvoiceName, setCurrentInvoiceName] = useState('');

    // --- Settings ---
    const [settings, setSettings] = useState({
        template: 'template1',
        font: 'font-inter',
        color: '#0f172a',
    });

    // --- Invoice Data ---
    const [data, setData] = useState({ ...DEFAULT_DATA });

    // --- Actions ---
    const handleUpdate = useCallback((field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleItemUpdate = useCallback((id, field, value) => {
        setData((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    }, []);

    const addItem = useCallback(() => {
        setData((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                { id: Date.now(), desc: 'New Item', qty: 1, rate: 0 },
            ],
        }));
    }, []);

    const removeItem = useCallback((id) => {
        setData((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
        }));
    }, []);

    const formatCurrency = useCallback(
        (amount) => `${data.currency}${parseFloat(amount).toFixed(2)}`,
        [data.currency]
    );

    const updateSettings = useCallback((updates) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    }, []);

    // --- Save Invoice ---
    const handleSaveClick = () => {
        setIsSaveModalOpen(true);
    };

    const saveInvoice = async (name) => {
        setIsSaving(true);
        setSaveStatus('');
        try {
            if (currentInvoiceId) {
                // Update existing
                const res = await apiCall(`/api/invoices/${currentInvoiceId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name, data, settings }),
                });
                if (res.ok) {
                    setSaveStatus('Saved!');
                    setCurrentInvoiceName(name);
                    setIsSaveModalOpen(false);
                    // Refresh list if it's currently loaded
                    if (invoiceList.length > 0) loadInvoiceList();
                } else setSaveStatus('Error saving');
            } else {
                // Create new
                const res = await apiCall('/api/invoices', {
                    method: 'POST',
                    body: JSON.stringify({ name, data, settings }),
                });
                if (res.ok) {
                    const result = await res.json();
                    setCurrentInvoiceId(result.id);
                    setCurrentInvoiceName(name);
                    setSaveStatus('Saved!');
                    setIsSaveModalOpen(false);
                } else {
                    setSaveStatus('Error saving');
                }
            }
        } catch (err) {
            setSaveStatus('Error saving');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    // --- Load Invoices List ---
    const loadInvoiceList = async () => {
        setLoadingList(true);
        setShowInvoiceList(true);
        try {
            const res = await apiCall('/api/invoices');
            if (res.ok) {
                const list = await res.json();
                setInvoiceList(list);
            }
        } catch (err) {
            console.error('Failed to load invoices');
        } finally {
            setLoadingList(false);
        }
    };

    // --- Load Single Invoice ---
    const loadInvoice = async (id, nameStr) => {
        try {
            const res = await apiCall(`/api/invoices/${id}`);
            if (res.ok) {
                const invoice = await res.json();
                setData(invoice.data);
                setSettings(invoice.settings || { template: 'template1', font: 'font-inter', color: '#0f172a' });
                setCurrentInvoiceId(id);
                setCurrentInvoiceName(nameStr || invoice.name || '');
                setShowInvoiceList(false);
            }
        } catch (err) {
            console.error('Failed to load invoice');
        }
    };

    // --- Delete Invoice ---
    const deleteInvoice = async (id) => {
        try {
            await apiCall(`/api/invoices/${id}`, { method: 'DELETE' });
            setInvoiceList((prev) => prev.filter((inv) => inv.id !== id));
            if (currentInvoiceId === id) {
                setCurrentInvoiceId(null);
            }
        } catch (err) {
            console.error('Failed to delete invoice');
        }
    };

    // --- New Invoice ---
    const newInvoice = () => {
        setData({ ...DEFAULT_DATA, invoiceNo: String(Date.now()).slice(-4) });
        setSettings({ template: 'template1', font: 'font-inter', color: '#0f172a' });
        setCurrentInvoiceId(null);
        setCurrentInvoiceName('');
    };

    // --- Print ---
    const printInvoice = useCallback(() => {
        window.print();
    }, []);

    // --- Download PDF (fixed: single page) ---
    const downloadPDF = useCallback(() => {
        setIsGeneratingPdf(true);
        const element = document.getElementById('invoice-preview');

        const generate = () => {
            const opt = {
                margin: 0,
                filename: `Invoice_${data.invoiceNo || 'draft'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    height: element.scrollHeight,
                    windowHeight: element.scrollHeight,
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            window
                .html2pdf()
                .set(opt)
                .from(element)
                .save()
                .then(() => setIsGeneratingPdf(false))
                .catch((err) => {
                    console.error('PDF generation failed', err);
                    setIsGeneratingPdf(false);
                });
        };

        if (window.html2pdf) {
            generate();
        } else {
            const script = document.createElement('script');
            script.src =
                'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = generate;
            script.onerror = () => {
                console.error('Failed to load html2pdf');
                setIsGeneratingPdf(false);
            };
            document.head.appendChild(script);
        }
    }, [data.invoiceNo]);

    // --- Email PDF (Base64) ---
    const handleEmailClick = () => {
        setIsEmailModalOpen(true);
    };

    const handleEmailSend = async (emailData) => {
        setIsSendingEmail(true);
        const element = document.getElementById('invoice-preview');

        const sendRequest = async (base64String) => {
            try {
                // Strip the exact prefix html2pdf adds (data:application/pdf;filename=generated.pdf;base64,)
                // or safely extract after base64,
                const base64Data = base64String.split('base64,')[1] || base64String;

                const res = await apiCall('/api/email', {
                    method: 'POST',
                    body: JSON.stringify({
                        toEmail: emailData.toEmail,
                        subject: emailData.subject,
                        message: emailData.message,
                        pdfBase64: base64Data,
                    }),
                });

                if (res.ok) {
                    setIsEmailModalOpen(false);
                    alert('Email sent successfully!');
                } else {
                    const errStr = await res.text();
                    alert(`Failed to send email: ${errStr}`);
                }
            } catch (err) {
                console.error('Email send failed', err);
                alert('An error occurred while sending the email.');
            } finally {
                setIsSendingEmail(false);
            }
        };

        const generateAndSend = () => {
            const opt = {
                margin: 0,
                filename: `Invoice_${data.invoiceNo || 'draft'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    height: element.scrollHeight,
                    windowHeight: element.scrollHeight,
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            window.html2pdf()
                .set(opt)
                .from(element)
                .outputPdf('datauristring')
                .then(sendRequest)
                .catch((err) => {
                    console.error('Failed to generate PDF for email', err);
                    alert('Failed to generate PDF');
                    setIsSendingEmail(false);
                });
        };

        if (window.html2pdf) {
            generateAndSend();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = generateAndSend;
            script.onerror = () => {
                alert('Failed to load PDF library');
                setIsSendingEmail(false);
            };
            document.head.appendChild(script);
        }
    };

    // --- Calculations ---
    const subtotal = data.items.reduce(
        (sum, item) => sum + item.qty * item.rate,
        0
    );
    const total = subtotal + parseFloat(data.taxAmount || 0);

    // --- Render ---
    const TemplateComponent = TEMPLATES[settings.template] || Template1;
    const currentFontFamily = FONT_MAP[settings.font];

    const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 150));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
    const handleZoomReset = () => setZoom(100);

    // Auth loading state
    if (isCheckingAuth) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#f0f2f5',
                fontFamily: '"Inter", sans-serif',
            }}>
                <Loader2 size={32} className="spin" style={{ color: '#4f46e5' }} />
            </div>
        );
    }

    // Login gate
    if (!authToken) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="app-shell" style={{ fontFamily: currentFontFamily }}>
            {/* Top Toolbar */}
            <Toolbar
                isDesignPanelOpen={isDesignPanelOpen}
                onToggleDesignPanel={() => setIsDesignPanelOpen((v) => !v)}
                onPrint={printInvoice}
                onDownloadPDF={downloadPDF}
                isGeneratingPdf={isGeneratingPdf}
                onEmailClick={handleEmailClick}
                onSave={handleSaveClick}
                isSaving={isSaving}
                saveStatus={saveStatus}
                onLoad={loadInvoiceList}
                onNew={newInvoice}
                onLogout={handleLogout}
                currentInvoiceId={currentInvoiceId}
            />

            {/* Canvas Area */}
            <div className="canvas-area">
                <div className="invoice-preview-container">
                    <div
                        id="invoice-preview"
                        className="invoice-preview"
                        style={{
                            fontFamily:
                                settings.template === 'template2'
                                    ? '"Courier New", monospace'
                                    : currentFontFamily,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                        }}
                    >
                        <TemplateComponent
                            data={data}
                            settings={settings}
                            formatCurrency={formatCurrency}
                            onUpdate={handleUpdate}
                            onItemUpdate={handleItemUpdate}
                            subtotal={subtotal}
                            total={total}
                        />
                    </div>

                    {/* Add/Remove controls below invoice */}
                    <div
                        className="no-print"
                        style={{
                            padding: '16px 48px',
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                        }}
                    >
                        <button className="add-item-row" onClick={addItem}>
                            <Plus size={14} />
                            Add Line Item
                        </button>
                        {data.items.length > 1 && (
                            <button
                                className="add-item-row"
                                style={{ maxWidth: 180, borderColor: '#fca5a5', color: '#ef4444' }}
                                onClick={() => removeItem(data.items[data.items.length - 1].id)}
                            >
                                <Trash2 size={14} />
                                Remove Last
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="zoom-controls no-print">
                <button className="zoom-btn" onClick={handleZoomOut} title="Zoom out">
                    <ZoomOut size={16} />
                </button>
                <button
                    className="zoom-label"
                    onClick={handleZoomReset}
                    title="Reset zoom"
                    style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    {zoom}%
                </button>
                <button className="zoom-btn" onClick={handleZoomIn} title="Zoom in">
                    <ZoomIn size={16} />
                </button>
            </div>

            {/* Design Panel (Floating) */}
            {isDesignPanelOpen && (
                <DesignPanel
                    settings={settings}
                    onUpdate={updateSettings}
                    onClose={() => setIsDesignPanelOpen(false)}
                />
            )}

            {/* Invoice List Modal */}
            {showInvoiceList && (
                <>
                    <div
                        className="design-panel-overlay"
                        onClick={() => setShowInvoiceList(false)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 480,
                            maxHeight: '70vh',
                            background: '#fff',
                            borderRadius: 16,
                            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                            zIndex: 200,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                                Saved Invoices
                            </h3>
                            <button
                                onClick={() => setShowInvoiceList(false)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    color: '#9ca3af',
                                    fontFamily: 'inherit',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                            {loadingList ? (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: 40,
                                        color: '#9ca3af',
                                    }}
                                >
                                    <Loader2
                                        size={24}
                                        className="spin"
                                        style={{ margin: '0 auto 8px' }}
                                    />
                                    Loading…
                                </div>
                            ) : invoiceList.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: 40,
                                        color: '#9ca3af',
                                        fontSize: 14,
                                    }}
                                >
                                    No saved invoices yet.
                                </div>
                            ) : (
                                invoiceList.map((inv) => (
                                    <div
                                        key={inv.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            borderRadius: 10,
                                            border: '1px solid #f3f4f6',
                                            marginBottom: 8,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            background:
                                                currentInvoiceId === inv.id ? '#eef2ff' : '#fff',
                                        }}
                                        onClick={() => loadInvoice(inv.id, inv.name)}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.borderColor = '#c7d2fe')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.borderColor = '#f3f4f6')
                                        }
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#111',
                                                }}
                                            >
                                                {inv.name}
                                            </div>
                                            <div
                                                style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}
                                            >
                                                {new Date(inv.updated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteInvoice(inv.id);
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#d1d5db',
                                                cursor: 'pointer',
                                                padding: 6,
                                                borderRadius: 6,
                                                transition: 'color 0.15s',
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.color = '#ef4444')
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.color = '#d1d5db')
                                            }
                                            title="Delete invoice"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Email Modal */}
            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => !isSendingEmail && setIsEmailModalOpen(false)}
                onSend={handleEmailSend}
                isSending={isSendingEmail}
            />

            {/* Save Modal */}
            <SaveModal
                isOpen={isSaveModalOpen}
                onClose={() => !isSaving && setIsSaveModalOpen(false)}
                onSave={saveInvoice}
                isSaving={isSaving}
                defaultName={currentInvoiceName || `Invoice #${data.invoiceNo || 'draft'}`}
            />
        </div>
    );
}
