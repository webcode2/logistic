import { keepAlive } from "@/actions/keepAlive";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await keepAlive();
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Keepalive error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
