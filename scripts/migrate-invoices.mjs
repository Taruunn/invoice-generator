/**
 * Supabase Migration: Add month/year columns to invoices table
 * Run this script ONCE: node scripts/migrate-invoices.mjs
 */
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function migrate() {
    console.log('🔄 Starting migration...');

    // 1. Delete all existing invoices (fresh start)
    const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

    if (deleteError) {
        console.error('⚠️  Could not delete old invoices:', deleteError.message);
        console.log('   Continuing anyway...');
    } else {
        console.log('✅ Old invoices cleared');
    }

    // 2. Test insert with month/year columns
    console.log('\n📝 Testing insert with month/year columns...');
    const { data, error: testError } = await supabase
        .from('invoices')
        .insert({
            name: 'test',
            data: {},
            settings: {},
            month: 1,
            year: 2026,
        })
        .select('id, month, year')
        .single();

    if (testError) {
        if (testError.message.includes('month') || testError.message.includes('column')) {
            console.error('❌ Columns "month" and "year" do not exist in the invoices table.');
            console.log('\n👉 Please run this SQL in Supabase Dashboard → SQL Editor:\n');
            console.log(`
ALTER TABLE invoices ADD COLUMN month INTEGER;
ALTER TABLE invoices ADD COLUMN year INTEGER;
CREATE UNIQUE INDEX unique_year_month ON invoices (year, month);
            `);
        } else {
            console.error('❌ Insert failed:', testError.message);
        }
        return;
    }

    // Clean up test row
    await supabase.from('invoices').delete().eq('id', data.id);
    console.log('✅ month/year columns exist and work!');
    console.log('\n🎉 Migration complete! You can now use the app.');
}

migrate().catch(console.error);
