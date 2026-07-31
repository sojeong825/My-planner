import { describe, expect, it } from 'vitest'
import { MIN_RANK_GAP, needsRebalance, rankBetween, rebalancedPositions } from './ranking'

describe('rankBetween', () => {
  it('빈 목록에 넣으면 0이다', () => {
    expect(rankBetween(null, null)).toBe(0)
  })

  it('맨 위로 보내면 첫 항목보다 1 작다', () => {
    expect(rankBetween(null, 5)).toBe(4)
  })

  it('맨 아래로 보내면 마지막 항목보다 1 크다', () => {
    expect(rankBetween(5, null)).toBe(6)
  })

  it('두 항목 사이면 중간값이다', () => {
    expect(rankBetween(1, 2)).toBe(1.5)
  })

  it('음수 구간에서도 중간값이다', () => {
    expect(rankBetween(-4, -2)).toBe(-3)
  })

  it('반복 삽입해도 항상 두 값 사이에 있다', () => {
    let before = 0
    const after = 1
    for (let i = 0; i < 20; i++) {
      const next = rankBetween(before, after)
      expect(next).toBeGreaterThan(before)
      expect(next).toBeLessThan(after)
      before = next
    }
  })
})

describe('needsRebalance', () => {
  it('간격이 충분하면 false다', () => {
    expect(needsRebalance(1, 2)).toBe(false)
  })

  it('간격이 한계 미만이면 true다', () => {
    expect(needsRebalance(1, 1 + MIN_RANK_GAP / 2)).toBe(true)
  })

  it('한쪽 끝이면 재배열이 필요 없다', () => {
    expect(needsRebalance(null, 1)).toBe(false)
    expect(needsRebalance(1, null)).toBe(false)
    expect(needsRebalance(null, null)).toBe(false)
  })
})

describe('rebalancedPositions', () => {
  it('0부터 1씩 증가하는 값을 준다', () => {
    expect(rebalancedPositions(3)).toEqual([0, 1, 2])
  })

  it('빈 목록이면 빈 배열이다', () => {
    expect(rebalancedPositions(0)).toEqual([])
  })
})
