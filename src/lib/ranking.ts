/**
 * 목록 순서를 분수 순위(fractional index)로 다룬다.
 * 항목 하나를 옮길 때 이웃 두 값 사이의 새 값만 계산하면 되므로,
 * 드래그 한 번에 목록 전체를 다시 번호 매기는 쓰기 폭발이 없다.
 */

/** 두 순위가 이보다 가까워지면 부동소수점 정밀도가 위태로워진다. */
export const MIN_RANK_GAP = 1e-6

/**
 * `before`(바로 위 항목)와 `after`(바로 아래 항목) 사이에 놓일 순위를 준다.
 * 목록 맨 위면 before가 null, 맨 아래면 after가 null, 빈 목록이면 둘 다 null이다.
 */
export function rankBetween(before: number | null, after: number | null): number {
  if (before === null && after === null) return 0
  if (before === null) return after! - 1
  if (after === null) return before + 1
  return (before + after) / 2
}

/** 이 자리에 더 끼워 넣기 전에 그룹을 재배열해야 하는지 판단한다. */
export function needsRebalance(before: number | null, after: number | null): boolean {
  if (before === null || after === null) return false
  return Math.abs(after - before) < MIN_RANK_GAP
}

/** 재배열할 때 쓸 순위 목록. 항목 순서는 그대로 두고 값만 1 간격으로 편다. */
export function rebalancedPositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i)
}
