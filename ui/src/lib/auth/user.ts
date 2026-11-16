import type { User } from '~/src/types/api'

type Names = Pick<User, 'name' | 'discord_username' | 'discord_global_name'>

/**
 * How we show who someone is: "Kier (@carebeyan)" when Discord has both a display name and a
 * username, otherwise just the one there is. Falls back to `name` for users who haven't signed in
 * since we started keeping both, or an API that doesn't send them yet.
 */
function displayName({ name, discord_username: username, discord_global_name: globalName }: Names) {
  if (!username) return name
  if (!globalName || globalName.toLowerCase() === username.toLowerCase()) return username
  return `${globalName} (@${username})`
}

export { displayName }
