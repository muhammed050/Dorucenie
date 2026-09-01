import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export function startJobHeartbeat(jobId: string, workerId: string) {
  let stopped = false;
  const timer = setInterval(async () => {
    if (stopped) return;
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).rpc("heartbeat_job", { p_job_id: jobId, p_worker_id: workerId, p_lease_minutes: 15 });
  }, 60_000);
  return () => { stopped = true; clearInterval(timer); };
}
