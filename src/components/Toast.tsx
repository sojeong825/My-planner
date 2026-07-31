'use client'

import { useEffect } from 'react'

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  timeoutMs = 5000,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
  timeoutMs?: number
}) {
  // onDismiss 는 호출부에서 useCallback 으로 고정된 참조여야 한다.
  // 렌더마다 새 함수가 들어오면 이 효과가 매번 다시 걸리면서 5초 타이머가
  // 계속 처음부터 다시 시작되고, 토스트가 영영 사라지지 않는다.
  useEffect(() => {
    const timer = setTimeout(onDismiss, timeoutMs)
    return () => clearTimeout(timer)
  }, [onDismiss, timeoutMs, message])

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      <span>{message}</span>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="underline">
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
