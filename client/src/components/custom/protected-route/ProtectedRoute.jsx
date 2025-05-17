
import React from 'react'
import Navigation from '../navigation/Navigation'
import { Outlet } from 'react-router-dom'
import MobileDrawer from '../drawer/MobileDrawer'

function ProtectedRoute() {
  return (
    <div className='flex max-lg:flex-col'>
        <div className='hidden lg:flex lg:flex-[1.8] ring-1 ring-slate-200 min-h-screen'>
            <Navigation />
        </div>
        <div className='lg:hidden flex justify-end mr-4 mt-4 cursor-pointer'>
          <MobileDrawer/>
        </div>
        <div className='flex-[10.2] min-h-screen'>
        <Outlet />
        </div>
    </div>
  )
}

export default ProtectedRoute