export function readTime(markdown: string): string {
  const text = markdown.trim();
  const words = text ? text.split(/\s+/).length : 0;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
