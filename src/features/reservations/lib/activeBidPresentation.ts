export function formatActiveBidSummary(activeBidCount: number): string {
  return activeBidCount === 1
    ? "1 driver offer waiting"
    : `${activeBidCount} driver offers waiting`;
}
