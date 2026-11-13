const config = {
  app: {
    title: 'Smarf',
    description: 'Dota 2 Hero Organizer'
  },

  api: {
    baseUrl: import.meta.env.VITE_API_URL
  },

  oauth: {
    cookieKey: 'smarf-oauth-token'
  },

  discord: {
    clientId: import.meta.env.VITE_DISCORD_CLIENT_ID
  }
}

export { config }
