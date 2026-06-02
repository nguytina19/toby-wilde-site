// Next.js calls `register()` once per server process at startup.
// We use it to open the Slack Socket Mode connection so the bot can
// receive events without a public HTTP webhook. See src/lib/bolt-app.ts.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startBoltApp } = await import("./lib/bolt-app");
  await startBoltApp();
}
