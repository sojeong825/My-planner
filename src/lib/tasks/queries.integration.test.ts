import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { listTasks } from './queries'

const URL = process.env.SUPABASE_TEST_URL!
const KEY = process.env.SUPABASE_TEST_ANON_KEY!

async function signIn(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(URL, KEY)
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`로그인 실패 (${email}): ${error.message}`)
  return client
}

let me: SupabaseClient
let other: SupabaseClient
let myUserId: string
const createdIds: string[] = []

beforeAll(async () => {
  me = await signIn('test@example.com', 'test-password-1234')
  other = await signIn('other@example.com', 'other-password-1234')
  const { data } = await me.auth.getUser()
  myUserId = data.user!.id
})

afterAll(async () => {
  if (createdIds.length > 0) {
    await me.from('tasks').delete().in('id', createdIds)
  }
})

async function insertMine(title: string, position: number): Promise<string> {
  const { data, error } = await me
    .from('tasks')
    .insert({ user_id: myUserId, title, position })
    .select('id')
    .single()
  if (error) throw error
  createdIds.push(data.id)
  return data.id
}

describe('tasks 테이블', () => {
  it('내가 넣은 행을 내가 읽는다', async () => {
    const title = `통합 ${Date.now()}`
    await insertMine(title, 0)

    const tasks = await listTasks(me)
    const found = tasks.find((t) => t.title === title)

    expect(found).toBeDefined()
    expect(found!.bucket).toBe('today')
    expect(found!.doneAt).toBeNull()
    // rowToTask 가 실제 행에서도 camelCase 로 옮기는지 확인한다.
    expect(typeof found!.bucketedAt).toBe('string')
  })

  it('남의 행은 보이지 않는다', async () => {
    const title = `비밀 ${Date.now()}`
    await insertMine(title, 1)

    const theirs = await listTasks(other)

    expect(theirs.find((t) => t.title === title)).toBeUndefined()
  })

  it('남의 행은 고칠 수 없다', async () => {
    const id = await insertMine(`남의것 ${Date.now()}`, 2)

    const { data } = await other.from('tasks').update({ title: '탈취' }).eq('id', id).select()

    // RLS 의 USING 절이 행을 걸러내므로 오류가 아니라 0행이 영향받는다.
    expect(data).toEqual([])
  })

  it('행의 주인을 남에게 넘길 수 없다', async () => {
    const id = await insertMine(`이전 ${Date.now()}`, 3)
    const { data: otherUser } = await other.auth.getUser()

    const { error } = await me
      .from('tasks')
      .update({ user_id: otherUser.user!.id })
      .eq('id', id)

    // UPDATE 정책의 WITH CHECK 가 막아야 한다.
    expect(error).not.toBeNull()
  })

  it('빈 제목은 넣을 수 없다', async () => {
    const { error } = await me
      .from('tasks')
      .insert({ user_id: myUserId, title: '   ', position: 9 })

    expect(error).not.toBeNull()
  })
})
