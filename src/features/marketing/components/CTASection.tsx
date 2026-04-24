import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export default function CTASection() {
  return (
    <section className="bg-white py-12 md:py-20 px-4 md:px-0">
      <div className="max-w-7xl mx-auto px-8">
        <div className="w-full bg-slate-900 rounded-3xl py-20 flex flex-col items-center text-center mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight md:leading-none max-w-4xl mb-6 px-4">
            Start your career journey today
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed md:leading-7 max-w-3xl mb-10 px-4">
            Join the community of forward-thinking professionals and find the opportunities you truly deserve.
          </p>
          <Link
            to={ROUTES.login}
            className="w-[90%] md:w-96 h-16 md:h-20 bg-primary rounded-lg text-white font-semibold text-lg md:text-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  )
}
