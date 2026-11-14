import React from 'react'
import { Icon } from '../icon/icon'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

interface Props {
  value: string
  onChange: (v: string) => void
  ref?: React.Ref<HTMLInputElement>
}

const SearchInput: React.FC<Props> = ({ value, onChange, ref }) => {
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange(evt.target.value)
  }

  return (
    <label className="flex rounded-lg border border-zinc-700 bg-zinc-900 ring-sky-500 hover:ring-2 has-focus-visible:border-sky-400 has-focus-visible:ring-focus-field">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search..."
        className="block bg-transparent p-2 text-zinc-50 focus:outline-none"
      />
      <div className="flex items-center px-2 text-zinc-400">
        <Icon icon={MagnifyingGlassIcon} size={16} />
      </div>
    </label>
  )
}

export { SearchInput }
