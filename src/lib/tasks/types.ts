export type Bucket = 'today' | 'week' | 'someday'

export const BUCKETS: Bucket[] = ['today', 'week', 'someday']

export const BUCKET_LABELS: Record<Bucket, string> = {
  today: '오늘',
  week: '이번주',
  someday: '언젠가',
}

export type Task = {
  id: string
  title: string
  bucket: Bucket
  /** 그룹 내 정렬값. 작을수록 위. */
  position: number
  /** 현재 bucket으로 들어온 시각 (ISO 8601) */
  bucketedAt: string
  /** null이면 미완료 */
  doneAt: string | null
  createdAt: string
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }
