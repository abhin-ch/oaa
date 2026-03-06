export function formatDate(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}
