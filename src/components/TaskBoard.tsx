'use client'

import { useCallback, useRef, useState } from 'react'
import { rankBetween } from '@/lib/ranking'
import { isStale } from '@/lib/staleness'
import {
  addTask,
  deleteTask,
  renameTask,
  restoreTask,
  setDone,
} from '@/lib/tasks/actions'
import { BUCKETS, BUCKET_LABELS, type ActionResult, type Task } from '@/lib/tasks/types'
import { CompletedSection } from './CompletedSection'
import { QuickAdd } from './QuickAdd'
import { TaskItem } from './TaskItem'
import { Toast } from './Toast'

type ToastState = {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [toast, setToast] = useState<ToastState | null>(null)
  const tasksRef = useRef<Task[]>(initialTasks)

  const apply = useCallback((updater: (prev: Task[]) => Task[]) => {
    tasksRef.current = updater(tasksRef.current)
    setTasks(tasksRef.current)
  }, [])

  // Toast 의 자동 사라짐 타이머가 이 참조에 걸린다. 렌더마다 새로 만들면
  // 타이머가 매번 리셋되어 토스트가 사라지지 않는다. 반드시 고정해 둔다.
  const dismissToast = useCallback(() => setToast(null), [])

  const mutate = useCallback(
    async (updater: (prev: Task[]) => Task[], run: () => Promise<ActionResult<null>>) => {
      const snapshot = tasksRef.current
      apply(updater)
      const result = await run()
      if (!result.ok) {
        tasksRef.current = snapshot
        setTasks(snapshot)
        setToast({ message: result.error })
      }
    },
    [apply]
  )

  const handleAdd = useCallback(
    (title: string) => {
      const id = crypto.randomUUID()
      const positions = tasksRef.current
        .filter((t) => t.bucket === 'today')
        .map((t) => t.position)
      const position = rankBetween(positions.length > 0 ? Math.max(...positions) : null, null)
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

  const handleToggle = useCallback(
    (id: string, done: boolean) => {
      // bucket 과 position 은 건드리지 않는다.
      // 그래야 완료를 취소했을 때 별도 기록 없이 원래 자리로 돌아온다.
      const doneAt = done ? new Date().toISOString() : null
      void mutate(
        (prev) => prev.map((t) => (t.id === id ? { ...t, doneAt } : t)),
        () => setDone({ id, done })
      )
    },
    [mutate]
  )

  const handleRename = useCallback(
    (id: string, title: string) => {
      void mutate(
        (prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)),
        () => renameTask({ id, title })
      )
    },
    [mutate]
  )

  const handleDelete = useCallback(
    (id: string) => {
      const removed = tasksRef.current.find((t) => t.id === id)
      if (!removed) return

      void mutate(
        (prev) => prev.filter((t) => t.id !== id),
        () => deleteTask({ id })
      )

      // 확인 창은 마찰이고, 되돌리기는 마찰이 아니다.
      setToast({
        message: '삭제했습니다',
        actionLabel: '실행 취소',
        onAction: () => {
          setToast(null)
          void mutate(
            (prev) => [...prev, removed],
            () => restoreTask({ task: removed })
          )
        },
      })
    },
    [mutate]
  )

  const now = new Date()
  const completed = tasks
    .filter((t) => t.doneAt !== null)
    .sort((a, b) => (a.doneAt! < b.doneAt! ? 1 : -1))

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
                <TaskItem
                  key={task.id}
                  task={task}
                  stale={isStale(task, now)}
                  onToggle={(done) => handleToggle(task.id, done)}
                  onRename={(title) => handleRename(task.id, title)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </ul>
          </section>
        )
      })}

      <CompletedSection tasks={completed} onToggle={handleToggle} />

      {toast ? (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  )
}
