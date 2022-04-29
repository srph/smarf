import { AxiosError } from 'axios'
import { InterceptorFactory } from './types'

const expiredToken: InterceptorFactory = {
  setup: (instance, auth): number => {
    return instance.interceptors.response.use(null, (err: AxiosError) => {
      // if (err?.response.status === 401 && !err.config.url.includes('/oauth/token')) {
      //   auth.logout()
      // }

      return Promise.reject(err)
    })
  }
}

export { expiredToken }
