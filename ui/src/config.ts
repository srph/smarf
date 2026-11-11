const config = {
  app: {
    title: 'Smarf',
    description: 'Dota 2 Hero Organizer'
  },

  api: {
    baseUrl: import.meta.env.API_URL
  },

  oauth: {
    cookieKey: 'smarf-oauth-token',
    clientId: import.meta.env.OAUTH_CLIENT_ID,
    clientSecret: import.meta.env.OAUTH_CLIENT_SECRET
  }
}

export { config }
