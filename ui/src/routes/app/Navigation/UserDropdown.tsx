import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router'
import { Menu } from '@base-ui/react/menu'
import { theme } from '~/src/theme'
import { Avatar, Icon, PlainButton } from '~/src/components'
import { useAuthUser } from '~/src/contexts/AuthUser'
import avatar from '~/src/assets/images/avatar.png'

const LINKS = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/account', icon: 'adjustments', label: 'Account Settings' },
  { to: '/about', icon: 'lightning-bolt', label: 'About & Changelog' },
  { to: '/logout', icon: 'arrow-left', label: 'Logout' }
]

const UserDropdown: React.FC = () => {
  const { user } = useAuthUser()

  return (
    <Menu.Root>
      <Menu.Trigger render={<PlainButton title="Account menu" />}>
        <Avatar src={user.avatar || avatar} size="lg"></Avatar>
      </Menu.Trigger>

      <Menu.Portal>
        <Positioner side="bottom" align="end" sideOffset={24}>
          <Container>
            <Heading>
              <Avatar src={user.avatar || avatar} />

              <UserInfo>
                <UserInfoName>{user.name}</UserInfoName>
                <UserInfoEmail>{user.email}</UserInfoEmail>
              </UserInfo>
            </Heading>

            {LINKS.map((link) => (
              <LinkItem key={link.to} closeOnClick render={<Link to={link.to} />}>
                <LinkItemIcon>
                  <Icon name={link.icon} />
                </LinkItemIcon>

                <LinkItemText>{link.label}</LinkItemText>
              </LinkItem>
            ))}
          </Container>
        </Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

const Positioner = styled(Menu.Positioner)`
  z-index: ${theme.zIndex.userDropdown};
`

const Container = styled(Menu.Popup)`
  width: 240px;
  outline: 0;
  background: ${theme.colors.neutral[900]};
  border-radius: 4px;
  border: 1px solid ${theme.colors.neutral[700]};
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
  font-size: ${theme.fontSizes.sm}px;
`

const LinkItem = styled(Menu.LinkItem)`
  display: flex;
  align-items: center;
  padding: 16px;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: 200ms background ease;

  outline: 0;

  &[data-highlighted] {
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
  font-size: ${theme.fontSizes.md}px;
  color: ${theme.colors.text};
`

export { UserDropdown }
