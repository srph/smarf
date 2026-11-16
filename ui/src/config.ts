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
    /** The showcase film (showcase/smarf-showcase.mp4, hosted elsewhere). Unset hides the login page's link to it. */
    videoUrl: import.meta.env.VITE_SHOWCASE_URL || null
  }
}

export { config }
