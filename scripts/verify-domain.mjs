#!/usr/bin/env node

/**
 * Resend Domain Verification Helper
 *
 * Usage:
 *   node scripts/verify-domain.mjs <domain>
 *
 * Example:
 *   node scripts/verify-domain.mjs ysm-invoice-generator.vercel.app
 *
 * This script:
 *   1. Creates (or finds) the domain in your Resend account
 *   2. Prints out the DNS records you need to add
 *   3. Optionally polls for verification status
 *
 * Prerequisites:
 *   - RESEND_API_KEY in .env or environment
 */

import 'dotenv/config';

const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) {
    console.error('❌ RESEND_API_KEY not found. Set it in your .env file.');
    process.exit(1);
}

const domain = process.argv[2];
if (!domain) {
    console.error('Usage: node scripts/verify-domain.mjs <domain>');
    console.error('Example: node scripts/verify-domain.mjs ysm-invoice-generator.vercel.app');
    process.exit(1);
}

const headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
};

async function listDomains() {
    const res = await fetch('https://api.resend.com/domains', { headers });
    const data = await res.json();
    return data.data || [];
}

async function createDomain(name) {
    const res = await fetch('https://api.resend.com/domains', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
    });
    return res.json();
}

async function getDomain(id) {
    const res = await fetch(`https://api.resend.com/domains/${id}`, { headers });
    return res.json();
}

async function main() {
    console.log(`\n🔍 Checking Resend for domain: ${domain}\n`);

    // Check if domain already exists
    const existing = await listDomains();
    let domainData = existing.find((d) => d.name === domain);

    if (domainData) {
        console.log(`✅ Domain "${domain}" already exists (ID: ${domainData.id}, Status: ${domainData.status})`);
        // Get full details
        domainData = await getDomain(domainData.id);
    } else {
        console.log(`📝 Creating domain "${domain}" in Resend...`);
        domainData = await createDomain(domain);

        if (domainData.statusCode && domainData.statusCode >= 400) {
            console.error(`❌ Error creating domain:`, domainData.message || domainData);
            process.exit(1);
        }

        console.log(`✅ Domain created! (ID: ${domainData.id})`);
        // Get full details with DNS records
        domainData = await getDomain(domainData.id);
    }

    // Display DNS records
    if (domainData.records && domainData.records.length > 0) {
        console.log(`\n📋 DNS Records to add in Vercel Dashboard → Domains → ${domain}:\n`);
        console.log('┌─────────┬──────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┬──────────┐');
        console.log('│ Type    │ Name                                     │ Value                                                            │ Priority │');
        console.log('├─────────┼──────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┼──────────┤');

        for (const record of domainData.records) {
            const type = (record.record || record.type || '').padEnd(7);
            const name = (record.name || '').padEnd(40);
            const value = (record.value || '').substring(0, 64).padEnd(64);
            const priority = (record.priority || '').toString().padEnd(8);
            console.log(`│ ${type} │ ${name} │ ${value} │ ${priority} │`);
        }

        console.log('└─────────┴──────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┴──────────┘');
    }

    console.log(`\n📌 Status: ${domainData.status || 'pending'}`);

    if (domainData.status === 'verified') {
        console.log('✅ Domain is already verified! You can now send emails from this domain.');
        console.log(`\nUpdate your .env:`);
        console.log(`  RESEND_FROM_EMAIL=Invoice Generator <invoice@${domain}>`);
    } else {
        console.log('\n⏳ After adding DNS records, verification can take 1-48 hours.');
        console.log('   Run this script again to check the status.');
        console.log('\n💡 Tip: Use the Resend dashboard (https://resend.com/domains) to monitor status.');
    }
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
