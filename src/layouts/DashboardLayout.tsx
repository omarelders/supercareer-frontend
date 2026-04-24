import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import BottomNav from './BottomNav'
import AnimatedContent from '@/components/reactbits/AnimatedContent'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />


      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main id="snap-main-container" className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 md:pt-10 pb-20 md:pb-8">
          <AnimatedContent distance={24} duration={0.6} ease="power3.out" className="w-full">
            <Outlet />
          </AnimatedContent>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
