import { AxiosError } from 'axios'
import { axios } from './axios'
import { InterceptorFactory } from './types'

const expiredToken: InterceptorFactory = {
  setup: (auth): number => {
    return axios.interceptors.response.use(null, (err: AxiosError) => {
      console.log('hey')

      if (err?.response.status === 401 && !err.config.url.includes('/oauth/token')) {
        auth.logout()
      }

      return Promise.reject(err)
    })
  }
}

export { expiredToken }
