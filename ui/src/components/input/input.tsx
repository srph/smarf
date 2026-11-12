import React from 'react'

interface Props {
  label?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  ref?: React.Ref<HTMLInputElement>
}

const Input: React.FC<Props> = ({ ref, ...props }) => {
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(evt.target.value)
  }

  return (
    <div>
      {props.label && <label className="mb-2 block w-full text-xs font-bold">{props.label}</label>}
      <input
        ref={ref}
        type={props.type || 'text'}
        value={props.value}
        onChange={handleChange}
        placeholder={props.placeholder}
        className="flex h-8 w-full items-center rounded border border-zinc-700 bg-transparent p-2 text-zinc-50"
      />
    </div>
  )
}

export { Input }
