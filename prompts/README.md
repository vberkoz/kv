# KV Storage Agent Prompts

This directory contains 18 sequential agent prompts for building the KV storage application incrementally.

## Usage Instructions

1. **Execute prompts in order** - Each prompt builds on the previous ones
2. **Use Amazon Q Developer** - Copy each prompt and use with `/dev` command
3. **Test after each step** - Verify functionality before moving to next prompt
4. **Small incremental changes** - Each prompt focuses on one specific feature

## Prompt Sequence

### Phase 1: Foundation (Prompts 1-7)
- 01: Project setup and monorepo structure
- 02: DynamoDB single table design
- 03: Core Lambda CRUD functions
- 04: API Gateway setup
- 05: Namespace management
- 06: User authentication system
- 07: Usage tracking and limits

### Phase 2: Frontend (Prompts 8-13)
- 08: Astro landing site
- 09: React dashboard setup
- 10: S3 + CloudFront deployment
- 11: Authentication UI
- 12: Dashboard core features
- 13: API testing interface

### Phase 3: Payments & Launch (Prompts 14-18)
- 14: Paddle payment integration
- 15: Plan enforcement and rate limiting
- 16: Documentation site
- 17: Client libraries and SDKs
- 18: Launch preparation and optimization

## Tips for Success

- **Test thoroughly** after each prompt
- **Deploy incrementally** to catch issues early
- **Use `/review`** command to check code quality
- **Ask for clarification** if any step is unclear
- **Adapt prompts** based on your specific needs

## Expected Timeline

- **Week 1**: Prompts 1-7 (Backend foundation)
- **Week 2**: Prompts 8-10 (Frontend setup)
- **Week 3**: Prompts 11-13 (Dashboard features)
- **Week 4**: Prompts 14-15 (Payments)
- **Week 5**: Prompts 16-17 (Documentation & SDKs)
- **Week 6**: Prompt 18 (Launch prep)

Each prompt should take 2-4 hours to complete and test.