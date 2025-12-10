# Agent Prompt 16: Documentation Site

## Required Skills
- **Technical writing**: Clear explanations, code examples, tutorial structure
- **Information architecture**: Logical organization, searchability, navigation
- **SEO**: Content optimization, discoverability, meta tags, structured data
- **Developer experience**: Quick start guides, troubleshooting, best practices
- **Documentation tools**: Static site generators, search integration, versioning
- **Code examples**: Multi-language snippets, syntax highlighting, copy functionality

## Context
From brainstorm marketing channels:
- Dev.to tutorials ("Build a backend in 5 minutes")
- GitHub repo with examples
- Templates and examples - Todo app, blog, e-commerce

## Implementation Requirements

### Use Astro for documentation site
```
packages/landing/src/pages/docs/
├── index.astro          # Overview
├── quickstart.astro    # 5-min guide
├── api-reference.astro # All endpoints
└── examples.astro      # Use cases
```

### Quick Start Content
```markdown
# Quick Start (5 minutes)

## 1. Sign up
Create account at https://kv.vberkoz.com

## 2. Get API key
Copy from dashboard

## 3. Store a value
```bash
curl -X PUT "https://api.kv.vberkoz.com/v1/myapp/user:123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"value": {"name": "John"}}'
```

## 4. Retrieve value
```bash
curl "https://api.kv.vberkoz.com/v1/myapp/user:123" \\
  -H "Authorization: Bearer YOUR_API_KEY"
```
```

### API Reference Content
```markdown
# API Reference

## PUT /v1/{namespace}/{key}
Store or update a value

**Headers:**
- Authorization: Bearer {apiKey}
- Content-Type: application/json

**Body:**
```json
{"value": any}
```

**Response:** 201 Created

## GET /v1/{namespace}/{key}
Retrieve a value

**Response:**
```json
{"value": any}
```

## DELETE /v1/{namespace}/{key}
Delete a value

**Response:** 204 No Content
```

## Success Criteria
- [ ] All endpoints documented
- [ ] Quick start takes <5 minutes
- [ ] Code examples copy-paste ready
- [ ] SEO meta tags present