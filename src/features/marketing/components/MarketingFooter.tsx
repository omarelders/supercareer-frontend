import { Linkedin, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { ROUTES } from '@/config/routes'

const PLATFORM_LINKS = ['Features', 'Integrations', 'Security', 'Marketplace']
const COMPANY_LINKS = ['About Us', 'Careers', 'Press', 'Contact']
const LEGAL_LINKS = ['Privacy Policy', 'Terms of Service', 'Cookie Policy']

export default function MarketingFooter() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-20">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="flex flex-col gap-6 w-full md:w-80">
            <Link to={ROUTES.home}>
              <Logo />
            </Link>
            <p className="text-base text-muted-foreground leading-6">
              Empowering the global workforce with intelligent tools and premium connections.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                <Twitter size={18} fill="currentColor" stroke="none" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                <Linkedin size={18} fill="currentColor" stroke="none" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6 w-52">
            <p className="text-base font-bold text-foreground">Platform</p>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              {PLATFORM_LINKS.map((link) => (
                <a key={link} href="#" className="hover:text-primary leading-5">
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 w-52">
            <p className="text-base font-bold text-foreground">Company</p>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              {COMPANY_LINKS.map((link) => (
                <a key={link} href="#" className="hover:text-primary leading-5">
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 w-52">
            <p className="text-base font-bold text-foreground">Legal</p>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              {LEGAL_LINKS.map((link) => (
                <a key={link} href="#" className="hover:text-primary leading-5">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-secondary pt-8 flex items-center justify-between text-sm text-muted-foreground">
          <div>© 2026 Super Career. All rights reserved.</div>
          <div className="flex gap-6 text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
