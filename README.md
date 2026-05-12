# Statementwise.ai

> The AI-native bank statement converter. 99%+ accuracy, never-expiring credits, multi-format export.

**Live Demo**: [https://statementwiseai.com](https://statementwiseai.com)

---

## Five Killer Features

1. **AI Template-Free Extraction** - Upload any bank statement PDF and AI extracts transactions automatically. Works with any bank format without templates.
2. **Never-Expiring Credits** - Credits roll over month to month, up to 3x your plan limit. No use-it-or-lose-it.
3. **Multi-Format Export** - Export to QBO, OFX, CSV, Excel, and JSON formats.
4. **Balance Reconciliation** - Opening + Deposits - Withdrawals = Closing balance validation.
5. **Client Portals** - Accounting firms create secure per-client upload portals with role-based access.

## Tech Stack

- **React 19 + TypeScript** - Modern frontend framework
- **Tailwind CSS v3 + shadcn/ui** - Utility-first styling with premium UI components
- **Framer Motion** - Animations and page transitions
- **Recharts** - Data visualization (charts, sparklines)
- **GSAP + ScrollTrigger** - Scroll-driven animations
- **React Router v7** - Client-side routing (HashRouter)
- **Vite 7** - Build tooling

## Project Structure

```
statementwise/
  src/
    components/          # Shared components (Navbar, Footer, Layout)
    components/ui/       # shadcn/ui components
    pages/               # Page components
      Home.tsx           # Landing page (hero, features, pricing, testimonials)
      Convert.tsx        # Core converter tool (upload -> extract -> export)
      Dashboard.tsx      # User dashboard (stats, charts, activity)
      Portal.tsx         # Client portal management
      PricingPage.tsx    # Pricing comparison
      Docs.tsx           # API documentation
    hooks/               # Custom React hooks
    lib/                 # Utility functions
    App.tsx              # Root component with routing
    main.tsx             # Entry point
    index.css            # Global styles
  public/                # Static assets (images, illustrations)
  design/                # Design documents
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, features, pricing preview, testimonials |
| Converter | `/#/convert` | Core tool: drag-drop upload, AI extraction simulation, transaction table, export |
| Dashboard | `/#/dashboard` | User stats, usage charts, credit breakdown, activity feed |
| Client Portal | `/#/portal` | Portal management, create portals, access control |
| Pricing | `/#/pricing` | 3-tier pricing (Free/Pro/Business), feature comparison, FAQ |
| API Docs | `/#/docs` | Developer API reference with syntax-highlighted code blocks |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/attm1122/statementwise.git
cd statementwise

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for automatic deployment to **GitHub Pages** via GitHub Actions. On every push to `main`, the workflow builds and deploys the site.

### Manual Deploy
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## Design System

- **Dark-first fintech aesthetic** - Deep navy (#050B14) + electric blue (#4B82FF) + success green (#00D68F)
- **Fonts**: Space Grotesk (display), Inter (body), JetBrains Mono (code)
- **Glass-morphism cards** with gradient surfaces
- **Responsive**: Mobile, tablet, desktop

## License

MIT
