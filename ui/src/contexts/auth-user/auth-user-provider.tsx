import React, { createContext, useContext, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery } from '~/src/contexts/query/query-provider'
import { User } from '~/src/types/api'
import { HttpError, onUnauthorized } from '~/src/lib/http'
import { useToken } from '~/src/lib/token'
import { useLatestValue } from '~/src/hooks/use-latest-value'
import { Button } from '~/src/components/button/button'
import { Container } from '~/src/components/container/container'
import { Spacer } from '~/src/components/spacer/spacer'
import { theme } from '~/src/theme'
import { useLogout } from './use-logout'

interface ContextType {
  user: User | null
  token: string
}

const AuthUserContext = createContext<ContextType>({ user: null, token: '' })

/**
 * Holds the logged-in user (from the auth/me query) and logs out on any 401. Children render once
 * the user is known, so routes can treat `user` as settled.
 */
const AuthUserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const token = useToken()

  const logout = useLogout()

  // Any 401 (outside login) means the token expired or was revoked.
  const logoutRef = useLatestValue(logout)
  useEffect(() => onUnauthorized(() => logoutRef.current()), [logoutRef])

  const me = useQuery<{ user: User }>('auth/me', {
    enabled: Boolean(token),
    // An expired token should send the user to login right away, not after retries.
    retry: false
  })

  if (token && me.isPending) {
    return null
  }

  // A 401 is handled by onUnauthorized above; anything else (API down, 500) gets a way out.
  if (token && me.isError && !(me.error instanceof HttpError && me.error.status === 401)) {
    return (
      <Container>
        <ErrorBox role="alert">
          <ErrorText>Couldn't load your account. Check your connection and try again.</ErrorText>
          <Spacer size={2} />
          <Button onClick={() => me.refetch()} disabled={me.isFetching}>
            Try again
          </Button>
          <Spacer size={1} />
          <Button variant="clear" onClick={logout}>
            Log out
          </Button>
        </ErrorBox>
      </Container>
    )
  }

  const user = token ? (me.data?.user ?? null) : null

  return <AuthUserContext.Provider value={{ user, token }}>{children}</AuthUserContext.Provider>
}

const ErrorBox = styled.div`
  max-width: 360px;
  margin: 96px auto 0;
  text-align: center;
`

const ErrorText = styled.p`
  margin: 0;
  color: ${theme.colors.text};
`

const useAuthUser = () => {
  return useContext(AuthUserContext)
}

export { useAuthUser, AuthUserProvider }
