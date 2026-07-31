'use client'

import { useCallback, useRef, useState } from 'react'
import { rankBetween } from '@/lib/ranking'
import { addTask } from '@/lib/tasks/actions'
import { BUCKETS, BUCKET_LABELS, type ActionResult, type Task } from '@/lib/tasks/types'
import { QuickAdd } from './QuickAdd'

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [error, setError] = useState<string | null>(null)

  // 낙관적 갱신에서 롤백하려면 "직전 상태"를 정확히 알아야 한다.
  // useState 의 값은 연속 조작 중 낡을 수 있으므로 ref 를 진실 원천으로 둔다.
  const tasksRef = useRef<Task[]>(initialTasks)

  const apply = useCallback((updater: (prev: Task[]) => Task[]) => {
    tasksRef.current = updater(tasksRef.current)
    setTasks(tasksRef.current)
  }, [])

  const mutate = useCallback(
    async (updater: (prev: Task[]) => Task[], run: () => Promise<ActionResult<null>>) => {
      const snapshot = tasksRef.current
      apply(updater)
      const result = await run()
      if (!result.ok) {
        tasksRef.current = snapshot
        setTasks(snapshot)
        setError(result.error)
      }
    },
    [apply]
  )

  const handleAdd = useCallback(
    (title: string) => {
      // id 를 클라이언트가 만든다. 낙관적으로 그린 항목과 저장된 항목의 id 가
      // 같으므로 응답을 받고 자리를 맞바꾸는 조정이 필요 없다.
      const id = crypto.randomUUID()
      const todayPositions = tasksRef.current
        .filter((t) => t.bucket === 'today')
        .map((t) => t.position)
      const last = todayPositions.length > 0 ? Math.max(...todayPositions) : null
      const position = rankBetween(last, null)
      const now = new Date().toISOString()

      const optimistic: Task = {
        id,
        title,
        bucket: 'today',
        position,
        bucketedAt: now,
        doneAt: null,
        createdAt: now,
      }

      void mutate(
        (prev) => [...prev, optimistic],
        () => addTask({ id, title, position })
      )
    },
    [mutate]
  )

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-4">
      <QuickAdd onSubmit={handleAdd} />

      {BUCKETS.map((bucket) => {
        const items = tasks
          .filter((t) => t.bucket === bucket && t.doneAt === null)
          .sort((a, b) => a.position - b.position)

        return (
          <section key={bucket} className="flex flex-col gap-1">
            <h2 className="flex justify-between text-sm text-neutral-500">
              <span>{BUCKET_LABELS[bucket]}</span>
              <span>{items.length}</span>
            </h2>
            <ul>
              {items.map((task) => (
                <li key={task.id} className="py-1">
                  {task.title}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
