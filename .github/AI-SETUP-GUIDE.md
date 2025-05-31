# AI Assistant Ecosystem Setup Guide

This project uses a three-part AI assistant system to maintain code quality and consistency.

## System Overview

1. **Claude Code** - Comprehensive knowledge repository and context architecture
2. **Cursor** - Active behavioral rules that guide AI during coding  
3. **GitHub Copilot** - Persistent instructions for continuous AI assistance

## Initial Setup

The AI ecosystem has already been configured for this project. To understand the setup:

### 1. Explore Claude Code Documentation
```bash
# View the comprehensive project analysis
ls claude/
cat claude/codebase-map.md
cat claude/discovered-patterns.md
```

### 2. Review Cursor Rules
```bash
# Check active coding rules
ls .cursor/rules/
cat .cursor/rules/always/core-conventions.mdc
```

### 3. Read Copilot Instructions
```bash
# See inline assistance configuration
cat .github/copilot-instructions.md
ls .github/instructions/
ls .github/prompts/
```

## New Developer Onboarding

- [ ] Install Claude Code, Cursor, and GitHub Copilot extensions
- [ ] Run `/user:ai-ecosystem-setup` in Claude Code for introduction
- [ ] Review generated documentation in `claude/` directory
- [ ] Test each system with sample tasks from `.github/prompts/`
- [ ] Read CLAUDE.md for quick reference

## Maintenance Schedule

### Weekly
- Quick review during team retrospectives
- Note any repeated pattern violations

### Monthly  
- Update for new patterns or pain points
- Run `/user:rules-sync` if patterns changed

### Quarterly
- Full context refresh with `/user:context-update`
- Review and update all documentation

### Annually
- Complete regeneration if major architecture changes
- Optimize instructions with `/user:instructions-optimize`

## Common Maintenance Tasks

### Updating for New Patterns
When significant new features are added:
1. Run `/user:context-update` to analyze changes
2. Run `/user:rules-sync` to update Cursor rules
3. Review and commit the changes

### Optimizing Instructions
When Copilot suggestions drift from expectations:
1. Run `/user:instructions-optimize`
2. Focus on the 80/20 rule - keep patterns affecting most code
3. Test generated code quality before and after

### Troubleshooting

**Issue**: AI suggestions don't match new patterns
**Solution**: Run context update followed by rules sync

**Issue**: Conflicting guidance between systems  
**Solution**: Check generation order - Claude Code → Cursor → Copilot

**Issue**: Rules causing false positives
**Solution**: Review rule specificity and improve glob patterns

## Key Files Reference

- `CLAUDE.md` - Primary context file with key patterns
- `claude/discovered-patterns.md` - All coding conventions
- `.cursor/rules/always/` - Universal coding rules (<500 lines total)
- `.github/copilot-instructions.md` - Core Copilot guidance (<500 lines)
- `.github/prompts/` - Reusable prompt templates

## Contributing to AI Configuration

When updating AI configuration:
1. Always update in order: Claude Code → Cursor → Copilot
2. Test changes with real coding scenarios
3. Ensure no contradictions between systems
4. Keep documentation concise and example-focused
5. Commit AI config changes separately from code changes

Remember: The AI configuration is living documentation that evolves with the codebase.