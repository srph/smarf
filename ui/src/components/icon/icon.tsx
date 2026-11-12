import React from 'react'

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

interface IconProps {
  // A heroicon, imported directly, e.g. `import { TrashIcon } from '@heroicons/react/20/solid'`.
  icon: IconComponent
  size?: number
}

const Icon: React.FC<IconProps> = ({ icon: SvgIcon, size = 18 }) => {
  return <SvgIcon aria-hidden="true" style={{ height: size, width: size }} />
}

export { Icon, type IconProps, type IconComponent }
