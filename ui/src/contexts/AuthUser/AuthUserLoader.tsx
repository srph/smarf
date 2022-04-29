import React, { useEffect } from 'react'
import { useAuthUser } from './'
import { useRequest } from '../Axios'

const AuthUserLoader: React.FC = ({ children }) => {
  const { token, setUser } = useAuthUser()

  const { data, isLoading } = useRequest('user', {
    skip: !token
  })

  useEffect(() => {
    if (!token || !data) return
    setUser(data)
  }, [data])

  if (token && isLoading) {
    return null
  }

  return <>{children}</>
}

export { AuthUserLoader }
