# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-22

### Added

- 🎉 Initial release of PR Trivia Checker
- ✅ Mock backend client for development and testing
- 🔐 API Key authentication via action inputs
- 💬 Smart commenting system with duplicate detection
- 📝 Support for pull_request and workflow_dispatch events
- 🎭 Multiple mock scenarios (success, pending, invalid, expired)
- 📖 Comprehensive documentation (README, TECHNICAL, QUICKSTART, EXAMPLES)
- 🛠️ Development scripts for local testing
- 🏗️ TypeScript-based architecture with full type safety
- 🔄 Extensible design ready for production migration

### Documentation

- README.md - Main documentation
- TECHNICAL.md - Technical architecture and migration guide
- QUICKSTART.md - Quick start guide
- EXAMPLES.md - Workflow configuration examples
- Inline code comments explaining mock vs production code

### Features

- Block PRs until external trivia validation is completed
- Automatic comment creation and updates on PRs
- Support for different validation states (pending, completed, error)
- Error handling for authentication failures
- Detailed logging for debugging
- No duplicate comments (marker-based detection)

### Technical Details

- Node.js 20 runtime
- TypeScript with strict mode
- Uses @actions/core and @actions/github
- Compiled with @vercel/ncc
- ESLint + Prettier for code quality
- MIT License

## [Unreleased]

### Planned Features

- [ ] Unit tests with Jest
- [ ] Integration tests
- [ ] Response caching
- [ ] Retry logic with exponential backoff
- [ ] Multi-trivia support per repository
- [ ] Metrics dashboard
- [ ] Slack/Discord notifications
- [ ] Dry-run mode
- [ ] Configuration via .trivia.yml file

---

## Version History

### Version Naming Convention

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backward compatible
- **Patch (1.0.X)**: Bug fixes, minor improvements

### Migration Notes

When upgrading from mock to production backend:

1. Update `BACKEND_URL` in `src/backendClient.ts`
2. Uncomment production code block
3. Comment/remove mock code
4. Rebuild: `npm run build`
5. Test in staging environment first

---

[1.0.0]: https://github.com/your-org/pr-trivia-checker/releases/tag/v1.0.0
