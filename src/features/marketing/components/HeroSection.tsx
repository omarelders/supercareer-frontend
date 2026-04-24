import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export default function HeroSection() {
  return (
    <section className="relative pt-10 pb-32 bg-muted overflow-hidden">
      <div
        className="absolute inset-x-0 md:inset-x-20 top-28 bottom-0 pointer-events-none"
        style={{ background: 'radial-gradient(119.6% 182.3% at 100% 0%, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0) 100%), radial-gradient(119.6% 182.3% at 0% 100%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-marketing-hero gap-12 lg:gap-24 items-center relative z-10">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-sky-100 px-3 py-1 rounded-full w-fit">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-sky-700 text-xs font-bold uppercase tracking-wider">AI-POWERED MATCHING HUB</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-none md:leading-none tracking-tighter">
            The Future of<br />Super Career
          </h1>

          <p className="text-xl text-muted-foreground leading-7 max-w-xl">
            Stop searching, start matching. Our AI crawls thousands of sources daily to find high-intent roles that fit your skill profile with 90%+ accuracy.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mt-2">
            <Link
              to={ROUTES.login}
              className="bg-primary text-white font-semibold text-lg px-8 h-14 md:h-16 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-blue-700"
              style={{ boxShadow: '0px 20px 25px -5px rgba(36, 172, 235, 0.3), 0px 8px 10px -6px rgba(36, 172, 235, 0.3)' }}
            >
              Get Started Free <ArrowRight size={20} className="ml-1" strokeWidth={2} />
            </Link>
            <button className="bg-white border border-blue-600 text-primary font-semibold text-lg px-8 h-14 md:h-16 rounded-xl hover:bg-blue-50 transition-colors">
              See How It Works
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2 pr-0 md:pr-72">
            <div className="flex">
              <img src="https://ui-avatars.com/api/?name=A&background=random&color=fff&size=32" className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0" />
              <img src="https://ui-avatars.com/api/?name=B&background=random&color=fff&size=32" className="w-8 h-8 rounded-full border-2 border-white -ml-2" />
              <img src="https://ui-avatars.com/api/?name=C&background=random&color=fff&size=32" className="w-8 h-8 rounded-full border-2 border-white -ml-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Joined by 10,000+ professionals this month
            </p>
          </div>
        </div>

        <div className="relative flex justify-end">
          <div
            className="w-full max-w-lg h-96 rounded-3xl p-6 flex flex-col gap-6"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(5px)',
              boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center justify-between w-full max-w-md">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="font-mono text-xs text-muted-foreground">matching_algorithm.py</div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
              <div className="w-full h-12 bg-secondary rounded-lg" />

              <div className="w-full h-32 rounded-xl flex flex-col items-center justify-center border" style={{ background: 'rgba(36, 172, 235, 0.05)', borderColor: 'rgba(36, 172, 235, 0.1)' }}>
                <div className="text-3xl font-bold text-primary leading-9">98% Match</div>
                <div className="text-xs text-muted-foreground tracking-widest uppercase mt-2">CONFIDENCE SCORE</div>
              </div>

              <div className="flex gap-4 w-full h-20">
                <div className="flex-1 bg-background rounded-lg" />
                <div className="flex-1 bg-background rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
