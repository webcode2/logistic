"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Helper to ping a Supabase instance using an RPC call or a fallback query.
 */
async function pingSupabase(url: string, key: string, label: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient(url, key);

        // 1. Try calling the keepalive RPC (preferred)
        const { error: rpcError } = await supabase.rpc("keepalive");

        if (!rpcError) {
            console.log(`${label} Supabase pinged successfully via RPC.`);
            return { success: true };
        }

        // 2. If RPC fails because function is missing, try a simple query fallback
        // PGRST202: Could not find the function in the schema cache
        if (rpcError.code === 'PGRST202' || rpcError.message?.includes('Could not find the function')) {
            console.warn(`${label} keepalive RPC missing. Falling back to table query...`);

            // Try querying common tables. Based on user feedback, we'll include 'Role' or 'roles'.
            const tablesToTry = ['User', 'profiles', 'Role', 'roles', 'users', 'accounts'];
            for (const table of tablesToTry) {
                // We use head: true for efficiency, just to check if the table exists or can be reached
                const { error: queryError, data } = await supabase.from(table).select('*').limit(1);

                if (!queryError) {
                    console.log(`${label} Supabase pinged successfully via fallback query on table '${table}'.`);
                    return { success: true };
                }

                // If it's just a permission error but the table exists, it still counts as a keep-alive activity
                if (queryError.code === '42501') { // Insufficient privilege
                    console.log(`${label} Supabase touched (pinged) table '${table}' (got permission error, but signal reached DB).`);
                    return { success: true };
                }
            }

            // If all fallbacks fail
            return {
                success: false,
                error: `RPC 'keepalive' missing and common tables not found in ${label} Supabase. Error: ${rpcError.message}`
            };
        }

        return { success: false, error: rpcError.message };
    } catch (err) {
        console.error(`${label} transport error:`, err);
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

export async function keepAlive() {
    let errorDetails: string[] = [];

    // 1. Keep-alive for Logistics App Supabase
    const logisticUrl = process.env.LOGISTIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const logisticKey = process.env.LOGISTIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (logisticUrl && logisticKey) {
        console.log("Pinging Logistics Supabase...");
        const result = await pingSupabase(logisticUrl, logisticKey, "Logistics");
        if (!result.success) {
            errorDetails.push(`Logistics: ${result.error}`);
        }
    } else {
        console.warn("Logistics Supabase credentials missing. Skipping ping.");
    }

    // 2. Keep-alive for Bank App Supabase
    const bankUrl = process.env.BANK_SUPABASE_URL;
    const bankKey = process.env.BANK_SUPABASE_SERVICE_ROLE_KEY;

    if (bankUrl && bankKey) {
        console.log("Pinging Bank Supabase...");
        const result = await pingSupabase(bankUrl, bankKey, "Bank");
        if (!result.success) {
            errorDetails.push(`Bank: ${result.error}`);
        }
    } else {
        console.log("Bank Supabase credentials not configured. Skipping ping.");
    }

    if (errorDetails.length > 0) {
        throw new Error(`Keep-alive failed: ${errorDetails.join("; ")}`);
    }
}
