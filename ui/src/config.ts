const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api'
  },

  oauth: {
    cookieKey: 'smarf-oauth-token',
    clientId: process.env.OAUTH_CLIENT_ID || '962f255c-a518-44ed-84a2-fcc3a0a18201',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '6Tn9T8kh2yaz4o2nNllk3vKxYSJo9fRmH7SOXvzW'
  }
}

export { config }
