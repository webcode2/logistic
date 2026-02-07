"use server";

import { createClient } from "@supabase/supabase-js";

export async function keepAlive() {
    // 1. Keep-alive for Logistics App Supabase
    const logisticUrl = process.env.LOGISTIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const logisticKey = process.env.LOGISTIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (logisticUrl && logisticKey) {
        console.log("Pinging Logistics Supabase...");
        try {
            const logisticSupabase = createClient(logisticUrl, logisticKey);
            await logisticSupabase.rpc("keepalive");
        } catch (err) {
            console.error("Logistics keep-alive failed:", err);
        }
    }

    // 2. Keep-alive for Bank App Supabase
    const bankUrl = process.env.BANK_SUPABASE_URL;
    const bankKey = process.env.BANK_SUPABASE_SERVICE_ROLE_KEY;

    if (bankUrl && bankKey) {
        console.log("Pinging Bank Supabase...");
        try {
            const bankSupabase = createClient(bankUrl, bankKey);
            await bankSupabase.rpc("keepalive");
        } catch (err) {
            console.error("Bank keep-alive failed:", err);
        }
    }
}


