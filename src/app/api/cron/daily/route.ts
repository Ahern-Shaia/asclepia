import { createHash, timingSafeEqual } from "node:crypto";
import { purgeExpiredInquiries } from "@/modules/inquiry/server/purge";
import { cronEnv } from "@/server/env";
import { log } from "@/server/log";
import { pruneRateLimits } from "@/server/rate-limit";

// Daily maintenance, called by the deploy platform's scheduler (the platform is undecided,
// CLAUDE.md §2.4; any scheduler that can send an HTTP request works):
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/daily
// GET is accepted too because some schedulers (Vercel Cron) only send GET.
// - deletes inquiries past their retention date (inquiry.md §7-bis.5)
// - deletes rate-limit windows older than a day
// Safe to run more than once a day; each run is bounded.
const digest = (s: string) => createHash("sha256").update(s).digest();

function authorized(request: Request, secret: string) {
  const sent = request.headers.get("authorization") ?? "";
  // equal-length digests: the comparison time says nothing about the secret or its length
  return timingSafeEqual(digest(sent), digest(`Bearer ${secret}`));
}

async function run(request: Request) {
  const { CRON_SECRET } = cronEnv();
  if (!CRON_SECRET) return Response.json({ code: "CRON_DISABLED" }, { status: 503 });
  if (!authorized(request, CRON_SECRET)) {
    log("warn", "cron.denied", { job: "daily" });
    return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const inquiries = await purgeExpiredInquiries();
    const rateLimits = await pruneRateLimits(new Date(Date.now() - 24 * 3600 * 1000));
    const result = { inquiriesPurged: inquiries.deleted, more: inquiries.more, rateLimits };
    log("info", "cron.daily", result);
    return Response.json(result);
  } catch (e) {
    log("error", "cron.daily_failed", { error: e instanceof Error ? e.name : "unknown" });
    return Response.json({ code: "UNKNOWN" }, { status: 500 });
  }
}

export const POST = run;
export const GET = run;
