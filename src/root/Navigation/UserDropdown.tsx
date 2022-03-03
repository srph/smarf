import React from 'react'
import styled from 'styled-components'
import { theme } from '~/src/theme'
import { Avatar, Icon } from '~/src/components'
import avatar from '~/src/public/images/avatar.png'

const UserDropdown: React.FC = () => {
  return (
    <Container>
      <Heading>
        <Avatar src={avatar} />

        <UserInfo>
          <UserInfoName>Kier Borromeo</UserInfoName>
          <UserInfoEmail>your@email.com</UserInfoEmail>
        </UserInfo>
      </Heading>

      <LinkItem href="#">
        <LinkItemIcon>
          <Icon name="adjustments" />
        </LinkItemIcon>

        <LinkItemText>Account Settings</LinkItemText>
      </LinkItem>
      <LinkItem href="#">
        <LinkItemIcon>
          <Icon name="lightning-bolt" />
        </LinkItemIcon>

        <LinkItemText>About &amp; Changelog</LinkItemText>
      </LinkItem>
      <LinkItem href="#">
        <LinkItemIcon>
          <Icon name="arrow-left" />
        </LinkItemIcon>

        <LinkItemText>Logout</LinkItemText>
      </LinkItem>
    </Container>
  )
}

const Container = styled.div`
  position: absolute;
  right: 0;
  top: 120px;
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

const LinkItem = styled.a`
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
