import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Button } from '~/src/components/button/button'
import { Container } from '~/src/components/container/container'
import { Logo } from '~/src/components/logo/logo'
import { Link } from 'react-router'
import { SquaresPlusIcon } from '@heroicons/react/20/solid'
import { UserDropdown } from './user-dropdown'
import { useBoardList } from '~/src/contexts/board-list/board-list-provider'
import { useHeroList } from '~/src/contexts/hero-list/hero-list-provider'

const Navigation: React.FC = () => {
  const { createBoard, isBoardCreating } = useBoardList()
  const { isLoading: isHeroListLoading } = useHeroList()

  return (
    <Nav>
      <NavAccent />

      <Container>
        <NavContainer>
          <NavLogoLink to="/">
            <Logo />
          </NavLogoLink>

          <NavMenu>
            <NavMenuSection>
              <Button
                icon={SquaresPlusIcon}
                disabled={isBoardCreating || isHeroListLoading}
                onClick={() => createBoard()}>
                New Board
              </Button>
            </NavMenuSection>

            <UserDropdown />
          </NavMenu>
        </NavContainer>
      </Container>
    </Nav>
  )
}

const NavAccent = styled.div`
  border-top: 4px solid ${theme.colors.indigo[500]};
  border-image: linear-gradient(90deg, ${theme.colors.indigo[500]}, ${theme.colors.indigo[300]}) 1;
`

const Nav = styled.div`
  margin-bottom: 48px;
  border-bottom: 1px solid ${theme.colors.neutral[800]};
`

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  padding-bottom: 24px;
`

const NavMenu = styled.div`
  display: flex;
  align-items: center;
`

const NavMenuSection = styled.div`
  margin-right: 24px;
`

const NavLogoLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`

export { Navigation }
