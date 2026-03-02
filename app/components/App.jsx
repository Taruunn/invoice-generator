'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Plus, Trash2, ZoomIn, ZoomOut,
    Save, ArrowLeft, Loader2,
} from 'lucide-react';
import Toolbar from './Toolbar';
import DesignPanel from './DesignPanel';
import LoginScreen from './LoginScreen';
import EmailModal from './EmailModal';
import Dashboard from './Dashboard';
import Toast, { showToast } from './Toast';
import Template1 from './templates/Template1';
import Template2 from './templates/Template2';

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

// --- Helpers ---
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function toISODate(date) {
    return date.toISOString().split('T')[0];
}

function getInvoiceFilename(senderName, invoiceNo) {
    const cleanName = (senderName || 'Invoice')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, '');
    const paddedNo = String(invoiceNo || 1).padStart(2, '0');
    return `${cleanName}_INV_${paddedNo}.pdf`;
}

function buildDefaultData(monthNum) {
    const year = new Date().getFullYear();
    const currentMonth = MONTH_NAMES[monthNum - 1];

    // Invoice date = 1st of month, Due = last day of month
    const invoiceDate = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);

    return {
        senderName: 'Tarun Kumar',
        tradeName: '(Trade Name: Dorahi)',
        senderAddress:
            'Plot No. 06, 219, Gelda Colony, Uttari Sunderwas<br> Udaipur, Rajasthan 313001, India',
        senderGst: '<b>GST: 08HQAPK7073Q1Z1</b>',
        senderPan: '<b>PAN:</b> HQAPK7073Q',
        senderEmail: `<b>EMAIL:</b> ${process.env.NEXT_PUBLIC_SENDER_EMAIL || ''}`,

        billToLabel: 'BILL TO',
        receiverName: 'GM Commerce Group S.R.L.',
        receiverAddress: 'Via Garigliano 9/A, 70022 Altamura (BA), Italy',
        receiverVat: '<b>VAT:</b> IT09143370725',

        invoiceTitle: 'INVOICE',
        invoiceNoLabel: '#',
        invoiceNo: String(monthNum),
        dateLabel: 'Date:',
        invoiceDate: toISODate(invoiceDate),
        dueDateLabel: 'Due Date:',
        dueDate: toISODate(lastDay),
        currency: '$',

        items: [
            {
                id: 1,
                desc: `Shopify development and technical services<br/><br/><i>Monthly Retainer (${currentMonth} ${year})</i>`,
                qty: 1,
                rate: 2300,
            },
        ],

        subtotalLabel: 'Subtotal',
        taxLabel: 'IGST (0%)',
        taxAmount: 0.0,
        totalLabel: 'Total',

        notesTitle: 'Payment details',
        notesContent:
            '<b>Name:</b> Tarun Kumar<br/><b>A/C:</b> 77016018913<br/><b>Bank Name:</b> Standard Chartered<br/><b>Branch/City:</b> Jodhpur<br/><b>IFSC:</b> SCBL0036097<br/><b>SWIFT:</b> SCBLINBBDEL',

        termsTitle: 'Terms',
        termsContent:
            'Export of services, IGST is zero-rated as per LUT (India).<br/>B2B services - place of supply: Italy<br/>LUT Application Reference Number - AD0812250138157 dated 22/12/2025',
    };
}

export default function App() {
    // --- Auth ---
    const [authToken, setAuthToken] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // --- View state: 'dashboard' or 'editor' ---
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear] = useState(new Date().getFullYear());

    // Check sessionStorage on mount
    useEffect(() => {
        const token = sessionStorage.getItem('auth_token');
        if (!token) {
            setAuthToken(null);
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

    // --- Dashboard state ---
    const [dashboardInvoices, setDashboardInvoices] = useState([]);
    const [isDashboardLoading, setIsDashboardLoading] = useState(false);

    // Fetch invoices for dashboard
    const fetchDashboardInvoices = useCallback(async () => {
        setIsDashboardLoading(true);
        try {
            const res = await apiCall(`/api/invoices?year=${selectedYear}`);
            if (res.ok) {
                const list = await res.json();
                setDashboardInvoices(list);
            }
        } catch (err) {
            console.error('Failed to fetch invoices');
        } finally {
            setIsDashboardLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        if (authToken && currentView === 'dashboard') {
            fetchDashboardInvoices();
        }
    }, [authToken, currentView, fetchDashboardInvoices]);

    // --- UI State ---
    const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    // Email modal state
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Current invoice tracking
    const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

    // --- Settings ---
    const [settings, setSettings] = useState({
        template: 'template1',
        font: 'font-inter',
        color: '#0f172a',
    });

    // --- Invoice Data ---
    const [data, setData] = useState(buildDefaultData(new Date().getMonth() + 1));

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

    useEffect(() => {
        setIsDirty(true);
    }, [data]);

    const updateSettings = useCallback((updates) => {
        setSettings((prev) => ({ ...prev, ...updates }));
        setIsDirty(true);
    }, []);

    // --- Dashboard Actions ---
    const handleCreateInvoice = (monthNum) => {
        setSelectedMonth(monthNum);
        setData(buildDefaultData(monthNum));
        setSettings({ template: 'template1', font: 'font-inter', color: '#0f172a' });
        setCurrentInvoiceId(null);
        setIsDirty(false);
        setCurrentView('editor');
    };

    const handleViewInvoice = async (invoice) => {
        setSelectedMonth(invoice.month);
        try {
            const res = await apiCall(`/api/invoices/${invoice.id}`);
            if (res.ok) {
                const full = await res.json();
                setData(full.data);
                setSettings(full.settings || { template: 'template1', font: 'font-inter', color: '#0f172a' });
                setCurrentInvoiceId(invoice.id);
                setIsDirty(false);
                setCurrentView('editor');
            }
        } catch (err) {
            showToast('Failed to load invoice', 'error');
        }
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
    };

    // --- Save Invoice (one-click upsert) ---
    const saveInvoice = async () => {
        if (!selectedMonth || !selectedYear) return;
        setIsSaving(true);
        setSaveStatus('');
        try {
            const name = getInvoiceFilename(data.senderName, data.invoiceNo).replace('.pdf', '');
            const res = await apiCall('/api/invoices', {
                method: 'POST',
                body: JSON.stringify({
                    month: selectedMonth,
                    year: selectedYear,
                    name,
                    data,
                    settings,
                }),
            });
            if (res.ok) {
                const result = await res.json();
                setCurrentInvoiceId(result.id);
                setIsDirty(false);
                showToast('Invoice saved!');
                setCurrentView('dashboard');
            } else {
                showToast('Error saving invoice', 'error');
            }
        } catch (err) {
            showToast('Error saving invoice', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Computed ---
    const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
    const total = subtotal + (parseFloat(data.taxAmount) || 0);
    const TemplateComponent = TEMPLATES[settings.template] || Template1;

    // --- Zoom ---
    const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
    const handleZoomReset = () => setZoom(100);

    // --- Print ---
    const printInvoice = useCallback(() => {
        window.print();
    }, []);

    // --- Download PDF ---
    const downloadPDF = useCallback(() => {
        setIsGeneratingPdf(true);
        const element = document.getElementById('invoice-preview');

        const generate = () => {
            const opt = {
                margin: 0,
                filename: getInvoiceFilename(data.senderName, data.invoiceNo),
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
                .save()
                .then(() => {
                    setIsGeneratingPdf(false);
                })
                .catch((err) => {
                    console.error('PDF error', err);
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
    }, [data.invoiceNo, data.senderName]);

    // --- Email PDF ---
    const handleEmailClick = () => {
        setIsEmailModalOpen(true);
    };

    const handleEmailSend = async (emailData) => {
        setIsSendingEmail(true);
        const element = document.getElementById('invoice-preview');

        const sendRequest = async (base64String) => {
            try {
                const base64Data = base64String.split('base64,')[1] || base64String;

                const res = await apiCall('/api/email', {
                    method: 'POST',
                    body: JSON.stringify({
                        toEmail: emailData.toEmail,
                        subject: emailData.subject,
                        message: emailData.message,
                        pdfBase64: base64Data,
                        fromEmail: emailData.fromEmail,
                    }),
                });

                if (res.ok) {
                    setIsEmailModalOpen(false);
                    showToast('Email sent successfully!');
                } else {
                    const errStr = await res.text();
                    showToast(`Failed to send email`, 'error');
                }
            } catch (err) {
                console.error('Email send failed', err);
                showToast('An error occurred while sending email', 'error');
            } finally {
                setIsSendingEmail(false);
            }
        };

        const generateAndSend = () => {
            const opt = {
                margin: 0,
                filename: getInvoiceFilename(data.senderName, data.invoiceNo),
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
                    showToast('Failed to generate PDF', 'error');
                    setIsSendingEmail(false);
                });
        };

        if (window.html2pdf) {
            generateAndSend();
        } else {
            const script = document.createElement('script');
            script.src =
                'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = generateAndSend;
            script.onerror = () => {
                showToast('Failed to load PDF library', 'error');
                setIsSendingEmail(false);
            };
            document.head.appendChild(script);
        }
    };

    // --- Loading screen ---
    if (isCheckingAuth) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            }}>
                <Loader2 size={32} className="spin" style={{ color: '#818cf8' }} />
            </div>
        );
    }

    if (!authToken) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // --- DASHBOARD VIEW ---
    if (currentView === 'dashboard') {
        return (
            <>
                <Dashboard
                    invoices={dashboardInvoices}
                    onCreateInvoice={handleCreateInvoice}
                    onViewInvoice={handleViewInvoice}
                    isLoading={isDashboardLoading}
                />
                <Toast />
            </>
        );
    }

    // --- EDITOR VIEW ---
    const invoiceMonthName = selectedMonth ? MONTH_NAMES[selectedMonth - 1] : '';

    return (
        <div className="app-layout">
            {/* Toolbar — with back button and save */}
            <Toolbar
                settings={settings}
                onToggleDesignPanel={() => setIsDesignPanelOpen((v) => !v)}
                onDownloadPDF={downloadPDF}
                onPrint={printInvoice}
                onEmail={handleEmailClick}
                onLogout={handleLogout}
                isGeneratingPdf={isGeneratingPdf}
                saveStatus={saveStatus}
                isDirty={isDirty}
                onSave={saveInvoice}
                onBack={handleBackToDashboard}
                isSaving={isSaving}
                invoiceMonth={invoiceMonthName}
            />

            <div className="canvas-area">
                <div className="invoice-preview-container" style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                }}>
                    <div
                        id="invoice-preview"
                        className="invoice-preview"
                        style={{
                            fontFamily: FONT_MAP[settings.font] || FONT_MAP['font-inter'],
                            '--accent': settings.color,
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

                    {/* Add/Remove controls */}
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

            {/* Design Panel */}
            {isDesignPanelOpen && (
                <DesignPanel
                    settings={settings}
                    onUpdate={updateSettings}
                    onClose={() => setIsDesignPanelOpen(false)}
                />
            )}

            {/* Email Modal */}
            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => !isSendingEmail && setIsEmailModalOpen(false)}
                onSend={handleEmailSend}
                isSending={isSendingEmail}
                senderEmail={process.env.NEXT_PUBLIC_SENDER_EMAIL || ''}
                invoiceSubject={(() => {
                    const cleanName = (data.senderName || '').replace(/<[^>]*>/g, '');
                    const paddedNo = String(data.invoiceNo || 1).padStart(2, '0');
                    return `${cleanName} – Invoice #${paddedNo} – ${invoiceMonthName} ${selectedYear}`;
                })()}
                attachmentName={getInvoiceFilename(data.senderName, data.invoiceNo)}
                invoiceMonth={invoiceMonthName}
            />

            <Toast />
        </div>
    );
}
