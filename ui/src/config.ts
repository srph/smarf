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
  },

  showcase: {
    /** The showcase film, a 720p copy of showcase/smarf-showcase.mp4 in public/. */
    videoUrl: '/showcase.mp4'
  }
}

export { config }
