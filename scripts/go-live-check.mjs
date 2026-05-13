import fs from 'node:fs'

const failures = []
const warnings = []

function requireFile(path) {
  if (!fs.existsSync(path)) failures.push(`Missing required file: ${path}`)
}

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : ''
}

requireFile('src/components/SecurityProvider.tsx')
requireFile('src/lib/security.ts')
requireFile('tailwind.config.cjs')
requireFile('vercel.json')
requireFile('.vercelignore')

const pkg = JSON.parse(read('package.json') || '{}')
if (pkg.type !== 'module') {
  failures.push('package.json must set "type": "module" for Vite/PostCSS ESM config')
}

const vercelIgnore = read('.vercelignore')
if (/^SECURITY\*/m.test(vercelIgnore)) {
  failures.push('.vercelignore has an unscoped SECURITY* rule that can remove SecurityProvider.tsx')
}
if (!vercelIgnore.includes('!src/components/SecurityProvider.tsx')) {
  failures.push('.vercelignore must explicitly keep src/components/SecurityProvider.tsx')
}

const vercelJson = read('vercel.json')
for (const header of [
  'Content-Security-Policy',
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
]) {
  if (!vercelJson.includes(header)) warnings.push(`vercel.json is missing ${header}`)
}

const envCheckEnabled = process.env.GO_LIVE_ENV_CHECK === '1'
if (envCheckEnabled) {
  const requiredEnv = [
    'VITE_API_BASE_URL',
    'VITE_API_URL',
    'SECRET_KEY',
    'DATABASE_URL',
    'REDIS_URL',
    'MOONSHOT_API_KEY',
    'S3_ENDPOINT',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_BASIC_ID',
    'STRIPE_PRICE_PRO_ID',
  ]

  for (const name of requiredEnv) {
    if (!process.env[name]) failures.push(`Missing production environment variable: ${name}`)
  }
}

if (!fs.existsSync('package-lock.json')) {
  warnings.push('package-lock.json is missing; commit a lockfile for reproducible Vercel installs')
}

if (warnings.length) {
  console.warn('\nGo-live warnings:')
  for (const warning of warnings) console.warn(`- ${warning}`)
}

if (failures.length) {
  console.error('\nGo-live check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Go-live static checks passed.')
