import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-lg font-medium">순서</h1>
      <form action={login} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="이메일"
          autoComplete="username"
          className="rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="비밀번호"
          autoComplete="current-password"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded bg-neutral-900 px-3 py-2 text-white">
          로그인
        </button>
      </form>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          이메일 또는 비밀번호가 맞지 않습니다.
        </p>
      ) : null}
    </main>
  )
}
