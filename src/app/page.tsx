import { redirect } from 'next/navigation'
import { TaskBoard } from '@/components/TaskBoard'
import { createClient } from '@/lib/supabase/server'
import { listTasks } from '@/lib/tasks/queries'

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect('/login')
  }

  const tasks = await listTasks(supabase)

  return <TaskBoard initialTasks={tasks} />
}
