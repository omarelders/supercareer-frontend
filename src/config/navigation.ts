import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Monitor,
  RefreshCw,
  User,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from './routes'

export interface NavigationItem {
  label: string
  href?: string
  icon?: LucideIcon
  children?: NavigationItem[]
  badge?: 'dot'
  actionIcon?: LucideIcon
}

export interface LeafNavigationItem extends NavigationItem {
  href: string
}

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: 'Jobs',
    icon: Briefcase,
    children: [
      { label: 'Job Match', href: ROUTES.jobs.jobMatch },
      {
        label: 'Custom CV',
        href: ROUTES.jobs.customCv,
        actionIcon: RefreshCw,
      },
    ],
  },
  {
    label: 'Freelance',
    icon: Monitor,
    children: [
      { label: 'Project Match', href: ROUTES.freelance.projectMatch },
      {
        label: 'Proposal',
        href: ROUTES.freelance.proposal,
        actionIcon: RefreshCw,
      },
    ],
  },
  {
    label: 'CV Builder',
    href: ROUTES.cvBuilder,
    icon: FileText,
  },
]

export const SETTINGS_NAV_ITEMS: NavigationItem[] = [
  { label: 'Profile', href: ROUTES.settings.profile, icon: User },
]

export function isLeafNavigationItem(item: NavigationItem): item is LeafNavigationItem {
  return typeof item.href === 'string'
}
