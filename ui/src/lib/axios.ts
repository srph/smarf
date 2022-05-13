import axios from 'axios'
import { config } from '~/src/config'

const instance = axios.create({
  baseURL: config.api.baseUrl
})

export { instance as axios }
