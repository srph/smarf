import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Button, Container, Logo } from '~/src/components'
import { Link } from 'react-router-dom'
import { UserDropdown } from './UserDropdown'
import { useBoardList } from '~/src/contexts/BoardList'
import { useHeroList } from '~/src/contexts/HeroList'

const Navigation: React.FC = () => {
  const { createBoard, isBoardCreating } = useBoardList()
  const { isLoading: isHeroListLoading } = useHeroList()

  return (
    <Nav>
      <Container>
        <NavContainer>
          <NavLogoLink to="/">
            <Logo />
          </NavLogoLink>

          <NavMenu>
            <NavMenuSection>
              <Button
                icon="view-grid-add"
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
