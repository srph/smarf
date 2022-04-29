import { InterceptorFactory } from './types'

const oauthToken: InterceptorFactory = {
  setup: (instance, auth): number => {
    return instance.interceptors.request.use((config) => {
      if (auth.token != null) {
        config.headers['Authorization'] = `Bearer ${auth.token}`
      }

      return config
    })
  }
}

export { oauthToken }
