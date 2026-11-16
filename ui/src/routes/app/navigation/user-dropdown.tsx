import React from 'react'
import { Link } from 'react-router'
import { AdjustmentsVerticalIcon, ArrowLeftStartOnRectangleIcon, BoltIcon, HomeIcon } from '@heroicons/react/20/solid'
import { Avatar } from '~/src/components/avatar/avatar'
import { Icon } from '~/src/components/icon/icon'
import { Menu } from '~/src/components/menu/menu'
import { PlainButton } from '~/src/components/plain-button/plain-button'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { displayName } from '~/src/lib/user'
import avatar from '~/src/assets/images/avatar.png'

const LINKS = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/account', icon: AdjustmentsVerticalIcon, label: 'Account Settings' },
  { to: '/about', icon: BoltIcon, label: 'About & Changelog' }
]

/** Who's signed in, the pages about them and the app, and Log out on its own below a rule. */
const UserDropdown: React.FC = () => {
  const { user } = useAuthUser()

  if (!user) return null

  return (
    <Menu.Root>
      {/* The avatar's ring lightens on hover and turns primary while the menu is open. */}
      <Menu.Trigger
        render={
          <PlainButton
            title="Account menu"
            className="rounded-full focus-visible:ring-focus [&>div]:transition-colors [&>div]:duration-200 hover:[&>div]:border-zinc-500 data-popup-open:[&>div]:border-primary-500"
          />
        }>
        <Avatar src={user.avatar || avatar} size="lg"></Avatar>
      </Menu.Trigger>

      <Menu.Popup side="bottom" align="end" sideOffset={24} className="w-64">
        <div className="flex items-center gap-3 p-3.5">
          <Avatar src={user.avatar || avatar} />

          <div className="min-w-0">
            <h4 className="truncate text-base font-bold">{displayName(user)}</h4>
            {user.email ? <span className="block truncate text-xs text-zinc-400">{user.email}</span> : null}
          </div>
        </div>

        <Menu.Separator />

        <Menu.Group className="p-1.5">
          {LINKS.map((link) => (
            <Menu.LinkItem key={link.to} render={<Link to={link.to} />}>
              <Icon icon={link.icon} />
              {link.label}
            </Menu.LinkItem>
          ))}
        </Menu.Group>

        <Menu.Separator />

        <Menu.Group className="p-1.5">
          <Menu.LinkItem
            render={<Link to="/logout" />}
            className="data-highlighted:bg-red-500/12! data-highlighted:text-red-300! data-highlighted:[&_svg]:text-red-400!">
            <Icon icon={ArrowLeftStartOnRectangleIcon} />
            Log out
          </Menu.LinkItem>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Root>
  )
}

export { UserDropdown }
