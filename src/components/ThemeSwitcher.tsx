"use client"
import React, { useEffect, useState } from 'react'

const ThemeSwitcher = () => {
  const [dark, setDark]= useState(false)
  useEffect(()=>
    {
    const savedTheme=localStorage.getItem('item')
    if(savedTheme=='dark-mode'){
      setDark(true)
      document.body.classList.add('dark-mode')
    }
  },[]);
  useEffect(()=>{
    if(dark){
      document.body.classList.add('dark-mode')
        localStorage.setItem('theme', 'darak-mode')

    }else{
      document.body.classList.remove('dark-mode')
              localStorage.setItem('theme', '')

    }
  })
  return (
    <div>
      <button id='theme-switcher'className='theme-switcher' onClick={()=>setDark(!dark)}>Ganti Themes</button>
    </div>
  )
}

export default ThemeSwitcher
