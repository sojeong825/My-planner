'use client'

import { useEffect, useState } from 'react'

const DRAFT_KEY = 'sunseo:draft'

export function QuickAdd({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [value, setValue] = useState('')

  // 세션이 만료돼 로그인 화면으로 튕겨도 치고 있던 문장은 잃지 않아야 한다.
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회, localStorage(외부 시스템)에서 값을 동기화하는 의도된 패턴.
    if (saved) setValue(saved)
  }, [])

  useEffect(() => {
    if (value) localStorage.setItem(DRAFT_KEY, value)
    else localStorage.removeItem(DRAFT_KEY)
  }, [value])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const title = value.trim()
        // 빈 제목은 아무 일도 하지 않는다. 오류 메시지도 띄우지 않는다.
        if (title.length === 0) return
        onSubmit(title)
        setValue('')
      }}
    >
      <input
        // 열자마자 타이핑할 수 있어야 한다. 입력 마찰이 이 앱의 존재 이유다.
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="할 일 입력..."
        aria-label="할 일 입력"
        className="w-full rounded border px-3 py-2 outline-none focus:border-neutral-900"
      />
    </form>
  )
}
