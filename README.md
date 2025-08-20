# LawLens

A responsive web application that provides quick answers to obscure local laws. Built with Next.js, TypeScript, TailwindCSS, Supabase, and Stripe.

## Features

- 🏠 **Homepage**: Clean interface with search bar and example questions
- 🎯 **Bad Decision Calculator**: AI-powered risk assessment tool with shareable results
- 🔍 **Advanced Search**: Multi-strategy search with full-text search, fuzzy matching, and keyword search
- 💳 **Payment Integration**: Stripe checkout for $1 one-time questions or $20/month subscription
- 📧 **Email Notifications**: Automatic email delivery when questions are answered
- 👤 **Secure Admin Panel**: Enhanced authentication with session management, rate limiting, and activity tracking
- 📱 **Responsive Design**: Mobile-friendly interface
- ⚡ **Fast Performance**: Optimized with Next.js and TailwindCSS

## Setup Instructions

### 1. Environment Variables

Fill in your `.env.local` file with actual values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# OpenAI (for Bad Decision Calculator)
OPENAI_API_KEY=your_openai_api_key

# Admin Authentication
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_admin_password

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### 2. Database Setup

1. Create a Supabase project
2. Run SQL from `supabase-schema.sql`
3. Update admin email in RLS policies

### 3. OpenAI Setup

1. Create an OpenAI account at [openai.com](https://openai.com)
2. Generate an API key from the API section
3. Add your API key to the environment variables

### 4. Stripe Setup

1. Create products ($1 one-time, $20 subscription)
2. Set up webhook endpoint
3. Add checkout URLs to environment variables

### 5. Run Development Server

```bash
npm install
npm run dev
```

## Admin Access

Visit `/admin/login` with your admin credentials to manage questions and view analytics.

## Deployment

Deploy to Vercel or any Node.js hosting provider with environment variables configured.

## Security Features

### Admin Panel Security
- **Session Management**: Secure JWT tokens with session tracking
- **Rate Limiting**: Protection against brute force login attempts (5 attempts, 15-minute lockout)
- **Activity Timeout**: Auto-logout after 4 hours of inactivity
- **Security Headers**: CSP, XSS protection, frame options, etc.
- **Session Cleanup**: Automatic cleanup of expired sessions

### Search Security
- **Input Validation**: Query length limits and sanitization
- **SQL Injection Protection**: Parameterized queries and proper escaping
- **Rate Limiting**: API endpoint protection (can be extended)

### Data Protection
- **No PII Storage**: Bad Decision Calculator stores no personally identifying information
- **Anonymized Analytics**: IP addresses and user agents for basic analytics only
- **Secure Cookies**: HTTP-only, SameSite=strict cookies for admin sessions

## Search Functionality

The search system uses a multi-strategy approach:

1. **Full-Text Search**: PostgreSQL's built-in text search with ranking
2. **Fuzzy Matching**: Handles partial matches and typos
3. **Keyword Search**: Falls back to individual word matching
4. **Relevance Scoring**: Weighted scoring based on match quality

### Search API Endpoints
- `GET /api/search?q=query` - Single best match
- `GET /api/search?q=query&multiple=true&limit=5` - Multiple results# Force deployment trigger
