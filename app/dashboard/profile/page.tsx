import { createClient } from '@/lib/supabase/server'
import { ProfileEditor } from '@/components/profile-editor'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <ProfileEditor
      userId={user!.id}
      email={user!.email ?? ''}
      initialProfile={profile ?? { id: user!.id, name: '', created_at: '', updated_at: '' }}
    />
  )
}
