// ============================================================================
// >>> DEMO_MOCK_DATA_START <<<
// DEMO MOCK DATA REPOSITORY
//
// This file provides realistic, high-quality mock data for all Super Career AI
// features when running in DEMO mode (while backend server & database are paused).
//
// To restore live backend connectivity:
// Simply set IS_DEMO_MODE = false in src/demo/demoConfig.ts
// ============================================================================

import type { ApiJob, ApiProject } from '@/services/opportunitiesApi'
import type { DashboardStats } from '@/services/accountsApi'
import type { DocApiProposal, DbCV } from '@/services/documentsApi'
import type { CVData } from '@/features/cv-builder/types'
import type { AuthUser } from '@/store/slices/authSlice'
import type { AtsScoreResponse } from '@/services/cvAiApi'
import type { AdminActivity, AdminScrapingLog, AdminStats, AdminUser } from '@/services/adminApi'

// ----------------------------------------------------------------------------
// 1. DEMO AUTHENTICATION & USER PROFILE
// ----------------------------------------------------------------------------

export const DEMO_USER: AuthUser = {
  id: 1,
  email: 'demo@supercareer.ai',
  username: 'omarelders',
  full_name: 'Omar Elders',
  role: 'both',
  skills: [
    'React 18',
    'TypeScript',
    'Node.js',
    'Python',
    'Next.js',
    'Tailwind CSS',
    'PostgreSQL',
    'AWS Cloud',
    'Docker',
    'GraphQL',
    'AI Systems',
  ],
  hourly_rate: '45.00',
  specialization: 'Full Stack & AI Systems Engineer',
  experience: '5+ years building scalable SaaS applications and intelligent matching algorithms.',
  bio: 'Passionate software engineer experienced with modern web frameworks, cloud deployments, and AI-assisted workflows.',
  education: 'B.Sc. in Computer Science & Information Systems',
}

export const DEMO_TOKENS = {
  access: 'demo_jwt_access_token_super_career_ai_mock_verified',
  refresh: 'demo_jwt_refresh_token_super_career_ai_mock_verified',
}

// ----------------------------------------------------------------------------
// 2. DEMO DASHBOARD STATS
// ----------------------------------------------------------------------------

export const DEMO_STATS: DashboardStats = {
  matches_today: 28,
  active_proposals: 4,
  avg_match_score: 94,
  profile_views: 184,
  user_name: 'Omar Elders',
}

// ----------------------------------------------------------------------------
// 3. DEMO JOBS (Matches across LinkedIn, Upwork, Greenhouse, Lever, etc.)
// ----------------------------------------------------------------------------

export const DEMO_JOBS: ApiJob[] = [
  {
    id: 101,
    title: 'Senior Frontend & AI Applications Engineer',
    company: 'Stripe',
    location: 'Remote, US / EU',
    source_platform: 'Greenhouse',
    source_url: 'https://stripe.com/jobs',
    match_score: 97.4,
    posted_date: '2026-09-02',
    scraped_at: '2026-09-05T10:00:00Z',
    required_skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Next.js'],
    description:
      'We are looking for a Senior Frontend Engineer to build intuitive web interfaces that power our next-generation AI developer tools. You will lead the architecture of design systems, collaborate with backend teams, and optimize core web vitals for millions of daily active users.',
  },
  {
    id: 102,
    title: 'Full Stack AI Systems Developer',
    company: 'Scale AI',
    location: 'San Francisco, CA (Hybrid)',
    source_platform: 'Lever',
    source_url: 'https://scale.com/careers',
    match_score: 95.8,
    posted_date: '2026-09-03',
    scraped_at: '2026-09-05T11:30:00Z',
    required_skills: ['Python', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'FastAPI'],
    description:
      'Scale AI is hiring a Full Stack Developer to bridge the gap between machine learning model evaluation and real-time enterprise dashboards. Responsibilities include building robust REST and streaming APIs, designing performant state management in React, and maintaining containerized deployment pipelines.',
  },
  {
    id: 103,
    title: 'Lead React / Next.js Product Engineer',
    company: 'Linear',
    location: 'Remote, Global',
    source_platform: 'LinkedIn',
    source_url: 'https://linear.app/careers',
    match_score: 94.2,
    posted_date: '2026-09-04',
    scraped_at: '2026-09-05T08:15:00Z',
    required_skills: ['React 18', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'UI Craft'],
    description:
      'Join our product engineering team crafting lightning-fast, high-polish project management tools. You will work on offline-first synchronization, high-frequency optimistic UI updates, and frictionless keyboard-driven navigation workflows.',
  },
  {
    id: 104,
    title: 'Cloud Solutions & Infrastructure Architect',
    company: 'Datadog',
    location: 'New York, NY (Hybrid)',
    source_platform: 'Greenhouse',
    source_url: 'https://datadoghq.com/careers',
    match_score: 92.5,
    posted_date: '2026-09-01',
    scraped_at: '2026-09-05T09:00:00Z',
    required_skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Node.js', 'Go'],
    description:
      'Architect, scale, and maintain telemetry ingestion infrastructure handling billions of metrics per minute. You will collaborate with site reliability engineers, implement automated deployment pipelines, and optimize infrastructure cost efficiency.',
  },
  {
    id: 105,
    title: 'Senior Frontend Engineer (Design Systems)',
    company: 'Vercel',
    location: 'Remote, EMEA',
    source_platform: 'Wellfound',
    source_url: 'https://vercel.com/careers',
    match_score: 91.0,
    posted_date: '2026-09-03',
    scraped_at: '2026-09-05T12:00:00Z',
    required_skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Accessibility'],
    description:
      'Help maintain the Geist design system and frontend platform that millions of modern web developers rely on daily. Strong focus on WCAG 2.2 accessibility, bundle-size optimization, and component library ergonomics.',
  },
  {
    id: 106,
    title: 'Backend Platform Engineer (Distributed Systems)',
    company: 'Supabase',
    location: 'Remote, Global',
    source_platform: 'GitHub',
    source_url: 'https://supabase.com/careers',
    match_score: 89.6,
    posted_date: '2026-08-30',
    scraped_at: '2026-09-05T07:45:00Z',
    required_skills: ['PostgreSQL', 'Node.js', 'TypeScript', 'Docker', 'REST APIs'],
    description:
      'Build open-source backend services that give developers an instant, scalable Postgres backend with real-time subscriptions, auth, and automated storage handling.',
  },
  {
    id: 107,
    title: 'Senior UI/UX & Frontend Architect',
    company: 'Anthropic',
    location: 'San Francisco, CA / Remote',
    source_platform: 'Lever',
    source_url: 'https://anthropic.com/careers',
    match_score: 96.1,
    posted_date: '2026-09-04',
    scraped_at: '2026-09-05T14:20:00Z',
    required_skills: ['React', 'TypeScript', 'AI Tooling', 'Canvas', 'Design Systems'],
    description:
      'Work alongside research scientists and designers to craft human-centered AI interfaces. Help build artifacts, interactive canvases, and developer consoles that expand how professionals collaborate with artificial intelligence.',
  },
  {
    id: 108,
    title: 'Lead Full Stack Engineer',
    company: 'Monzo Bank',
    location: 'London, UK (Hybrid)',
    source_platform: 'LinkedIn',
    source_url: 'https://monzo.com/careers',
    match_score: 88.4,
    posted_date: '2026-08-29',
    scraped_at: '2026-09-05T06:30:00Z',
    required_skills: ['React', 'TypeScript', 'Go', 'Microservices', 'PostgreSQL'],
    description:
      'Help build modern banking features trusted by over 9 million customers. Focus on security, resilience, responsive mobile-friendly web experiences, and seamless checkout integrations.',
  },
  {
    id: 109,
    title: 'Staff AI Product Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA (Hybrid)',
    source_platform: 'Greenhouse',
    source_url: 'https://openai.com/careers',
    match_score: 98.2,
    posted_date: '2026-09-04',
    scraped_at: '2026-09-05T15:00:00Z',
    required_skills: ['React 18', 'TypeScript', 'Python', 'LLM Agents', 'Streaming APIs'],
    description:
      'Lead development of state-of-the-art interactive AI products. You will design streaming UI architectures, optimize latency for conversational intelligence interfaces, and collaborate with core research teams to integrate multi-modal foundation models.',
  },
  {
    id: 110,
    title: 'Senior React & Web Platform Engineer',
    company: 'Spotify',
    location: 'Stockholm, Sweden / Remote',
    source_platform: 'Lever',
    source_url: 'https://spotify.com/jobs',
    match_score: 91.5,
    posted_date: '2026-09-03',
    scraped_at: '2026-09-05T13:40:00Z',
    required_skills: ['React', 'TypeScript', 'Web Audio API', 'Performance Tuning', 'GraphQL'],
    description:
      'Develop rich, low-latency audio playback web clients and creator studio tooling. Work with cross-functional audio engineers and UI designers to ensure silky smooth 60fps animations and flawless media streaming on all desktop browsers.',
  },
  {
    id: 111,
    title: 'Principal Frontend Infrastructure Architect',
    company: 'Shopify',
    location: 'Remote, Americas',
    source_platform: 'LinkedIn',
    source_url: 'https://shopify.com/careers',
    match_score: 93.7,
    posted_date: '2026-09-02',
    scraped_at: '2026-09-05T11:15:00Z',
    required_skills: ['TypeScript', 'React', 'Webpack/Vite', 'Design Tokens', 'CI/CD'],
    description:
      'Define the future of storefront frontend architecture at Shopify scale. You will architect reusable component systems, lead frontend performance governance, and improve compile times across hundreds of production repositories.',
  },
  {
    id: 112,
    title: 'Cloud Systems & Container Platforms Developer',
    company: 'Docker',
    location: 'Remote, Global',
    source_platform: 'Workable',
    source_url: 'https://docker.com/careers',
    match_score: 87.9,
    posted_date: '2026-09-01',
    scraped_at: '2026-09-05T09:30:00Z',
    required_skills: ['Docker', 'Go', 'Kubernetes', 'Linux', 'Node.js', 'REST APIs'],
    description:
      'Help build developer desktop and cloud container tooling that millions of engineers rely on. Focus on container lifecycle management, microservice networking, and secure container image registries.',
  },
  {
    id: 113,
    title: 'Senior Python & Distributed Data Engineer',
    company: 'Databricks',
    location: 'Seattle, WA (Hybrid)',
    source_platform: 'Greenhouse',
    source_url: 'https://databricks.com/company/careers',
    match_score: 90.4,
    posted_date: '2026-09-04',
    scraped_at: '2026-09-05T14:00:00Z',
    required_skills: ['Python', 'SQL Optimization', 'Spark', 'FastAPI', 'PostgreSQL', 'Docker'],
    description:
      'Join Databricks lakehouse engineering to build high-throughput data pipelines and interactive SQL exploration interfaces. Optimize query engines and develop REST microservices for multi-cloud data synchronization.',
  },
  {
    id: 114,
    title: 'Senior Web Performance & Core Experience Engineer',
    company: 'Airbnb',
    location: 'San Francisco, CA (On-site)',
    source_platform: 'Lever',
    source_url: 'https://careers.airbnb.com',
    match_score: 86.8,
    posted_date: '2026-08-31',
    scraped_at: '2026-09-05T08:45:00Z',
    required_skills: ['React', 'TypeScript', 'Web Vitals', 'SSR/Hydration', 'Tailwind CSS'],
    description:
      'Drive critical web performance initiatives across the guest checkout and listing search funnels. Optimize bundle sizes, eliminate layout shifts (CLS), and enhance server-side rendering speeds for worldwide travelers.',
  },
  {
    id: 115,
    title: 'Lead TypeScript & Developer Tools Engineer',
    company: 'GitHub',
    location: 'Remote, Global',
    source_platform: 'LinkedIn',
    source_url: 'https://github.com/about/careers',
    match_score: 95.1,
    posted_date: '2026-09-04',
    scraped_at: '2026-09-05T16:10:00Z',
    required_skills: ['TypeScript', 'React', 'GraphQL', 'Electron', 'Node.js', 'Git Internals'],
    description:
      'Shape the developer workflow of tomorrow. You will build cutting-edge code review tools, pull request discussion interfaces, and GitHub Copilot integrations used by more than 100 million developers worldwide.',
  },
  {
    id: 116,
    title: 'Machine Learning Platform & Interface Engineer',
    company: 'Hugging Face',
    location: 'Paris, France / Remote',
    source_platform: 'Wellfound',
    source_url: 'https://huggingface.co/joinus',
    match_score: 93.0,
    posted_date: '2026-09-03',
    scraped_at: '2026-09-05T12:30:00Z',
    required_skills: ['Python', 'React', 'FastAPI', 'PyTorch', 'Transformers', 'TypeScript'],
    description:
      'Build open-source AI community tools, model hubs, and Gradio/Spaces interactive demonstrations. You will connect AI model weights with modern web frontends and craft delightful demos for researchers and software engineers alike.',
  },
  {
    id: 117,
    title: 'Senior Frontend Engineer (Canvas & Interactive Systems)',
    company: 'Figma',
    location: 'New York, NY (Hybrid)',
    source_platform: 'Greenhouse',
    source_url: 'https://figma.com/careers',
    match_score: 94.8,
    posted_date: '2026-09-02',
    scraped_at: '2026-09-05T10:45:00Z',
    required_skills: ['TypeScript', 'WebGL/Canvas', 'React', 'Wasm', 'Design Systems'],
    description:
      'Work on Figma’s core rendering engine and collaborative UI canvas. Build multiplayer design tools, inspect components, and implement highly performant vector path rendering for designers and developers.',
  },
  {
    id: 118,
    title: 'Staff Distributed Edge Network Engineer',
    company: 'Cloudflare',
    location: 'Austin, TX (Hybrid)',
    source_platform: 'Lever',
    source_url: 'https://cloudflare.com/careers',
    match_score: 89.2,
    posted_date: '2026-09-01',
    scraped_at: '2026-09-05T09:15:00Z',
    required_skills: ['Go', 'Rust', 'TypeScript', 'Edge Workers', 'DNS & Security'],
    description:
      'Help build serverless execution platforms and global edge network infrastructure. Write low-latency handlers, develop edge KV storage integrations, and defend critical internet infrastructure against volumetric attacks.',
  },
  {
    id: 119,
    title: 'Lead Full Stack Banking Engineer',
    company: 'Revolut',
    location: 'London, UK (Hybrid)',
    source_platform: 'LinkedIn',
    source_url: 'https://revolut.com/careers',
    match_score: 88.0,
    posted_date: '2026-08-30',
    scraped_at: '2026-09-05T07:20:00Z',
    required_skills: ['React', 'TypeScript', 'Java', 'Microservices', 'PostgreSQL', 'AWS'],
    description:
      'Build consumer banking and wealth management modules for over 35 million global accounts. Ensure bulletproof transactional integrity, compliant KYC workflows, and instantaneous currency exchange interfaces.',
  },
  {
    id: 120,
    title: 'Senior Frontend Web3 & Security Engineer',
    company: 'Coinbase',
    location: 'Remote, US',
    source_platform: 'Greenhouse',
    source_url: 'https://coinbase.com/careers',
    match_score: 85.5,
    posted_date: '2026-08-28',
    scraped_at: '2026-09-05T06:00:00Z',
    required_skills: ['React', 'TypeScript', 'Cryptography', 'Tailwind CSS', 'Node.js'],
    description:
      'Design secure custody interfaces, multi-sig key signing dashboards, and institutional trading monitors. Focus on cryptographic verification UX, strict content security policies, and anti-phishing protection.',
  },
  {
    id: 121,
    title: 'Full Stack React & Python Developer (Contract)',
    company: 'Automattic',
    location: 'Remote, Global',
    source_platform: 'Workable',
    source_url: 'https://automattic.com/work-with-us',
    match_score: 92.1,
    posted_date: '2026-09-04',
    scraped_at: '2026-09-05T14:45:00Z',
    required_skills: ['React', 'Python', 'WordPress VIP', 'TypeScript', 'REST APIs'],
    description:
      'Collaborate on distributed publishing platforms powering over 40% of the top ten million websites. You will develop modern React-based block editors, optimize content caching layers, and automate cloud backups.',
  },
  {
    id: 122,
    title: 'Senior Real-time Systems & WebRTC Engineer',
    company: 'Discord',
    location: 'San Francisco, CA (Hybrid)',
    source_platform: 'Greenhouse',
    source_url: 'https://discord.com/careers',
    match_score: 90.8,
    posted_date: '2026-09-03',
    scraped_at: '2026-09-05T12:15:00Z',
    required_skills: ['React', 'TypeScript', 'WebSockets', 'WebRTC', 'Elixir', 'Performance'],
    description:
      'Build real-time voice, video, and text communication features for 200 million monthly active users. Work on client-side audio processing, jitter buffers, and seamless stage channel presentations.',
  },
  {
    id: 123,
    title: 'AI Integration & Evaluation Specialist (Contractor)',
    company: 'Cohere',
    location: 'Toronto, Canada / Remote',
    source_platform: 'Lever',
    source_url: 'https://cohere.com/careers',
    match_score: 89.5,
    posted_date: '2026-09-02',
    scraped_at: '2026-09-05T10:10:00Z',
    required_skills: ['Python', 'FastAPI', 'TypeScript', 'React', 'RAG', 'Vector DBs'],
    description:
      'Help enterprise customers deploy multilingual embeddings and rerank models. Construct evaluation benchmarks, test RAG pipelines against corporate document repositories, and build client-facing diagnostics consoles.',
  },
  {
    id: 124,
    title: 'Senior Cloud Data Warehouse Infrastructure Engineer',
    company: 'Snowflake',
    location: 'Berlin, Germany (Hybrid)',
    source_platform: 'LinkedIn',
    source_url: 'https://snowflake.com/careers',
    match_score: 87.3,
    posted_date: '2026-08-31',
    scraped_at: '2026-09-05T08:30:00Z',
    required_skills: ['Go', 'Python', 'AWS/Azure', 'Kubernetes', 'PostgreSQL', 'Docker'],
    description:
      'Scale cloud infrastructure provisioning that powers the Data Cloud. Design resilient multi-cloud failover mechanisms, automate container orchestration, and monitor petabyte-scale storage clusters.',
  },
]

// ----------------------------------------------------------------------------
// 4. DEMO FREELANCE PROJECTS (Upwork, Toptal, Freelancer)
// ----------------------------------------------------------------------------

export const DEMO_PROJECTS: ApiProject[] = [
  {
    id: 201,
    title: 'Build AI-Powered Workflow Dashboard in Next.js 14',
    description:
      'We require an experienced Full Stack developer to build a modern management dashboard. Must include authentication, streaming LLM chat sessions, document upload with vector indexing, and exportable analytics. Clean UI craft using Tailwind CSS and Radix UI is required.',
    budget: '$6,500',
    deadline: '2026-10-15',
    duration: '3-4 weeks',
    status: 'Open',
    required_skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'OpenAI API'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-04T12:00:00Z',
    scraped_at: '2026-09-05T10:00:00Z',
    match_score: 96.5,
  },
  {
    id: 202,
    title: 'Fullstack Fintech Payment Gateway Integration & Portal',
    description:
      'Need an expert software contractor to integrate Stripe Connect and automated recurring billing for our B2B SaaS platform. Requirements include webhook security handling, automated invoice generation, and customer management dashboard.',
    budget: '$4,800',
    deadline: '2026-09-30',
    duration: '2 weeks',
    status: 'Open',
    required_skills: ['React', 'Node.js', 'Stripe API', 'TypeScript', 'PostgreSQL'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-03T16:00:00Z',
    scraped_at: '2026-09-05T11:00:00Z',
    match_score: 94.0,
  },
  {
    id: 203,
    title: 'Senior Frontend Architecture Refactor & Performance Audit',
    description:
      'Our web application has grown significantly and is experiencing high bundle sizes and layout shifts. Looking for a senior engineer to audit our React 18 / Vite application, implement code-splitting, optimize state management, and achieve a 95+ Lighthouse score.',
    budget: '$75/hr',
    deadline: '2026-10-01',
    duration: '1 month',
    status: 'Open',
    required_skills: ['React', 'Performance Tuning', 'Vite', 'TypeScript', 'Web Vitals'],
    platform_name: 'Toptal',
    source_url: 'https://www.toptal.com',
    posted_date: '2026-09-02T10:00:00Z',
    scraped_at: '2026-09-05T09:00:00Z',
    match_score: 92.8,
  },
  {
    id: 204,
    title: 'Develop Real-Time Collaborative Canvas Tool',
    description:
      'We are developing a whiteboard tool for remote product teams. Seeking an expert developer to implement canvas rendering, WebSockets state synchronization, and touch gestures.',
    budget: '$12,000',
    deadline: '2026-11-01',
    duration: '2 months',
    status: 'Open',
    required_skills: ['TypeScript', 'WebSockets', 'Canvas API', 'React', 'Tailwind CSS'],
    platform_name: 'Freelancer',
    source_url: 'https://www.freelancer.com',
    posted_date: '2026-09-01T14:00:00Z',
    scraped_at: '2026-09-05T08:00:00Z',
    match_score: 91.2,
  },
  {
    id: 205,
    title: 'PostgreSQL Database Query Optimization & Indexing Review',
    description:
      'E-commerce database experiencing slow checkout queries during flash sales. Need an experienced database specialist to review EXPLAIN ANALYZE execution plans and create targeted indexes.',
    budget: '$2,500',
    deadline: '2026-09-20',
    duration: '1 week',
    status: 'Open',
    required_skills: ['PostgreSQL', 'SQL Optimization', 'Database Tuning', 'Backend'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-04T09:00:00Z',
    scraped_at: '2026-09-05T13:00:00Z',
    match_score: 88.5,
  },
  {
    id: 206,
    title: 'Multi-Tenant SaaS Authentication & Role-Based Access Migration',
    description:
      'Looking for a security-minded developer to migrate our single-tenant auth to a multi-tenant organization structure with RBAC permissions, JWT refresh rotation, and audit logs.',
    budget: '$5,200',
    deadline: '2026-10-10',
    duration: '3 weeks',
    status: 'Open',
    required_skills: ['React', 'Node.js', 'PostgreSQL', 'OAuth', 'JWT', 'Security'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-05T07:30:00Z',
    scraped_at: '2026-09-05T14:00:00Z',
    match_score: 95.0,
  },
  {
    id: 207,
    title: 'Automated Web Scraping & Data Extraction Pipeline with Playwright',
    description:
      'We need a headless automation pipeline built using Playwright and Python/Node.js to monitor product price listings across 12 e-commerce sites, handle rotating proxies, and dump clean JSON into S3.',
    budget: '$3,400',
    deadline: '2026-09-28',
    duration: '2 weeks',
    status: 'Open',
    required_skills: ['Playwright', 'Python', 'Web Scraping', 'Node.js', 'AWS S3'],
    platform_name: 'Freelancer',
    source_url: 'https://www.freelancer.com',
    posted_date: '2026-09-04T15:00:00Z',
    scraped_at: '2026-09-05T11:45:00Z',
    match_score: 93.4,
  },
  {
    id: 208,
    title: 'Mobile-Responsive PWA Conversion for E-Commerce Marketplace',
    description:
      'Transform an existing desktop-first React store into an installable progressive web app with push notifications, offline caching, and responsive touch gestures optimized for iOS and Android.',
    budget: '$4,500',
    deadline: '2026-10-05',
    duration: '1 month',
    status: 'Open',
    required_skills: ['React', 'PWA', 'Tailwind CSS', 'Service Workers', 'Mobile UI'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-03T11:20:00Z',
    scraped_at: '2026-09-05T09:15:00Z',
    match_score: 90.6,
  },
  {
    id: 209,
    title: 'Custom RAG & Vector Search Integration with Pinecone & OpenAI',
    description:
      'Build a production-ready retrieval-augmented generation engine for internal legal and compliance documentation. Includes chunking strategies, embeddings generation, and conversational search UI.',
    budget: '$8,200',
    deadline: '2026-10-20',
    duration: '3-4 weeks',
    status: 'Open',
    required_skills: ['Python', 'OpenAI API', 'Pinecone', 'FastAPI', 'React', 'LangChain'],
    platform_name: 'Toptal',
    source_url: 'https://www.toptal.com',
    posted_date: '2026-09-05T08:00:00Z',
    scraped_at: '2026-09-05T15:30:00Z',
    match_score: 97.1,
  },
  {
    id: 210,
    title: 'High-Frequency WebSockets Financial Ticker Widget & Charts',
    description:
      'Develop real-time price tick visualization using lightweight-charts, WebSockets streaming subscriptions, and virtualized order book lists capable of 60fps under 500 events/second.',
    budget: '$90/hr',
    deadline: '2026-09-25',
    duration: '2 weeks',
    status: 'Open',
    required_skills: ['React', 'TypeScript', 'WebSockets', 'Canvas', 'Performance'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-04T13:45:00Z',
    scraped_at: '2026-09-05T10:30:00Z',
    match_score: 92.3,
  },
  {
    id: 211,
    title: 'Tailwind CSS Design System Scaffolding & Storybook Setup',
    description:
      'Extract design tokens from Figma and build an accessible, dark-mode compatible UI library in React + Tailwind CSS with comprehensive Storybook documentation and automated chromatic visual regression tests.',
    budget: '$3,000',
    deadline: '2026-09-22',
    duration: '10 days',
    status: 'Open',
    required_skills: ['Tailwind CSS', 'Storybook', 'React', 'TypeScript', 'Accessibility'],
    platform_name: 'Contra',
    source_url: 'https://contra.com',
    posted_date: '2026-09-02T17:00:00Z',
    scraped_at: '2026-09-05T08:20:00Z',
    match_score: 89.0,
  },
  {
    id: 212,
    title: 'Microservices Dockerization & Kubernetes Helm Deployment',
    description:
      'Containerize 5 existing Node.js & Python backend services, create multi-stage Dockerfiles, configure Helm charts, and write GitHub Actions CI/CD pipelines to deploy onto AWS EKS.',
    budget: '$6,200',
    deadline: '2026-10-12',
    duration: '3 weeks',
    status: 'Open',
    required_skills: ['Docker', 'Kubernetes', 'AWS EKS', 'Helm', 'GitHub Actions', 'CI/CD'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-03T09:10:00Z',
    scraped_at: '2026-09-05T12:45:00Z',
    match_score: 88.2,
  },
  {
    id: 213,
    title: 'AI Resume & ATS Evaluation Engine Microservice in Python',
    description:
      'Construct a FastAPI service to parse PDF/DOCX resumes, extract key technical competencies, calculate semantic matching scores against job postings, and provide targeted resume optimization feedback.',
    budget: '$7,500',
    deadline: '2026-10-18',
    duration: '1 month',
    status: 'Open',
    required_skills: ['Python', 'FastAPI', 'NLP', 'Docker', 'OpenAI API', 'PDF Extraction'],
    platform_name: 'Toptal',
    source_url: 'https://www.toptal.com',
    posted_date: '2026-09-05T09:30:00Z',
    scraped_at: '2026-09-05T16:00:00Z',
    match_score: 96.8,
  },
  {
    id: 214,
    title: 'Interactive 3D Product Visualizer using Three.js & React Three Fiber',
    description:
      'We need a luxury retail 3D product configurator where customers can customize materials, lighting, and textures in real-time with smooth camera orbits and mobile WebGL optimization.',
    budget: '$9,500',
    deadline: '2026-11-05',
    duration: '5 weeks',
    status: 'Open',
    required_skills: ['Three.js', 'React Three Fiber', 'WebGL', 'TypeScript', 'Shaders'],
    platform_name: 'Freelancer',
    source_url: 'https://www.freelancer.com',
    posted_date: '2026-09-01T16:40:00Z',
    scraped_at: '2026-09-05T07:15:00Z',
    match_score: 87.5,
  },
  {
    id: 215,
    title: 'Enterprise CRM Data Migration & Sync Middleware',
    description:
      'Build a resilient bidirectional data sync between Salesforce REST API and our internal PostgreSQL database. Handle rate limiting, conflict resolution, and automatic retries with SQS queues.',
    budget: '$4,200',
    deadline: '2026-09-27',
    duration: '2 weeks',
    status: 'Open',
    required_skills: ['Node.js', 'PostgreSQL', 'Salesforce API', 'AWS SQS', 'TypeScript'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-04T10:15:00Z',
    scraped_at: '2026-09-05T13:30:00Z',
    match_score: 89.8,
  },
  {
    id: 216,
    title: 'Stripe Billing & Tiered Subscription Portal for Developer Tools',
    description:
      'Integrate Stripe Customer Portal, usage-based meter billing, team seat upgrades, and invoice PDF downloading for our developer SaaS platform.',
    budget: '$3,800',
    deadline: '2026-09-24',
    duration: '2 weeks',
    status: 'Open',
    required_skills: ['Stripe API', 'React', 'Node.js', 'TypeScript', 'Webhooks'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-05T06:00:00Z',
    scraped_at: '2026-09-05T14:15:00Z',
    match_score: 94.5,
  },
  {
    id: 217,
    title: 'Fast, Offline-First PWA Note-taking App with IndexedDB',
    description:
      'Build an offline-first markdown notes application using Dexie.js (IndexedDB) and CRDT synchronisation. Must support tag filtering, search indexing, and instant local keystroke saving.',
    budget: '$5,000',
    deadline: '2026-10-08',
    duration: '3 weeks',
    status: 'Open',
    required_skills: ['React', 'TypeScript', 'IndexedDB', 'PWA', 'Tailwind CSS'],
    platform_name: 'Contra',
    source_url: 'https://contra.com',
    posted_date: '2026-09-03T14:30:00Z',
    scraped_at: '2026-09-05T11:10:00Z',
    match_score: 91.0,
  },
  {
    id: 218,
    title: 'End-to-End Test Automation Suite with Playwright & GitHub Actions',
    description:
      'Write exhaustive Playwright end-to-end integration tests covering user registration, payment checkout flows, and complex dashboard interactions. Configure parallel execution in GitHub Actions CI.',
    budget: '$85/hr',
    deadline: '2026-10-02',
    duration: '3 weeks',
    status: 'Open',
    required_skills: ['Playwright', 'TypeScript', 'CI/CD', 'GitHub Actions', 'Test Automation'],
    platform_name: 'Toptal',
    source_url: 'https://www.toptal.com',
    posted_date: '2026-09-04T08:50:00Z',
    scraped_at: '2026-09-05T12:00:00Z',
    match_score: 90.2,
  },
  {
    id: 219,
    title: 'Real-time Audio/Video Streaming WebRTC Integration',
    description:
      'Integrate LiveKit or mediasoup SFU into our React web app for interactive 1-on-1 and group video consultations. Implement mute/unmute, screen-sharing, and active speaker spotlighting.',
    budget: '$13,500',
    deadline: '2026-11-15',
    duration: '2 months',
    status: 'Open',
    required_skills: ['WebRTC', 'React', 'TypeScript', 'Node.js', 'Media Streaming'],
    platform_name: 'Upwork',
    source_url: 'https://www.upwork.com',
    posted_date: '2026-09-01T12:00:00Z',
    scraped_at: '2026-09-05T06:50:00Z',
    match_score: 86.4,
  },
  {
    id: 220,
    title: 'GraphQL API Federation & Apollo Gateway Microservices',
    description:
      'Refactor existing scattered REST microservices into a unified federated GraphQL subgraph architecture using Apollo Router, TypeScript, and Redis response caching.',
    budget: '$6,800',
    deadline: '2026-10-25',
    duration: '1 month',
    status: 'Open',
    required_skills: ['GraphQL', 'Apollo Federation', 'Node.js', 'TypeScript', 'Redis'],
    platform_name: 'Freelancer',
    source_url: 'https://www.freelancer.com',
    posted_date: '2026-09-03T18:15:00Z',
    scraped_at: '2026-09-05T10:40:00Z',
    match_score: 88.7,
  },
]

// ----------------------------------------------------------------------------
// 5. DEMO PROPOSALS (Submitted & Active)
// ----------------------------------------------------------------------------

export const DEMO_PROPOSALS: DocApiProposal[] = [
  {
    id: 301,
    user: 1,
    job: null,
    project: 201,
    status: 'accepted',
    created_at: '2026-09-03T15:20:00Z',
    content:
      'Hi there,\n\nI reviewed your project scope regarding the Next.js 14 AI Workflow Dashboard. With over 5 years of full-stack engineering and extensive experience integrating streaming LLM endpoints with responsive React interfaces, I can deliver a clean, performant solution.\n\nMy approach:\n1. Scaffolding Next.js App Router with server actions and edge streaming.\n2. Integrating vector database indexing for document search.\n3. Building polished UI with Tailwind CSS and accessible Radix primitives.\n\nLooking forward to collaborating with your team!\n\nBest regards,\nOmar Elders',
    job_details: null,
    project_details: {
      id: 201,
      title: 'Build AI-Powered Workflow Dashboard in Next.js 14',
      description: 'Management dashboard with authentication, streaming LLM chat sessions, and vector indexing.',
      budget: '$6,500',
      deadline: '2026-10-15',
      duration: '3-4 weeks',
      status: 'In Progress',
      required_skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
      platform_name: 'Upwork',
      source_url: 'https://www.upwork.com',
      posted_date: '2026-09-04T12:00:00Z',
      scraped_at: '2026-09-05T10:00:00Z',
      match_score: 96.5,
    },
  },
  {
    id: 302,
    user: 1,
    job: 101,
    project: null,
    status: 'in_review',
    created_at: '2026-09-04T09:15:00Z',
    content:
      'Dear Hiring Team at Stripe,\n\nI am thrilled to apply for the Senior Frontend & AI Applications Engineer role. My background focuses on building scalable design systems and high-polish frontend applications. Having reviewed your engineering standards, I am confident my experience with React 18, TypeScript, and developer-focused tooling aligns directly with your mission.',
    job_details: {
      id: 101,
      match_score: 97.4,
      title: 'Senior Frontend & AI Applications Engineer',
      company: 'Stripe',
      description: 'Building intuitive web interfaces that power next-generation developer tools.',
      location: 'Remote, US / EU',
      source_platform: 'Greenhouse',
      source_url: 'https://stripe.com/jobs',
      posted_date: '2026-09-02',
      scraped_at: '2026-09-05T10:00:00Z',
    },
    project_details: null,
  },
  {
    id: 303,
    user: 1,
    job: null,
    project: 202,
    status: 'sent',
    created_at: '2026-09-04T18:40:00Z',
    content:
      'Hello,\n\nI have extensive experience with Stripe Connect and recurring SaaS billing architectures. I can set up robust webhook reconciliation, automated error retries, and customer management portals with zero downtime.',
    job_details: null,
    project_details: {
      id: 202,
      title: 'Fullstack Fintech Payment Gateway Integration & Portal',
      description: 'Stripe Connect and recurring billing portal integration.',
      budget: '$4,800',
      deadline: '2026-09-30',
      duration: '2 weeks',
      status: 'Open',
      required_skills: ['React', 'Node.js', 'Stripe API'],
      platform_name: 'Upwork',
      source_url: 'https://www.upwork.com',
      posted_date: '2026-09-03T16:00:00Z',
      scraped_at: '2026-09-05T11:00:00Z',
      match_score: 94.0,
    },
  },
]

// ----------------------------------------------------------------------------
// 6. DEMO BASE & TAILORED CV DATA
// ----------------------------------------------------------------------------

export const DEMO_BASE_CV_DATA: CVData = {
  personal: {
    fullName: 'Omar Elders',
    title: 'Senior Full Stack & AI Systems Engineer',
    email: 'omarelders1968@gmail.com',
    phone: '+20 100 123 4567',
    location: 'Cairo, Egypt (Open to Remote / Relocation)',
    url: 'https://github.com/omarelders',
    summary:
      'Results-driven Software Engineer with 5+ years of experience designing and building high-performance web applications, microservices, and AI-driven automation systems. Proven track record in optimizing core web performance, architecting relational databases, and leading agile engineering workflows.',
  },
  experience: [
    {
      id: '1',
      title: 'Senior Full Stack Engineer',
      company: 'CloudScale Technologies',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      description:
        '• Architected and shipped an AI-assisted job matching and proposal generation platform serving 50,000+ monthly requests.\n• Reduced API latency by 42% through Redis query caching and PostgreSQL execution plan optimization.\n• Led a squad of 4 engineers implementing TypeScript strict mode and automated CI/CD testing pipelines.',
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'NextWave Digital Solutions',
      startDate: '2021-03',
      endDate: '2022-12',
      current: false,
      description:
        '• Engineered modular frontend components using React, Redux Toolkit, and Tailwind CSS.\n• Implemented secure JWT authentication and role-based access control (RBAC) across microservices.\n• Collaborated with product managers to deliver client billing integrations processing $1.2M in annual recurring transactions.',
    },
    {
      id: '3',
      title: 'Frontend Engineer',
      company: 'Apex Interactive Studio',
      startDate: '2019-08',
      endDate: '2021-02',
      current: false,
      description:
        '• Developed responsive, pixel-perfect user interfaces adhering to WCAG 2.1 AA accessibility guidelines.\n• Migrated legacy jQuery codebases to modern React hooks, cutting maintenance overhead by 35%.\n• Created reusable charting and data visualization dashboards using Chart.js and SVG.',
    },
  ],
  education: [
    {
      id: '1',
      school: 'Cairo University - Faculty of Computers and Artificial Intelligence',
      degree: 'B.Sc. in Computer Science & Software Engineering',
      year: '2019',
      description: 'Graduated with Excellent Honors with Distinction. Capstone Project: Automated Semantic Job Matching Engine.',
    },
  ],
  skills: [
    'React 18',
    'TypeScript',
    'Next.js',
    'Node.js',
    'Python',
    'PostgreSQL',
    'Docker',
    'AWS (S3, ECS, RDS)',
    'GraphQL',
    'Tailwind CSS',
    'Redis',
    'CI/CD Pipelines',
    'AI Prompt Engineering',
  ],
}

export const DEMO_CUSTOM_CVS: DbCV[] = [
  {
    id: 1,
    user: 1,
    job: null,
    full_name: DEMO_BASE_CV_DATA.personal.fullName,
    professional_title: DEMO_BASE_CV_DATA.personal.title,
    email_address: DEMO_BASE_CV_DATA.personal.email,
    phone_number: DEMO_BASE_CV_DATA.personal.phone,
    location: DEMO_BASE_CV_DATA.personal.location,
    portfolio_url: DEMO_BASE_CV_DATA.personal.url,
    professional_summary: DEMO_BASE_CV_DATA.personal.summary,
    ats_score: 94,
    is_base: true,
    created_at: '2026-09-01T08:00:00Z',
    Skills: DEMO_BASE_CV_DATA.skills,
    Experience: DEMO_BASE_CV_DATA.experience.map((exp) => ({
      is_current: exp.current,
      job_title: exp.title,
      company: exp.company,
      start_date: exp.startDate,
      end_date: exp.endDate,
      description: exp.description,
    })),
    Education: DEMO_BASE_CV_DATA.education.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      graduation_year: edu.year,
      description: edu.description,
    })),
    content: JSON.stringify(DEMO_BASE_CV_DATA),
  },
  {
    id: 2,
    user: 1,
    job: 1,
    full_name: DEMO_BASE_CV_DATA.personal.fullName,
    professional_title: 'Senior Frontend & AI Developer',
    email_address: DEMO_BASE_CV_DATA.personal.email,
    phone_number: DEMO_BASE_CV_DATA.personal.phone,
    location: DEMO_BASE_CV_DATA.personal.location,
    portfolio_url: DEMO_BASE_CV_DATA.personal.url,
    professional_summary:
      'Frontend and AI application specialist with deep mastery of React, TypeScript, and micro-frontend architectures. Specially calibrated for high-traffic financial technology developer tooling.',
    ats_score: 96,
    is_base: false,
    created_at: '2026-09-03T11:00:00Z',
    Skills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems', 'GraphQL', 'Next.js', 'Core Web Vitals'],
    Experience: DEMO_BASE_CV_DATA.experience.map((exp) => ({
      is_current: exp.current,
      job_title: exp.title,
      company: exp.company,
      start_date: exp.startDate,
      end_date: exp.endDate,
      description: exp.description,
    })),
    Education: DEMO_BASE_CV_DATA.education.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      graduation_year: edu.year,
      description: edu.description,
    })),
    content: JSON.stringify({
      ...DEMO_BASE_CV_DATA,
      personal: {
        ...DEMO_BASE_CV_DATA.personal,
        title: 'Senior Frontend & AI Developer (Tailored for Stripe)',
      },
    }),
  },
  {
    id: 3,
    user: 1,
    job: 2,
    full_name: DEMO_BASE_CV_DATA.personal.fullName,
    professional_title: 'Full Stack & AI Systems Architect',
    email_address: DEMO_BASE_CV_DATA.personal.email,
    phone_number: DEMO_BASE_CV_DATA.personal.phone,
    location: DEMO_BASE_CV_DATA.personal.location,
    portfolio_url: DEMO_BASE_CV_DATA.personal.url,
    professional_summary:
      'Experienced full-stack engineer with proven expertise in Python API backends, real-time evaluation data flows, and modern React analytical dashboards.',
    ats_score: 92,
    is_base: false,
    created_at: '2026-09-04T10:00:00Z',
    Skills: ['Python', 'FastAPI', 'React', 'Docker', 'PostgreSQL', 'Model Evaluation', 'TypeScript'],
    Experience: DEMO_BASE_CV_DATA.experience.map((exp) => ({
      is_current: exp.current,
      job_title: exp.title,
      company: exp.company,
      start_date: exp.startDate,
      end_date: exp.endDate,
      description: exp.description,
    })),
    Education: DEMO_BASE_CV_DATA.education.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      graduation_year: edu.year,
      description: edu.description,
    })),
    content: JSON.stringify({
      ...DEMO_BASE_CV_DATA,
      personal: {
        ...DEMO_BASE_CV_DATA.personal,
        title: 'Full Stack & AI Systems Architect (Tailored for Scale AI)',
      },
    }),
  },
]

// ----------------------------------------------------------------------------
// 7. DEMO ATS SCORE & AI RECOMMENDATIONS
// ----------------------------------------------------------------------------

export const DEMO_ATS_SCORE: AtsScoreResponse = {
  ats_score: 94,
  feedback:
    'Optimal ATS compliance! Your resume achieved a 94% compatibility rating against Tier-1 enterprise screening standards. Keyword density for React, TypeScript, Cloud Infrastructure, and Microservices is in the top 5th percentile. Quantifiable bullet metrics and structured chronological formatting are fully readable by Workday and Greenhouse parsers.',
}

export const DEMO_RECOMMENDED_KEYWORDS: string[] = [
  'Distributed Systems',
  'Microservices Architecture',
  'CI/CD Pipelines',
  'Performance Optimization',
  'AI Agent Orchestration',
  'React Server Components',
  'Test-Driven Development (TDD)',
  'System Design',
]

// ----------------------------------------------------------------------------
// 8. DEMO ADMIN DATA
// ----------------------------------------------------------------------------

export const DEMO_ADMIN_STATS: AdminStats = {
  total_users: 1420,
  total_jobs: 3850,
  total_projects: 920,
  active_users: 890,
  blocked_users: 4,
}

export const DEMO_ADMIN_ACTIVITIES: AdminActivity[] = [
  {
    id: 1,
    admin: 1,
    admin_name: 'Admin System',
    action: 'Auto-indexed 240 new jobs from LinkedIn and Greenhouse',
    target_user: 1,
    target_user_name: 'All Users',
    created_at: '2026-09-05T12:00:00Z',
  },
  {
    id: 2,
    admin: 1,
    admin_name: 'Admin System',
    action: 'Scraped 48 freelance opportunities from Upwork & Toptal',
    target_user: 1,
    target_user_name: 'All Users',
    created_at: '2026-09-05T11:00:00Z',
  },
  {
    id: 3,
    admin: 1,
    admin_name: 'System Security',
    action: 'Automated token rotation & rate limit security audit passed',
    target_user: 1,
    target_user_name: 'System',
    created_at: '2026-09-05T08:00:00Z',
  },
]

export const DEMO_ADMIN_LOGS: AdminScrapingLog[] = [
  {
    id: 1,
    source_name: 'Greenhouse API',
    status: 'SUCCESS',
    details: 'Imported 85 engineering roles with 98% schema validation',
    created_at: '2026-09-05T12:30:00Z',
  },
  {
    id: 2,
    source_name: 'Lever API',
    status: 'SUCCESS',
    details: 'Imported 62 tech roles with salary ranges normalized',
    created_at: '2026-09-05T11:45:00Z',
  },
  {
    id: 3,
    source_name: 'Upwork Feed',
    status: 'SUCCESS',
    details: 'Imported 48 verified client requests',
    created_at: '2026-09-05T10:15:00Z',
  },
]

export const DEMO_ADMIN_SCRAPING_LOGS = DEMO_ADMIN_LOGS

export const DEMO_ADMIN_USERS: AdminUser[] = [
  {
    id: 1,
    username: 'omarelders',
    email: 'demo@supercareer.ai',
    first_name: 'Omar',
    last_name: 'Elders',
    role: 'both',
  },
  {
    id: 2,
    username: 'sarah_dev',
    email: 'sarah.jenkins@example.com',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    role: 'job_seeker',
  },
  {
    id: 3,
    username: 'alex_consultant',
    email: 'alex.chen@example.com',
    first_name: 'Alex',
    last_name: 'Chen',
    role: 'freelancer',
  },
  {
    id: 4,
    username: 'marcus_architect',
    email: 'marcus.thorne@example.com',
    first_name: 'Marcus',
    last_name: 'Thorne',
    role: 'both',
  },
]

// ============================================================================
// >>> DEMO_MOCK_DATA_END <<<
// ============================================================================
