import { keepAlive } from "@/actions/keepAlive";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Keepalive pinged successfully.");
    try {
        await keepAlive();
        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Keepalive error:', message);
        return NextResponse.json({
            error: "Internal Server Error",
            message: message
        }, { status: 500 });
    }
}
