# React Ecommerce Application

A professional, production-ready ecommerce web application built with React, Vite, Bootstrap 5, Supabase, and Stripe.

## Features

- 🛍️ Product catalog with search and filtering
- 🛒 Shopping cart functionality
- 💳 Stripe payment integration
- 🔐 User authentication (Supabase Auth)
- 📱 Fully responsive design
- 🔍 SEO-friendly with meta tags
- ⚡ Fast performance with Vite

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Bootstrap 5** - CSS framework
- **Supabase** - Backend (database + auth)
- **Stripe** - Payment processing
- **React Router** - Client-side routing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
 ├── components/     # Reusable UI components
 ├── pages/          # Page components
 ├── context/        # React context providers
 ├── services/       # API and external service integrations
 ├── hooks/          # Custom React hooks
 ├── utils/          # Utility functions
 ├── assets/         # Static assets
 ├── App.jsx         # Main app component
 └── main.jsx        # Entry point
```

## License

MIT

