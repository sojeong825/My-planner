'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-3 p-6">
      <p>목록을 불러오지 못했습니다.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-neutral-900 px-3 py-2 text-sm text-white"
      >
        다시 시도
      </button>
    </main>
  )
}
