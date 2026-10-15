# V8 App Template

A modern, production-ready web application template built with Vite, React, and TypeScript. Designed for AI-assisted development with component introspection, layout systems, and excellent developer experience.

## 🚀 Features

- **⚡ Lightning Fast**: Vite for instant hot module replacement and optimized builds
- **🎯 Type Safe**: Full TypeScript coverage across frontend and backend
- **🎨 Beautiful UI**: shadcn/ui components with Tailwind CSS
- **🧠 AI-Friendly**: Component introspection for AI development tools
- **📱 Responsive**: Mobile-first design with modern CSS
- **🔧 Developer Experience**: Hot reload, linting, formatting, and testing setup
- **🚀 Production Build Support**: Server-side rendering (SSR) and optimized builds

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with hooks and concurrent features
- **TypeScript 5** - Full type safety across the application
- **Vite 6** - Fast build tool and dev server with HMR
- **Tailwind CSS 3** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Router DOM 7** - Client-side routing
- **Motion** - Smooth animations and transitions

### Backend

- **Express API** - Health check, SSR, and extensible server routes
- **TypeScript** - Type-safe backend development

### Development Tools

- **ESLint 9** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Fast unit testing
- **TypeScript ESLint** - TypeScript-specific linting

> **Requirement:** Node.js 22 or later.

## 📁 Project Structure

```
v8-app-template/
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui base components (40+ components)
│   │   └── Spinner.tsx
│   ├── layouts/          # Layout systems
│   │   ├── RootLayout.tsx    # Centralized layout wrapper
│   │   ├── Website.tsx       # Structural container
│   │   ├── Dashboard.tsx     # Dashboard layout
│   │   ├── RootLayout.md     # RootLayout documentation
│   │   ├── Website.md        # Website layout documentation
│   │   └── parts/            # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── pages/            # Page components (content only)
│   │   ├── index.tsx     # Homepage
│   │   └── _404.tsx      # 404 page
│   ├── lib/              # Utilities and API
│   │   ├── utils.ts      # Utility functions
│   │   └── api-client.ts # API client
│   ├── server/           # Express API routes and SSR entry point
│   │   ├── api/health/GET.ts
│   │   └── entry.ts
│   ├── styles/           # Global styles
│   │   └── globals.css
│   ├── test/             # Test setup
│   │   └── setup.ts
│   ├── App.tsx           # Root application component
│   ├── main.tsx          # Application entry point
│   ├── router.ts         # Route definitions
│   └── routes.tsx        # Route components
├── dev-tools/            # Development mode enhancements
├── source-mapper/        # AI introspection plugin
├── public/               # Static assets
├── Dockerfile.dev        # Local Docker development image
└── vite.config.ts        # Vite, API, SSR, and plugin configuration
```

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the client and SSR server bundle for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest unit tests
- `npm run test:ui` - Open the Vitest UI
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run audit` - Check dependencies for high-severity vulnerabilities
- `npm run lint` - Run ESLint code linting
- `npm run lint:fix` - Run ESLint and apply fixes where possible
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format source files with Prettier
- `npm run clean` - Remove build output and Vite's dependency cache
- `npm run reset` - Clean the project and reinstall dependencies

## 🎨 UI Components

This template includes shadcn/ui components that are:

- **Accessible** - Built with Radix UI primitives
- **Customizable** - Easy to modify and extend
- **Consistent** - Design system with CSS variables
- **Copy-paste friendly** - Own your components

The template includes 40+ pre-configured shadcn/ui components:

- **Layout**: Card, Separator, Tabs, Sheet, Dialog
- **Forms**: Button, Input, Textarea, Select, Checkbox, Switch
- **Navigation**: Navigation Menu, Breadcrumb, Pagination
- **Feedback**: Alert, Badge, Progress, Skeleton, Sonner
- **Data Display**: Table, Avatar, Calendar, Hover Card
- **Overlays**: Popover, Tooltip, Alert Dialog, Drawer
- **Interactive**: Accordion, Collapsible, Command, Context Menu

To add new components:

```bash
npx shadcn-ui@latest add component-name
```

## 🧠 AI Integration

### Component Introspection

The custom source-mapper plugin adds metadata to components in development:

```html
<div
  data-source-file="/src/components/Button.tsx"
  data-source-line="15"
  data-source-component="Button"
>
  Click Me
</div>
```

### Development Mode Integration

The dev-tools package provides:

- **Element selection**: Click to identify components
- **Live editing**: Modify component props in real-time
- **Source mapping**: Navigate directly to component source
- **AI integration**: Enhanced context for AI development tools

### AI-Friendly Patterns

- **Consistent naming**: PascalCase components, camelCase hooks
- **Clear file structure**: Logical separation of concerns
- **Type-first approach**: Comprehensive TypeScript types
- **Standard patterns**: CRUD operations, form handling, error boundaries

## 🗃️ API & Layouts

### API Routes

The template includes:

- `GET /api/health` - Health check endpoint
- Extensible API client setup in `src/lib/api-client.ts`

### Layout System

**RootLayout Pattern** (recommended for multi-page sites):

`App.tsx` already wraps every route in RootLayout, which renders a shared header and footer on every page. Customize them by editing `src/layouts/parts/Header.tsx` and `Footer.tsx` directly — there is no config prop. For reference, the routing shape is a pathless layout route:

```tsx
// src/App.tsx (already wired)
const routeTree: RouteObject[] = [
  {
    element: (
      <RootLayout>
        <Outlet />
      </RootLayout>
    ),
    children: routes,
  },
];

const router = createAiroBrowserRouter(routeTree, { notFoundRouteId: 'airo-not-found' });

export default function App() {
  return <AiroRouterProvider router={router} />;
}
```

Pages become simple content components:

```tsx
// src/pages/home.tsx
export default function HomePage() {
  return <div>Your content here</div>;
}
```

**Available Layouts**:

- **RootLayout** (`src/layouts/RootLayout.tsx`) - Centralized header/footer wrapper
- **Website** (`src/layouts/Website.tsx`) - Structural container (used by RootLayout)
- **Dashboard** (`src/layouts/Dashboard.tsx`) - Admin panels and dashboards

See `src/layouts/*.md` for detailed usage documentation.

## 🧪 Testing

Run tests with:

```bash
npm run test
```

The template includes:

- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **Jest DOM** - Custom Jest matchers

## 📦 Deployment

### Build for production:

```bash
npm run build
```

### Deploy options:

- **Vercel/Netlify** - Frontend deployment
- **Railway/Render** - Full-stack deployment
- **Docker** - Containerized deployment

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
VITE_APP_NAME=v8 App Template
VITE_PUBLIC_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
PORT=3000
VITE_ENABLE_SOURCE_MAPPING=true
VITE_ENABLE_SSR=true
VITE_SHOW_DEV_TOOLS=false
```

### Finance and franchise settings rollout

Before enabling the admin **Settings** tab in an existing database:

1. Apply `drizzle/0001_franchise_finance_settings.sql` to the application's MySQL database using the deployment's approved database migration process. This repository does not run this manual SQL file automatically. Apply it before deploying code that uses the settings APIs.
2. Generate a 32-byte encryption key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and configure the resulting 64-character hex string as `BANK_DETAILS_ENCRYPTION_KEY` in the server's secret manager. Keep this key stable and backed up securely: losing or changing it makes previously encrypted payment details unreadable.
3. Populate and verify the company and payment details in the super-admin Settings tab before publishing. Unpublished payment instructions are not returned to clients.

The finance settings configure encrypted manual bank/UPI instructions and investment/payment category labels. They do not provide payment-gateway processing, accounting reconciliation, tax calculations, or invoice generation. Do not use sample or unverified company/bank details in production.

### Railway deployment

The repository includes a Railway config that builds the Vite client and SSR server, starts the compiled server, and probes `/api/health`. Railway should run a single application service plus a MySQL database service for this app:

1. Create a Railway project, deploy this repository as the application service, and add a Railway MySQL service. Ensure the `package-lock.json` is committed so Nixpacks can install reproducibly.
2. Add the app's database variables using Railway service references (replace `MySQL` with your actual database service name):
   - `DB_HOST=${{MySQL.MYSQLHOST}}`
   - `DB_PORT=${{MySQL.MYSQLPORT}}`
   - `DB_USER=${{MySQL.MYSQLUSER}}`
   - `DB_PASS=${{MySQL.MYSQLPASSWORD}}`
   - `DB_NAME=${{MySQL.MYSQLDATABASE}}`
3. Configure `BETTER_AUTH_SECRET` and `BANK_DETAILS_ENCRYPTION_KEY` as private Railway variables. Set `BETTER_AUTH_TRUSTED_ORIGINS` to the exact HTTPS origin users visit (Railway-generated domain and/or custom domain, comma-separated). Set `VITE_PUBLIC_URL` to the public origin before building; redeploy after changing it because it is embedded in the client build.
4. Attach a persistent Railway Volume to the app service at `/app/data` and set `APPLICATION_UPLOAD_DIR=/app/data/applications`. Application identity documents are sensitive: restrict service access, backup and retention appropriately, and do not expose this volume through a static/public route. Keep one app replica while using local volume-backed uploads; use private object storage before scaling replicas.
5. Apply the SQL migration to the Railway MySQL database before the release uses settings APIs, then configure and verify company and bank details in the super-admin Settings tab.
6. Add the Railway-generated domain or custom domain, verify the health check and login, and test document submission, settings publication/privacy, and client payment instructions in staging.

Railway's `PORT` is read by the server automatically. Do not expose the MySQL service publicly unless there is a specific operational need. Railway deployment does not remove the production launch gates above; configure backups, monitoring, access controls, and incident procedures before handling real applicant documents or payments.

### Production launch gates

Successful type-checks, tests, and builds do not by themselves make a deployment production-ready. Before opening the portal to real franchise applicants or clients:

- Apply and verify the settings-table migration; confirm production database backups and a tested restore process.
- Configure production-only database credentials, a strong `BETTER_AUTH_SECRET`, and the stable `BANK_DETAILS_ENCRYPTION_KEY` through the deployment secret manager. Never reuse development secrets.
- Use HTTPS, review authentication/session cookie and allowed-origin settings for the production domain, and verify access controls with each staff role.
- Configure durable, private storage and access/retention rules for application documents; the default local upload directory is not a production document-hosting solution.
- Enter and independently verify company, tax, and bank details; test that unpublished details remain private and published instructions display only as intended.
- Run the full test suite and production build in CI, review dependency-audit advisories, and complete staging end-to-end checks, monitoring, alerting, and incident/backup procedures.

Until these environment and operational gates are completed, treat the portal as suitable for staging/internal testing rather than a public production launch.

### Custom Plugins

**Source Mapper Plugin**: Adds component introspection for AI tools
**Dev Tools Plugin**: Enables development mode enhancements
**Fullstory Integration**: Optional user analytics (configurable)

Configure in `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sourceMapperPlugin from "./source-mapper/src/index";
import { devToolsPlugin } from "./dev-tools/src/vite-plugin";
import { fullStoryPlugin } from "./fullstory-plugin";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({ babel: { plugins: [sourceMapperPlugin] } }),
    ...(mode === "development" ? [devToolsPlugin(), fullStoryPlugin()] : []),
  ],
}));
```

## 🎯 Best Practices

### Component Architecture

- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into hooks
- Prefer function components with hooks

### State Management

- Keep local state in components with useState/useReducer
- Use React Context for app-wide state (theme, auth)
- Consider external libraries (Zustand, Redux Toolkit) for complex state
- Leverage layout props for shared configuration

### Layout Usage

- Use RootLayout for multi-page sites (configure in `App.tsx`)
- Pages should only contain content, not layout concerns
- Define header/footer once, applies to all pages
- Follow layout documentation in `src/layouts/*.md`
- Never duplicate header/footer config across pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Run linting and tests
6. Submit a pull request

## 📄 License

MIT License - feel free to use this template for any project.

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev/)

---

**Happy coding! 🎉**
