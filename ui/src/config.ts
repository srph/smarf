const config = {
  api: {
    baseUrl: process.env.API_BASE_URL
  },

  oauth: {
    cookieKey: 'smarf-oauth-token',
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET
  }
}

export { config }
