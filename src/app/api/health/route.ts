import { NextResponse } from "next/server";
import { isBoltReady } from "@/lib/bolt-app";

// k8s readiness/liveness probe. 200 means Bolt's Socket Mode session is
// open and the bot is dispatching events. Returning 503 from a probe
// causes the kubelet to mark the pod NotReady (readiness) or restart it
// (liveness) — which is what we want when Bolt fails to connect.

export const dynamic = "force-dynamic";

export async function GET() {
  const bolt = isBoltReady();
  return NextResponse.json(
    { ok: bolt, bolt },
    { status: bolt ? 200 : 503 },
  );
}
