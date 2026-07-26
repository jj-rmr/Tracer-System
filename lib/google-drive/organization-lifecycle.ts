export async function runDriveOrganization({
  markStarted,
  organize,
  markOrganized,
  markFailed,
}: {
  markStarted: () => Promise<boolean | void>;
  organize: () => Promise<void>;
  markOrganized: () => Promise<void>;
  markFailed: (error: unknown) => Promise<void>;
}) {
  const started = await markStarted();
  if (started === false) return;

  try {
    await organize();
    await markOrganized();
  } catch (error) {
    await markFailed(error).catch(() => undefined);
    throw error;
  }
}
