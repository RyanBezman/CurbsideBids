export function formatScheduleForConfirmation(iso: string): string {
  return new Date(iso).toLocaleString();
}
