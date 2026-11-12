import React from 'react'
import { Link } from 'react-router'
import { Menu } from '@base-ui/react/menu'
import { AdjustmentsVerticalIcon, ArrowLeftIcon, BoltIcon, HomeIcon } from '@heroicons/react/20/solid'
import { Avatar } from '~/src/components/avatar/avatar'
import { Icon } from '~/src/components/icon/icon'
import { PlainButton } from '~/src/components/plain-button/plain-button'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import avatar from '~/src/assets/images/avatar.png'

const LINKS = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/account', icon: AdjustmentsVerticalIcon, label: 'Account Settings' },
  { to: '/about', icon: BoltIcon, label: 'About & Changelog' },
  { to: '/logout', icon: ArrowLeftIcon, label: 'Logout' }
]

const UserDropdown: React.FC = () => {
  const { user } = useAuthUser()

  if (!user) return null

  return (
    <Menu.Root>
      <Menu.Trigger render={<PlainButton title="Account menu" />}>
        <Avatar src={user.avatar || avatar} size="lg"></Avatar>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={24} className="z-(--z-user-dropdown)">
          <Menu.Popup className="w-60 rounded border border-zinc-700 bg-zinc-900 outline-none">
            <div className="flex items-center border-b border-zinc-700 p-4">
              <Avatar src={user.avatar || avatar} />

              <div className="ml-4">
                <h4 className="font-bold">{user.name}</h4>
                <span className="text-xs text-zinc-400">{user.email}</span>
              </div>
            </div>

            {LINKS.map((link) => (
              <Menu.LinkItem
                key={link.to}
                closeOnClick
                render={<Link to={link.to} />}
                className="flex cursor-pointer items-center border-zinc-700 p-4 transition-colors duration-200 outline-none not-last:border-b data-highlighted:bg-zinc-700">
                <div className="mr-4 text-zinc-400">
                  <Icon icon={link.icon} />
                </div>

                <div>{link.label}</div>
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

export { UserDropdown }
