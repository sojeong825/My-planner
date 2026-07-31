'use client'

import { useState } from 'react'
import type { Task } from '@/lib/tasks/types'

export function CompletedSection({
  tasks,
  onToggle,
}: {
  tasks: Task[]
  onToggle: (id: string, done: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  const todayCount = tasks.filter((t) => {
    if (!t.doneAt) return false
    const done = new Date(t.doneAt)
    const now = new Date()
    return done.toDateString() === now.toDateString()
  }).length

  if (tasks.length === 0) return null

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-sm text-neutral-500"
      >
        {open ? '▾' : '▸'} 완료 (오늘 {todayCount}개)
      </button>
      {open ? (
        <ul className="mt-1">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked
                onChange={() => onToggle(task.id, false)}
                aria-label={`${task.title} 완료 취소`}
              />
              <span className="text-neutral-400 line-through">{task.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
