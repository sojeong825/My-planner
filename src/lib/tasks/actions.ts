'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Bucket, Task } from './types'

const SAVE_FAILED = '저장하지 못했습니다'

/** 로그인한 사용자의 id. RLS 가 최종 방어선이지만, 여기서 먼저 막아 의미 있는 오류를 준다. */
async function requireUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (typeof userId !== 'string') return null
  return userId
}

export async function addTask(input: {
  id: string
  title: string
  position: number
}): Promise<ActionResult<null>> {
  const title = input.title.trim()
  if (title.length === 0) return { ok: false, error: '내용이 비어 있습니다' }

  const supabase = await createClient()
  const userId = await requireUserId(supabase)
  if (!userId) return { ok: false, error: '로그인이 필요합니다' }

  const { error } = await supabase.from('tasks').insert({
    id: input.id,
    user_id: userId,
    title,
    bucket: 'today',
    position: input.position,
  })

  return error ? { ok: false, error: SAVE_FAILED } : { ok: true, data: null }
}

export async function setDone(input: {
  id: string
  done: boolean
}): Promise<ActionResult<null>> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ done_at: input.done ? new Date().toISOString() : null })
    .eq('id', input.id)

  return error ? { ok: false, error: SAVE_FAILED } : { ok: true, data: null }
}

export async function moveTask(input: {
  id: string
  bucket: Bucket
  position: number
}): Promise<ActionResult<null>> {
  const supabase = await createClient()

  // 그룹이 실제로 바뀔 때만 bucketed_at 을 갱신한다.
  // 그룹 안에서 순서만 바꾼 것까지 "오래됨" 시계를 되돌리면 안 된다.
  const { data: current, error: readError } = await supabase
    .from('tasks')
    .select('bucket')
    .eq('id', input.id)
    .single()

  if (readError || !current) return { ok: false, error: SAVE_FAILED }

  const patch: Record<string, unknown> = {
    bucket: input.bucket,
    position: input.position,
  }
  if (current.bucket !== input.bucket) {
    patch.bucketed_at = new Date().toISOString()
  }

  const { error } = await supabase.from('tasks').update(patch).eq('id', input.id)

  return error ? { ok: false, error: SAVE_FAILED } : { ok: true, data: null }
}

export async function renameTask(input: {
  id: string
  title: string
}): Promise<ActionResult<null>> {
  const title = input.title.trim()
  if (title.length === 0) return { ok: false, error: '내용이 비어 있습니다' }

  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ title }).eq('id', input.id)

  return error ? { ok: false, error: SAVE_FAILED } : { ok: true, data: null }
}

export async function deleteTask(input: { id: string }): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', input.id)

  return error ? { ok: false, error: SAVE_FAILED } : { ok: true, data: null }
}

/** 삭제 직후 "실행 취소"를 눌렀을 때 같은 id 로 되살린다. */
export async function restoreTask(input: { task: Task }): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const userId = await requireUserId(supabase)
  if (!userId) return { ok: false, error: '로그인이 필요합니다' }

  const { error } = await supabase.from('tasks').insert({
    id: input.task.id,
    user_id: userId,
    title: input.task.title,
    bucket: input.task.bucket,
    position: input.task.position,
    bucketed_at: input.task.bucketedAt,
    done_at: input.task.doneAt,
    created_at: input.task.createdAt,
  })

  return error ? { ok: false, error: SAVE_FAILED } : { ok: true, data: null }
}

/**
 * 한 그룹의 순위를 1 간격으로 다시 편다.
 * 같은 두 항목 사이에 수십 번 끼워 넣어 부동소수점 정밀도가 고갈됐을 때만 부른다.
 */
export async function rebalanceGroup(input: {
  positions: { id: string; position: number }[]
}): Promise<ActionResult<null>> {
  const supabase = await createClient()

  for (const { id, position } of input.positions) {
    const { error } = await supabase.from('tasks').update({ position }).eq('id', id)
    if (error) return { ok: false, error: SAVE_FAILED }
  }

  return { ok: true, data: null }
}
