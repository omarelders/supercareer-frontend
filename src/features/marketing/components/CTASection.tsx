import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'

export default function CTASection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="w-full bg-slate-900 rounded-3xl py-20 flex flex-col items-center text-center mx-auto">
          <h2 className="text-6xl font-extrabold text-white leading-none max-w-4xl mb-6">
            Start your career journey today
          </h2>
          <p className="text-2xl text-slate-300 leading-7 max-w-3xl mb-12">
            Join the community of forward-thinking professionals and find the opportunities you truly deserve.
          </p>
          <Link
            to={ROUTES.login}
            className="w-96 h-20 bg-primary rounded-lg text-white font-semibold text-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  )
}
