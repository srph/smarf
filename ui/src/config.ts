const config = {
  app: {
    title: 'Smarf',
    description: 'Dota 2 Hero Organizer'
  },

  api: {
    baseUrl: import.meta.env.API_URL
  },

  oauth: {
    cookieKey: 'smarf-oauth-token'
  },

  discord: {
    clientId: import.meta.env.DISCORD_CLIENT_ID
  }
}

export { config }
