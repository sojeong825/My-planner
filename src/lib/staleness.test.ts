import { describe, expect, it } from 'vitest'
import { isStale } from './staleness'

const NOW = new Date('2026-07-31T12:00:00Z')

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString()
}

describe('isStale', () => {
  it('오늘 그룹에서 3일이 지났고 미완료면 오래된 것이다', () => {
    expect(isStale({ bucket: 'today', bucketedAt: daysAgo(3), doneAt: null }, NOW)).toBe(true)
  })

  it('3일이 안 됐으면 아니다', () => {
    expect(isStale({ bucket: 'today', bucketedAt: daysAgo(2), doneAt: null }, NOW)).toBe(false)
  })

  it('완료했으면 아무리 오래돼도 아니다', () => {
    expect(
      isStale({ bucket: 'today', bucketedAt: daysAgo(30), doneAt: daysAgo(1) }, NOW)
    ).toBe(false)
  })

  it('오늘 그룹이 아니면 아니다', () => {
    expect(isStale({ bucket: 'week', bucketedAt: daysAgo(30), doneAt: null }, NOW)).toBe(false)
    expect(isStale({ bucket: 'someday', bucketedAt: daysAgo(30), doneAt: null }, NOW)).toBe(false)
  })
})
