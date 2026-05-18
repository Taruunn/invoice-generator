const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export function toISODate(date) {
    return date.toISOString().split('T')[0];
}

export { MONTH_NAMES };

export function getInvoiceFilename(senderName, invoiceNo) {
    const cleanName = (senderName || 'Invoice')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, '');
    const paddedNo = String(invoiceNo || 1).padStart(2, '0');
    return `${cleanName}_INV_${paddedNo}.pdf`;
}

function monthInvoiceDates(monthNum) {
    const year = new Date().getFullYear();
    const currentMonth = MONTH_NAMES[monthNum - 1];
    const invoiceDate = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    return { year, currentMonth, invoiceDate, lastDay };
}

export function buildTarunDefaultData(monthNum) {
    const { year, currentMonth, invoiceDate, lastDay } = monthInvoiceDates(monthNum);
    const senderEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || '';

    return {
        senderName: 'Tarun Kumar',
        tradeName: '(Trade Name: Dorahi)',
        senderAddress:
            'Plot No. 06, 219, Gelda Colony, Uttari Sunderwas<br> Udaipur, Rajasthan 313001, India',
        senderGst: '<b>GST: 08HQAPK7073Q1Z1</b>',
        senderPan: '<b>PAN:</b> HQAPK7073Q',
        senderEmail: `<b>EMAIL:</b> ${senderEmail}`,

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

export function buildVagmiDefaultData(monthNum) {
    const { year, currentMonth, invoiceDate, lastDay } = monthInvoiceDates(monthNum);
    const senderEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL_VAGMI || '';

    return {
        senderName: 'Vagmi',
        tradeName: '',
        senderAddress: 'Your address — edit in Master prefill',
        senderGst: '<b>GST:</b> —',
        senderPan: '<b>PAN:</b> —',
        senderEmail: `<b>EMAIL:</b> ${senderEmail}`,

        billToLabel: 'BILL TO',
        receiverName: 'Client name',
        receiverAddress: 'Client address',
        receiverVat: '<b>VAT:</b> —',

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
                desc: `Professional services<br/><br/><i>Monthly (${currentMonth} ${year})</i>`,
                qty: 1,
                rate: 0,
            },
        ],

        subtotalLabel: 'Subtotal',
        taxLabel: 'Tax',
        taxAmount: 0.0,
        totalLabel: 'Total',

        notesTitle: 'Payment details',
        notesContent: 'Update bank details in Master prefill',

        termsTitle: 'Terms',
        termsContent: 'Update terms in Master prefill',
    };
}

export function buildDefaultDataForWorkspace(workspace, monthNum) {
    const w = workspace === 'vagmi' ? 'vagmi' : 'tarun';
    if (w === 'vagmi') return buildVagmiDefaultData(monthNum);
    return buildTarunDefaultData(monthNum);
}

/**
 * Shallow-merge invoice fields; `items` from prefill replace defaults only when prefill.items is a non-empty array.
 */
export function mergeInvoicePrefill(base, prefill) {
    if (!prefill || typeof prefill !== 'object') return base;
    const next = { ...base, ...prefill };
    if (Array.isArray(prefill.items) && prefill.items.length > 0) {
        next.items = prefill.items.map((row, i) => ({
            ...row,
            id: row.id != null ? row.id : i + 1,
        }));
    }
    return next;
}

/** Invoice fields that come from the month slot, not master prefill */
export function stripMonthSpecificInvoiceFields(data) {
    if (!data || typeof data !== 'object') return {};
    const { invoiceNo, invoiceDate, dueDate, ...rest } = data;
    return rest;
}

/**
 * Template defaults from code for the Master prefill UI + merging stored rows.
 * When DB has no row yet ({}), Tarun/Vagmi still see their normal invoice defaults.
 */
export function resolvePrefillForEditor(workspace, storedPrefill) {
    const w = workspace === 'vagmi' ? 'vagmi' : 'tarun';
    const monthNum = new Date().getMonth() + 1;
    const seed = stripMonthSpecificInvoiceFields(buildDefaultDataForWorkspace(w, monthNum));
    const stored =
        storedPrefill && typeof storedPrefill === 'object' && !Array.isArray(storedPrefill)
            ? storedPrefill
            : {};
    return mergeInvoicePrefill(seed, stored);
}
