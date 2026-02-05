"use server";

import { createClient } from "@supabase/supabase-js";

export async function keepAlive() {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.rpc("keepalive");
}
