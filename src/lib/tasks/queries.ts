import type { SupabaseClient } from '@supabase/supabase-js'
import type { Bucket, Task } from './types'

/** DB 행 모양. 이 파일 밖으로 새어 나가지 않는다. */
export type TaskRow = {
  id: string
  user_id: string
  title: string
  bucket: Bucket
  position: number
  bucketed_at: string
  done_at: string | null
  created_at: string
}

const COLUMNS = 'id, user_id, title, bucket, position, bucketed_at, done_at, created_at'

/** snake_case ↔ camelCase 변환이 일어나는 유일한 지점. */
export function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    bucket: row.bucket,
    position: row.position,
    bucketedAt: row.bucketed_at,
    doneAt: row.done_at,
    createdAt: row.created_at,
  }
}

/** 내 할 일 전부. 그룹 순서는 클라이언트가 정하므로 여기서는 position 만 정렬한다. */
export async function listTasks(supabase: SupabaseClient): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .order('position', { ascending: true })

  if (error) throw error
  return (data as TaskRow[]).map(rowToTask)
}
