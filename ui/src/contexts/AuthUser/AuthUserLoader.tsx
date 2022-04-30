import React, { useEffect } from 'react'
import { useAuthUser } from './'
import { useQuery } from '~/src/contexts/Query'

const AuthUserLoader: React.FC = ({ children }) => {
  const { token, setUser } = useAuthUser()

  const { data, isLoading } = useQuery('user', {
    enabled: Boolean(token)
  })

  useEffect(() => {
    if (!token || !data) return
    setUser(data)
  }, [token, data])

  if (token && isLoading) {
    return null
  }

  return <>{children}</>
}

export { AuthUserLoader }
