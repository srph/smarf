import { AxiosRequestConfig as BaseAxiosRequestConfig } from 'axios'
import { AxiosRequestConfig, InterceptorFactory } from './types'

const appInit: InterceptorFactory = {
  setup: (instance): number => {
    return instance.interceptors.request.use((config: BaseAxiosRequestConfig) => {
      if (!('app' in config)) {
        ;(<AxiosRequestConfig>config).app = {}
      }

      return config as AxiosRequestConfig
    })
  }
}

export { appInit }
