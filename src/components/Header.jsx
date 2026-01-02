import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeSwitcher from './ThemeSwitcher'
function Header() {
  return (
    <header className="header">
      <nav>
        <div className="logo">
          <Link href="/">
            <Image src="vercel.svg" width={30} height={30} alt='Logo' />
          </Link>
        </div>
        <div className="nav-links">
          <Link href='/'>Home</Link>
          <Link href='/about'>About</Link>
          <Link href='/posts'>Post</Link>
        </div>
        <ThemeSwitcher />
      </nav>

    </header>
  )
}

export default Header
