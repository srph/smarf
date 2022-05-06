import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Avatar, Button, Container, Logo, PlainButton } from '~/src/components'
import avatar from '~/src/public/images/avatar.png'
import { UserDropdown } from './UserDropdown'
import { useBoardList } from '~/src/contexts/BoardList'
import { useHeroList } from '~/src/contexts/HeroList'

const Navigation: React.FC = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const { createBoard, isBoardCreating } = useBoardList()
  const { isLoading: isHeroListLoading } = useHeroList()

  return (
    <Nav>
      <Container>
        <NavContainer>
          <Logo />

          <NavMenu>
            <NavMenuSection>
              <Button
                icon="view-grid-add"
                disabled={isBoardCreating || isHeroListLoading}
                onClick={() => createBoard()}>
                New Board
              </Button>
            </NavMenuSection>

            <PlainButton onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
              <Avatar src={avatar} size="lg"></Avatar>
            </PlainButton>
          </NavMenu>
        </NavContainer>

        {isUserDropdownOpen && <UserDropdown />}
      </Container>
    </Nav>
  )
}

const Nav = styled.div`
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

export { Navigation }
