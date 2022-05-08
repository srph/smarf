const config = {
  app: {
    title: 'Smarf',
    description: 'Dota 2 Hero Organizer'
  },

  api: {
    baseUrl: process.env.API_URL
  },

  oauth: {
    cookieKey: 'smarf-oauth-token',
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET
  }
}

export { config }
