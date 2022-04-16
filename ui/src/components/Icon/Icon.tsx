import React from 'react'
import { startCase } from 'lodash'
import * as Icons from '@heroicons/react/solid'

export interface IconProps {
  name: string
  height?: number
  width?: number
}

const Icon: React.FC<IconProps> = ({ name, height, width }) => {
  const iconNameInStartCase: string = startCase(name).replace(/\s/g, '')
  const iconName = `${iconNameInStartCase}Icon` as IconProps['name']
  const iconHeight = height || width || 18
  const iconWidth = width || height || 18
  const SelectedIcon = Icons[iconName]

  return <SelectedIcon style={{ height: iconHeight, width: iconWidth }} />
}

export { Icon }
