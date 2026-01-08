# Deployment Guide

## Prerequisites

1. **Supabase Account**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Run the SQL schema from `supabase-schema.sql` in the SQL Editor

2. **Stripe Account**
   - Create an account at [stripe.com](https://stripe.com)
   - Get your publishable key from Dashboard > Developers > API keys
   - Set up webhook endpoints for payment processing (backend required)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Production Build

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

## Deployment Options

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod
```

3. Add environment variables in Netlify dashboard

### Other Platforms

The built files in the `dist` directory can be deployed to any static hosting service:
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Cloud Storage

## Important Notes

- The Stripe integration requires a backend API endpoint (`/api/create-checkout-session`) for security
- Set up CORS properly for your Supabase project
- Enable email authentication in Supabase Auth settings
- Configure redirect URLs in Supabase Auth settings for production

