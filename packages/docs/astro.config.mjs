// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'KV Storage Docs',
			description: 'Documentation for KV Storage - Serverless key-value storage API',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/vberkoz/kv-storage' }
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Quick Start', slug: 'getting-started/quickstart' },
						{ label: 'Authentication', slug: 'getting-started/authentication' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'REST API', slug: 'api/rest' },
						{ label: 'JavaScript SDK', slug: 'api/javascript' },
						{ label: 'Rate Limits', slug: 'api/rate-limits' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Use Cases', slug: 'guides/use-cases' },
						{ label: 'Best Practices', slug: 'guides/best-practices' },
					],
				},
			],
		}),
	],
});
