import { createClient } from './createClient'

export async function getUserSettings() {
	const supabase = await createClient()

	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser()

	if (userError) throw userError
	if (!user) return null

	const { data, error } = await supabase
		.from('usersettings')
		.select('config')
		.eq('user_id', user.id)
		.single()

	if (error) throw error

	return data?.config || null
}
