import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { theme } from '~/src/theme'
import { Avatar, Icon, Popover, PlainButton } from '~/src/components'
import { useAuthUser } from '~/src/contexts/AuthUser'
import avatar from '~/src/public/images/avatar.png'

const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthUser()

  const trigger = (
    <PlainButton>
      <Avatar src={user.avatar || avatar} size="lg"></Avatar>
    </PlainButton>
  )

  return (
    <Popover open={isOpen} onChangeOpen={setIsOpen} trigger={trigger} placement="bottom-end" offset={{ x: 0, y: 24 }}>
      <Container>
        <Heading>
          <Avatar src={user.avatar || avatar} />

          <UserInfo>
            <UserInfoName>{user.name}</UserInfoName>
            <UserInfoEmail>{user.email}</UserInfoEmail>
          </UserInfo>
        </Heading>

        <LinkItem to="/">
          <LinkItemIcon>
            <Icon name="home" />
          </LinkItemIcon>

          <LinkItemText>Home</LinkItemText>
        </LinkItem>

        <LinkItem to="/account">
          <LinkItemIcon>
            <Icon name="adjustments" />
          </LinkItemIcon>

          <LinkItemText>Account Settings</LinkItemText>
        </LinkItem>

        <LinkItem to="/about">
          <LinkItemIcon>
            <Icon name="lightning-bolt" />
          </LinkItemIcon>

          <LinkItemText>About &amp; Changelog</LinkItemText>
        </LinkItem>
        <LinkItem to="/logout">
          <LinkItemIcon>
            <Icon name="arrow-left" />
          </LinkItemIcon>

          <LinkItemText>Logout</LinkItemText>
        </LinkItem>
      </Container>
    </Popover>
  )
}

const Container = styled.div`
  width: 240px;
  background: ${theme.colors.neutral[900]};
  border-radius: 4px;
  border: 1px solid ${theme.colors.neutral[700]};
  z-index: ${theme.zIndex.userDropdown};
`

const Heading = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${theme.colors.neutral[700]};
`

const UserInfo = styled.div`
  margin-left: 16px;
`

const UserInfoName = styled.h4`
  margin: 0;
`

const UserInfoEmail = styled.span`
  color: ${theme.colors.neutral[400]};
  font-size: ${theme.fontSizes.sm};
`

const LinkItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: 200ms background ease;

  &:hover {
    background: ${theme.colors.neutral[700]};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.neutral[700]};
  }
`

const LinkItemIcon = styled.div`
  margin-right: 16px;
  color: ${theme.colors.neutral[400]};
`

const LinkItemText = styled.div`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.text};
`

export { UserDropdown }
