import React from 'react'
import logo from '~/src/assets/images/logo.png'

const Logo = () => {
  return (
    <div className="flex items-center">
      <img src={logo} alt="" className="mr-4" />
      <h1 className="text-lg font-extrabold tracking-wide uppercase">Smarf</h1>
    </div>
  )
}

export { Logo }
