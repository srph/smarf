import { axios } from './axios'
import { InterceptorFactory } from './types'

const oauthToken: InterceptorFactory = {
  setup: (auth): number => {
    return axios.interceptors.request.use((config) => {
      if (auth.token != null) {
        config.headers['Authorization'] = `Bearer ${auth.token}`
      }

      return config
    })
  }
}

export { oauthToken }
