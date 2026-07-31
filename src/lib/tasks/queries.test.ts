import { describe, expect, it } from 'vitest'
import { rowToTask } from './queries'

describe('rowToTask', () => {
  it('snake_case 행을 camelCase Task 로 바꾼다', () => {
    expect(
      rowToTask({
        id: 'a1',
        user_id: 'u1',
        title: '진료기록 정리',
        bucket: 'today',
        position: 1.5,
        bucketed_at: '2026-07-31T00:00:00Z',
        done_at: null,
        created_at: '2026-07-30T00:00:00Z',
      })
    ).toEqual({
      id: 'a1',
      title: '진료기록 정리',
      bucket: 'today',
      position: 1.5,
      bucketedAt: '2026-07-31T00:00:00Z',
      doneAt: null,
      createdAt: '2026-07-30T00:00:00Z',
    })
  })

  it('user_id 는 클라이언트로 넘기지 않는다', () => {
    const task = rowToTask({
      id: 'a1',
      user_id: 'u1',
      title: 'x',
      bucket: 'week',
      position: 0,
      bucketed_at: '2026-07-31T00:00:00Z',
      done_at: '2026-07-31T01:00:00Z',
      created_at: '2026-07-30T00:00:00Z',
    })
    expect(task).not.toHaveProperty('user_id')
    expect(task.doneAt).toBe('2026-07-31T01:00:00Z')
  })
})
