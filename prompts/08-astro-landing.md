# Agent Prompt 8: Astro Landing Site

## Required Skills
- **Astro framework**: Static site generation, component architecture, content collections
- **SEO optimization**: Meta tags, structured data, performance, Open Graph
- **Responsive design**: Mobile-first CSS, media queries, fluid layouts
- **Content strategy**: Value proposition, feature presentation, copywriting
- **Tailwind CSS**: Utility classes, custom configuration, responsive utilities
- **Web performance**: Core Web Vitals, lazy loading, asset optimization

## Context
From brainstorm site structure:
- `/` - Astro landing page (SEO optimized)
- `/docs` - Astro documentation (static, fast)
- `/pricing` - Astro pricing page

**Positioning:** "Serverless key-value storage API"

**Value Props:**
- Simple key-value operations
- Serverless apps (Lambda, Cloudflare Workers, Vercel Edge)
- High scalability with unpredictable traffic
- Pay-per-request pricing model

## Exact File Structure
```
packages/landing/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   └── pricing.astro
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   └── CodeExample.astro
│   └── layouts/
│       └── Layout.astro
├── package.json
├── astro.config.mjs
└── tailwind.config.cjs
```

## Required Dependencies (package.json)
```json
{
  "name": "@kv/landing",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## Configuration Files

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://kv.vberkoz.com'
});
```

### tailwind.config.cjs
```javascript
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

## Implementation Requirements

### 1. src/layouts/Layout.astro
```astro
---
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <title>{title}</title>
  </head>
  <body class="bg-gray-50">
    <slot />
  </body>
</html>
```

### 2. src/components/Hero.astro
```astro
<section class="py-20 px-4">
  <div class="max-w-6xl mx-auto text-center">
    <h1 class="text-5xl font-bold mb-6">
      Serverless Key-Value Storage API
    </h1>
    <p class="text-xl text-gray-600 mb-8">
      Simple REST API for storing and retrieving JSON data without managing infrastructure
    </p>
    <div class="flex gap-4 justify-center">
      <a href="/dashboard" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
        Get Started Free
      </a>
      <a href="/docs" class="border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-100">
        View Docs
      </a>
    </div>
  </div>
</section>
```

### 3. src/components/Features.astro
```astro
<section class="py-20 px-4 bg-white">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">Why KV Storage?</h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-3">Simple API</h3>
        <p class="text-gray-600">Just GET, PUT, and DELETE. No complex queries or schemas.</p>
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-3">Serverless Ready</h3>
        <p class="text-gray-600">Perfect for Lambda, Cloudflare Workers, and Vercel Edge.</p>
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-3">Pay Per Request</h3>
        <p class="text-gray-600">Only pay for what you use. No idle costs.</p>
      </div>
    </div>
  </div>
</section>
```

### 4. src/components/CodeExample.astro
```astro
<section class="py-20 px-4">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">Quick Start</h2>
    <div class="bg-gray-900 text-white p-6 rounded-lg">
      <pre class="overflow-x-auto"><code>{`// Store a value
await fetch('https://api.kv.vberkoz.com/v1/myapp/user:123', {
  method: 'PUT',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({ value: { name: 'John' } })
});

// Retrieve a value
const res = await fetch('https://api.kv.vberkoz.com/v1/myapp/user:123', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
const data = await res.json();`}</code></pre>
    </div>
  </div>
</section>
```

### 5. src/pages/index.astro
```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import Features from '../components/Features.astro';
import CodeExample from '../components/CodeExample.astro';
---

<Layout 
  title="KV Storage - Serverless Key-Value API" 
  description="Simple REST API for storing and retrieving JSON data without managing infrastructure"
>
  <Hero />
  <Features />
  <CodeExample />
</Layout>
```

### 6. src/pages/pricing.astro
```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Pricing - KV Storage" description="Simple, transparent pricing">
  <section class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-bold text-center mb-12">Simple Pricing</h1>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="border rounded-lg p-8">
          <h3 class="text-2xl font-bold mb-4">Free</h3>
          <p class="text-4xl font-bold mb-6">$0<span class="text-lg">/mo</span></p>
          <ul class="space-y-3 mb-8">
            <li>100K requests/month</li>
            <li>25GB storage</li>
            <li>Community support</li>
          </ul>
          <a href="/dashboard" class="block text-center bg-gray-200 px-6 py-3 rounded-lg">Get Started</a>
        </div>
        <div class="border-2 border-blue-600 rounded-lg p-8">
          <h3 class="text-2xl font-bold mb-4">Pro</h3>
          <p class="text-4xl font-bold mb-6">$10<span class="text-lg">/mo</span></p>
          <ul class="space-y-3 mb-8">
            <li>1M requests/month</li>
            <li>100GB storage</li>
            <li>Email support</li>
          </ul>
          <a href="/dashboard" class="block text-center bg-blue-600 text-white px-6 py-3 rounded-lg">Upgrade</a>
        </div>
        <div class="border rounded-lg p-8">
          <h3 class="text-2xl font-bold mb-4">Scale</h3>
          <p class="text-4xl font-bold mb-6">$30<span class="text-lg">/mo</span></p>
          <ul class="space-y-3 mb-8">
            <li>10M requests/month</li>
            <li>500GB storage</li>
            <li>Priority support</li>
          </ul>
          <a href="/dashboard" class="block text-center bg-gray-200 px-6 py-3 rounded-lg">Upgrade</a>
        </div>
      </div>
    </div>
  </section>
</Layout>
```

## Success Criteria
- [ ] `pnpm dev` starts Astro dev server
- [ ] `pnpm build` creates static site
- [ ] Landing page loads in <2 seconds
- [ ] Mobile responsive design works
- [ ] SEO meta tags present
- [ ] Code examples are readable
- [ ] Pricing page displays all tiers