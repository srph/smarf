import React from 'react'
import { Link } from 'react-router'
import { ArrowLeftStartOnRectangleIcon, HomeIcon } from '@heroicons/react/20/solid'
import { Avatar } from '~/src/components/avatar/avatar'
import { GitHubIcon, XIcon } from '~/src/components/icon/brand-icons'
import { Icon } from '~/src/components/icon/icon'
import { Menu } from '~/src/components/menu/menu'
import { PlainButton } from '~/src/components/plain-button/plain-button'
import { useAuthUser } from '~/src/contexts/auth-user/auth-user-provider'
import { displayName } from '~/src/lib/user'
import avatar from '~/src/assets/images/avatar.png'

// The brand marks fill their box, so they sit a step smaller than heroicons to look the same weight.
const EXTERNAL_LINKS = [
  { href: 'https://github.com/srph/smarf', icon: GitHubIcon, size: 16, label: 'GitHub' },
  { href: 'https://x.com/_srph', icon: XIcon, size: 14, label: 'Twitter (X)' }
]

/** Who's signed in, Home and the app's GitHub and X (in a new tab), and Log out on its own below a rule. */
const UserDropdown: React.FC = () => {
  const { user } = useAuthUser()

  if (!user) return null

  return (
    <Menu.Root>
      {/* Just the avatar: it brightens on hover and takes a primary ring, with a gap, while the menu is open. */}
      <Menu.Trigger
        render={
          <PlainButton
            title="Account menu"
            className="block rounded-full transition-[filter,box-shadow] duration-200 hover:brightness-110 focus-visible:ring-focus data-popup-open:ring-2 data-popup-open:ring-primary-500 data-popup-open:ring-offset-2 data-popup-open:ring-offset-nav"
          />
        }>
        <Avatar src={user.avatar || avatar} size="lg"></Avatar>
      </Menu.Trigger>

      <Menu.Popup side="bottom" align="end" sideOffset={12} className="w-64">
        <div className="flex items-center gap-3 p-3.5">
          <Avatar src={user.avatar || avatar} />

          <div className="min-w-0">
            <h4 className="truncate text-base font-bold">{displayName(user)}</h4>
            {user.email ? <span className="block truncate text-xs text-zinc-400">{user.email}</span> : null}
          </div>
        </div>

        <Menu.Separator />

        <Menu.Group className="p-1.5">
          <Menu.LinkItem render={<Link to="/" />}>
            <Icon icon={HomeIcon} />
            Home
          </Menu.LinkItem>

          {EXTERNAL_LINKS.map((link) => (
            <Menu.LinkItem
              key={link.href}
              // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the label below into this <a>.
              render={<a href={link.href} target="_blank" rel="noreferrer" />}>
              <span className="flex size-4.5 items-center justify-center">
                <Icon icon={link.icon} size={link.size} />
              </span>
              {link.label}
            </Menu.LinkItem>
          ))}
        </Menu.Group>

        <Menu.Separator />

        <Menu.Group className="p-1.5">
          <Menu.LinkItem
            render={<Link to="/logout" />}
            className="data-highlighted:bg-red-500/12 data-highlighted:text-red-300 data-highlighted:[&_svg]:text-red-400">
            <Icon icon={ArrowLeftStartOnRectangleIcon} />
            Log out
          </Menu.LinkItem>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Root>
  )
}

export { UserDropdown }
