import './globals.css';

export const metadata = {
    title: 'YourStoreMatters - Invoice Generator',
    description:
        'Generate beautiful, professional invoices directly in your browser. Edit directly on the invoice, switch templates, and download as PDF.',
    icons: {
        icon: '/ysm-logo.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
