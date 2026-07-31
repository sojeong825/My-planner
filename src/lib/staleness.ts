import type { Task } from './tasks/types'

/** `today`에 이만큼 머무른 미완료 항목에 흐린 점을 표시한다. */
export const STALE_AFTER_DAYS = 3

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function isStale(
  task: Pick<Task, 'bucket' | 'bucketedAt' | 'doneAt'>,
  now: Date
): boolean {
  if (task.bucket !== 'today') return false
  if (task.doneAt !== null) return false
  const elapsed = now.getTime() - new Date(task.bucketedAt).getTime()
  return elapsed >= STALE_AFTER_DAYS * MS_PER_DAY
}
