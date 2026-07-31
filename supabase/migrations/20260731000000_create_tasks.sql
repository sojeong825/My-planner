-- 할 일 하나가 도메인의 전부다. 테이블도 하나다.

create type public.task_bucket as enum ('today', 'week', 'someday');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- trim() 은 기본값이 ASCII 공백(0x20)뿐이라 탭이나 줄바꿈만으로 된 제목을 통과시킨다.
  -- 잘라낼 문자를 명시해야 실제로 "내용 없는 제목"을 막는다.
  title text not null check (length(btrim(title, E' \t\n\r')) > 0),
  bucket public.task_bucket not null default 'today',
  -- 분수 순위. 정수가 아니라 실수여야 두 항목 사이에 끼워 넣을 수 있다.
  position double precision not null,
  -- 현재 bucket으로 들어온 시각. "오래됨" 표시를 계산하는 기준이다.
  bucketed_at timestamptz not null default now(),
  done_at timestamptz,
  created_at timestamptz not null default now()
);

-- 목록은 항상 (내 것) → (그룹별) → (순서대로) 로 읽는다.
create index tasks_user_bucket_position_idx
  on public.tasks (user_id, bucket, position);

alter table public.tasks enable row level security;

-- 정책마다 TO authenticated 와 소유권 조건을 함께 둔다.
-- TO authenticated 만으로는 로그인한 아무나 남의 행을 읽는다.
create policy "tasks_select_own" on public.tasks
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE 는 USING 과 WITH CHECK 를 둘 다 가져야 한다.
-- WITH CHECK 가 없으면 행의 user_id 를 남에게 넘길 수 있다.
create policy "tasks_update_own" on public.tasks
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Data API 노출. 새 테이블이 자동으로 노출되지 않는 설정일 수 있으므로 명시한다.
grant select, insert, update, delete on public.tasks to authenticated;
