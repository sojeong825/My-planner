'use client'

import { useState } from 'react'
import type { Task } from '@/lib/tasks/types'

export function TaskItem({
  task,
  stale,
  onToggle,
  onRename,
  onDelete,
}: {
  task: Task
  stale: boolean
  onToggle: (done: boolean) => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  function commit() {
    setEditing(false)
    const next = draft.trim()
    if (next.length === 0 || next === task.title) {
      setDraft(task.title)
      return
    }
    onRename(next)
  }

  return (
    <li className="group flex items-center gap-2 py-1">
      <input
        type="checkbox"
        checked={task.doneAt !== null}
        onChange={(e) => onToggle(e.target.checked)}
        aria-label={`${task.title} 완료`}
      />

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(task.title)
              setEditing(false)
            }
          }}
          className="flex-1 border-b outline-none"
        />
      ) : (
        <button
          type="button"
          // 편집을 열 때마다 현재 제목에서 다시 시작한다. draft 는 이 컴포넌트가
          // 들고 있으므로, 저장이 실패해 제목이 롤백되면 draft 에는 실패한 문구가
          // 남는다. 그대로 두면 다음에 열었을 때 그 문구가 보인다.
          onClick={() => {
            setDraft(task.title)
            setEditing(true)
          }}
          className={`flex-1 text-left ${task.doneAt ? 'text-neutral-400 line-through' : ''}`}
        >
          {task.title}
        </button>
      )}

      {/* 오래된 항목 표시. 위치는 바꾸지 않고 흐린 점만 붙인다. */}
      {stale ? (
        <span aria-label="사흘 넘게 남아 있음" className="text-neutral-300">
          ·
        </span>
      ) : null}

      <button
        type="button"
        onClick={onDelete}
        aria-label={`${task.title} 삭제`}
        className="text-neutral-300 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
      >
        ×
      </button>
    </li>
  )
}
