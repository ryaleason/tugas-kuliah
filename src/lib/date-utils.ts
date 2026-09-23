export type UrgencyLevel = 'overdue' | 'today' | 'urgent' | 'upcoming' | 'normal';

/**
 * Calculates day difference from today to the target deadline date.
 * Returns negative numbers for overdue dates, 0 for today, positive numbers for future.
 */
export function getDaysUntilDeadline(deadlineStr: string): number {
  if (!deadlineStr) return 999;
  const [year, month, day] = deadlineStr.split('-').map(Number);
  if (!year || !month || !day) return 999;

  // Use local midnight to avoid timezone skew
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(year, month - 1, day);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getUrgencyLevel(deadlineStr: string, isCompleted: boolean): UrgencyLevel {
  if (isCompleted) return 'normal';
  const diff = getDaysUntilDeadline(deadlineStr);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3) return 'urgent';
  if (diff <= 7) return 'upcoming';
  return 'normal';
}

export function formatDeadlineRelative(deadlineStr: string): string {
  const diff = getDaysUntilDeadline(deadlineStr);
  if (diff < -1) return `Terlewat ${Math.abs(diff)} hari`;
  if (diff === -1) return 'Terlewat kemarin';
  if (diff === 0) return 'Hari ini!';
  if (diff === 1) return 'Besok';
  if (diff > 1) return `${diff} hari lagi`;
  return deadlineStr;
}

export function formatDeadlineDisplay(deadlineStr: string): string {
  if (!deadlineStr) return '-';
  const parts = deadlineStr.split('-');
  if (parts.length !== 3) return deadlineStr;
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return deadlineStr;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Checks if the task is exactly H-4 away from deadline.
 */
export function isHMinus4(deadlineStr: string): boolean {
  return getDaysUntilDeadline(deadlineStr) === 4;
}
