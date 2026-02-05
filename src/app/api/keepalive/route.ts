import { keepAlive } from "@/actions/keepAlive";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const auth = req.headers.get("authorization");

    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await keepAlive();

    return NextResponse.json({ ok: true });
}
