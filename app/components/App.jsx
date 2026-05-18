'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Plus, Trash2, ZoomIn, ZoomOut,
    Loader2,
} from 'lucide-react';
import Toolbar from './Toolbar';
import DesignPanel from './DesignPanel';
import LoginScreen from './LoginScreen';
import EmailModal from './EmailModal';
import Dashboard from './Dashboard';
import Toast, { showToast } from './Toast';
import Template1 from './templates/Template1';
import Template2 from './templates/Template2';
import WorkspacePicker from './WorkspacePicker';
import TarunWorkspaceModal from './TarunWorkspaceModal';
import PrefillModal from './PrefillModal';
import {
    MONTH_NAMES,
    getInvoiceFilename,
    buildDefaultDataForWorkspace,
    mergeInvoicePrefill,
    resolvePrefillForEditor,
} from '../../lib/invoice-defaults';
import { vagmiSequentialInvoiceNo } from '../../lib/vagmi-invoice-index';

const SS_WORKSPACE = 'invoice_workspace';
const SS_TARUN = 'invoice_tarun_token';

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

function apiCall(url, options = {}) {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('auth_token') : null;
    const workspace = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SS_WORKSPACE) : null;
    const tarunTok = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(SS_TARUN) : null;
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(workspace ? { 'X-Workspace': workspace } : {}),
            ...(workspace === 'tarun' && tarunTok ? { 'X-Tarun-Token': tarunTok } : {}),
            ...options.headers,
        },
    });
}

export default function App() {
    const [authToken, setAuthToken] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [workspace, setWorkspace] = useState(null);
    const [tarunModalOpen, setTarunModalOpen] = useState(false);
    const [masterPrefill, setMasterPrefill] = useState({});
    const [prefillModalOpen, setPrefillModalOpen] = useState(false);
    const [isSavingPrefill, setIsSavingPrefill] = useState(false);

    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear] = useState(new Date().getFullYear());

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
                    sessionStorage.removeItem(SS_WORKSPACE);
                    sessionStorage.removeItem(SS_TARUN);
                    setAuthToken(null);
                    setWorkspace(null);
                }
            })
            .catch(() => {
                setAuthToken(token);
            })
            .finally(() => setIsCheckingAuth(false));
    }, []);

    useEffect(() => {
        if (!authToken) return;
        const ws = sessionStorage.getItem(SS_WORKSPACE);
        const tt = sessionStorage.getItem(SS_TARUN);
        if (ws === 'tarun' && !tt) {
            sessionStorage.removeItem(SS_WORKSPACE);
            setWorkspace(null);
            return;
        }
        if (ws === 'vagmi' || ws === 'tarun') {
            setWorkspace(ws);
        }
    }, [authToken]);

    const refreshPrefill = useCallback(async () => {
        try {
            const res = await apiCall('/api/prefill');
            if (res.ok) {
                const j = await res.json();
                setMasterPrefill(j.data && typeof j.data === 'object' ? j.data : {});
            }
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        if (!authToken || !workspace) return;
        refreshPrefill();
    }, [authToken, workspace, refreshPrefill]);

    const handleLogin = (token) => {
        setAuthToken(token);
        setWorkspace(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem(SS_WORKSPACE);
        sessionStorage.removeItem(SS_TARUN);
        setAuthToken(null);
        setWorkspace(null);
        setCurrentView('dashboard');
    };

    const handleSelectVagmi = () => {
        sessionStorage.setItem(SS_WORKSPACE, 'vagmi');
        sessionStorage.removeItem(SS_TARUN);
        setWorkspace('vagmi');
        setCurrentView('dashboard');
    };

    const handleSelectTarunClick = () => {
        setTarunModalOpen(true);
    };

    const handleTarunUnlocked = (tarunToken) => {
        sessionStorage.setItem(SS_WORKSPACE, 'tarun');
        sessionStorage.setItem(SS_TARUN, tarunToken);
        setWorkspace('tarun');
        setTarunModalOpen(false);
        setCurrentView('dashboard');
    };

    const handleSwitchWorkspace = () => {
        sessionStorage.removeItem(SS_WORKSPACE);
        sessionStorage.removeItem(SS_TARUN);
        setWorkspace(null);
        setCurrentView('dashboard');
        setMasterPrefill({});
    };

    const openPrefillEditor = async () => {
        await refreshPrefill();
        setPrefillModalOpen(true);
    };

    const savePrefillPayload = async (obj) => {
        setIsSavingPrefill(true);
        try {
            const res = await apiCall('/api/prefill', {
                method: 'PUT',
                body: JSON.stringify({ data: obj }),
            });
            if (res.ok) {
                setMasterPrefill(obj);
                showToast('Master prefill saved');
                setPrefillModalOpen(false);
            } else {
                let message = 'Could not save prefill';
                try {
                    const errBody = await res.json();
                    if (errBody?.error) message = errBody.error;
                } catch {
                    /* ignore */
                }
                showToast(message, 'error');
            }
        } catch (e) {
            showToast(e?.message || 'Error saving prefill', 'error');
        } finally {
            setIsSavingPrefill(false);
        }
    };

    const [dashboardInvoices, setDashboardInvoices] = useState([]);
    const [isDashboardLoading, setIsDashboardLoading] = useState(false);

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

    const handleDeleteInvoice = useCallback(
        async (invoice) => {
            const m = Number(invoice.month);
            const label = Number.isFinite(m) ? MONTH_NAMES[m - 1] : `Month ${invoice.month}`;
            if (
                !window.confirm(
                    `Remove the saved invoice for ${label} ${selectedYear}? You can create a fresh one afterward from master prefill.`
                )
            ) {
                return;
            }
            try {
                const res = await apiCall(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
                if (res.ok) {
                    showToast('Invoice deleted');
                    fetchDashboardInvoices();
                } else {
                    let message = 'Could not delete invoice';
                    try {
                        const errBody = await res.json();
                        if (errBody?.error) message = errBody.error;
                    } catch {
                        /* ignore */
                    }
                    showToast(message, 'error');
                }
            } catch (e) {
                showToast(e?.message || 'Delete failed', 'error');
            }
        },
        [fetchDashboardInvoices, selectedYear]
    );

    useEffect(() => {
        if (authToken && workspace && currentView === 'dashboard') {
            fetchDashboardInvoices();
        }
    }, [authToken, workspace, currentView, fetchDashboardInvoices]);

    const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

    const [settings, setSettings] = useState({
        template: 'template1',
        font: 'font-inter',
        color: '#0f172a',
    });

    const [data, setData] = useState(() =>
        buildDefaultDataForWorkspace('tarun', new Date().getMonth() + 1)
    );

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

    const handleCreateInvoice = useCallback(
        (monthNum) => {
            if (!workspace) return;
            const base = buildDefaultDataForWorkspace(workspace, monthNum);
            let merged = mergeInvoicePrefill(base, masterPrefill);
            if (workspace === 'vagmi') {
                const savedMonths = dashboardInvoices
                    .map((inv) => Number(inv.month))
                    .filter((m) => Number.isFinite(m) && m >= 1 && m <= 12);
                merged = {
                    ...merged,
                    invoiceNo: vagmiSequentialInvoiceNo(monthNum, savedMonths),
                };
            }
            setSelectedMonth(monthNum);
            setData(merged);
            setSettings({ template: 'template1', font: 'font-inter', color: '#0f172a' });
            setCurrentInvoiceId(null);
            setIsDirty(false);
            setCurrentView('editor');
        },
        [workspace, masterPrefill, dashboardInvoices]
    );

    const handleViewInvoice = async (invoice) => {
        setSelectedMonth(Number(invoice.month));
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

    const saveInvoice = async () => {
        const month = Number(selectedMonth);
        const year = Number(selectedYear);
        if (!Number.isFinite(month) || month < 1 || month > 12 || !Number.isFinite(year)) {
            showToast(
                'Cannot save: no month/year for this invoice. Go back and open or create a month slot.',
                'error'
            );
            return;
        }
        setIsSaving(true);
        setSaveStatus('');
        try {
            const name = getInvoiceFilename(data.senderName, data.invoiceNo).replace('.pdf', '');
            const res = await apiCall('/api/invoices', {
                method: 'POST',
                body: JSON.stringify({
                    month,
                    year,
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
                let message = `Save failed (${res.status})`;
                try {
                    const errBody = await res.json();
                    if (errBody?.error) message = errBody.error;
                } catch {
                    /* ignore */
                }
                showToast(message, 'error');
            }
        } catch (err) {
            showToast(err?.message || 'Error saving invoice', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
    const total = subtotal + (parseFloat(data.taxAmount) || 0);
    const TemplateComponent = TEMPLATES[settings.template] || Template1;

    const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
    const handleZoomReset = () => setZoom(100);

    const printInvoice = useCallback(() => {
        window.print();
    }, []);

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
                    await res.text();
                    showToast('Failed to send email', 'error');
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

    const workspaceLabel = workspace === 'vagmi' ? 'Vagmi' : workspace === 'tarun' ? 'Tarun' : '';
    const senderEmailForUi =
        workspace === 'vagmi'
            ? process.env.NEXT_PUBLIC_SENDER_EMAIL_VAGMI || ''
            : process.env.NEXT_PUBLIC_SENDER_EMAIL || '';
    const emailRecipientSeed =
        workspace === 'vagmi'
            ? process.env.NEXT_PUBLIC_RECIPIENTS_VAGMI ||
              process.env.NEXT_PUBLIC_RECIPIENTS ||
              ''
            : process.env.NEXT_PUBLIC_RECIPIENTS || '';

    const prefillModalInitial = useMemo(() => {
        if (workspace !== 'vagmi' && workspace !== 'tarun') return {};
        return resolvePrefillForEditor(workspace, masterPrefill);
    }, [workspace, masterPrefill]);

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

    if (!workspace) {
        return (
            <>
                <WorkspacePicker
                    onSelectVagmi={handleSelectVagmi}
                    onSelectTarun={handleSelectTarunClick}
                    onLogout={handleLogout}
                />
                <TarunWorkspaceModal
                    isOpen={tarunModalOpen}
                    masterToken={authToken}
                    onClose={() => setTarunModalOpen(false)}
                    onSuccess={handleTarunUnlocked}
                />
                <Toast />
            </>
        );
    }

    if (currentView === 'dashboard') {
        return (
            <>
                <Dashboard
                    invoices={dashboardInvoices}
                    onCreateInvoice={handleCreateInvoice}
                    onViewInvoice={handleViewInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    isLoading={isDashboardLoading}
                    workspaceLabel={workspaceLabel}
                    onMasterPrefill={openPrefillEditor}
                    onSwitchWorkspace={handleSwitchWorkspace}
                />
                <PrefillModal
                    isOpen={prefillModalOpen}
                    onClose={() => !isSavingPrefill && setPrefillModalOpen(false)}
                    workspaceLabel={workspaceLabel}
                    initialJson={prefillModalInitial}
                    onSave={savePrefillPayload}
                    isSaving={isSavingPrefill}
                />
                <Toast />
            </>
        );
    }

    const invoiceMonthName = selectedMonth ? MONTH_NAMES[selectedMonth - 1] : '';

    return (
        <div className="app-layout">
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
                workspaceLabel={workspaceLabel}
                onSwitchWorkspace={handleSwitchWorkspace}
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
                        <button className="add-item-row" type="button" onClick={addItem}>
                            <Plus size={14} />
                            Add Line Item
                        </button>
                        {data.items.length > 1 && (
                            <button
                                type="button"
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

            <div className="zoom-controls no-print">
                <button type="button" className="zoom-btn" onClick={handleZoomOut} title="Zoom out">
                    <ZoomOut size={16} />
                </button>
                <button
                    type="button"
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
                <button type="button" className="zoom-btn" onClick={handleZoomIn} title="Zoom in">
                    <ZoomIn size={16} />
                </button>
            </div>

            {isDesignPanelOpen && (
                <DesignPanel
                    settings={settings}
                    onUpdate={updateSettings}
                    onClose={() => setIsDesignPanelOpen(false)}
                />
            )}

            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => !isSendingEmail && setIsEmailModalOpen(false)}
                onSend={handleEmailSend}
                isSending={isSendingEmail}
                senderEmail={senderEmailForUi}
                initialRecipients={emailRecipientSeed.split(',').map((s) => s.trim()).filter(Boolean)}
                invoiceSubject={(() => {
                    const cleanName = (data.senderName || '').replace(/<[^>]*>/g, '');
                    const paddedNo = String(data.invoiceNo || 1).padStart(2, '0');
                    return `${cleanName} – Invoice #${paddedNo} – ${invoiceMonthName} ${selectedYear}`;
                })()}
                attachmentName={getInvoiceFilename(data.senderName, data.invoiceNo)}
                invoiceMonth={invoiceMonthName}
            />

            <PrefillModal
                isOpen={prefillModalOpen}
                onClose={() => !isSavingPrefill && setPrefillModalOpen(false)}
                workspaceLabel={workspaceLabel}
                initialJson={prefillModalInitial}
                onSave={savePrefillPayload}
                isSaving={isSavingPrefill}
            />

            <Toast />
        </div>
    );
}
