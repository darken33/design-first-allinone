# Contributing to HelloAPI Node.js

## Development Workflow

1. **Fork** the repository and create a feature branch
2. **Write tests first** (TDD) before implementing features
3. **Run quality checks** before pushing:
   ```bash
   npm run lint && npm run type-check && npm test
   ```
4. **Open a Pull Request** with a clear description

## Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/<short-description>` | `feat/add-farewell-endpoint` |
| Bug fix | `fix/<short-description>` | `fix/validation-edge-case` |
| Docs | `docs/<short-description>` | `docs/update-api-usage` |
| Refactor | `refactor/<short-description>` | `refactor/extract-cors-config` |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

**Examples**:
```
feat(api): add GET /api/farewell endpoint
fix(validation): reject names with leading digits
docs(readme): add docker compose example
test(integration): add full-workflow smoke test
```

## Adding a New Endpoint

1. Update `specs/001-hello-api-node/openapi.yaml` with the new path/schema
2. Run `npm run generate:api` to regenerate types
3. Write integration test in `tests/integration/`
4. Implement controller in `src/api/controllers/`
5. Add service method in `src/services/`
6. Register route in `src/api/routes/`
7. Update `src/index.ts` if needed

## Testing Requirements

All PRs must maintain or improve:
- Test coverage ≥ 80% (statements, branches, functions, lines)
- All existing tests passing
- New features must have matching tests

```bash
# Run all tests with coverage
npm test -- --coverage

# Run only integration tests
npm run test:integration

# Run only contract tests  
npm run test:contract
```

## Code Style

- **TypeScript strict mode** — no `any` without justification
- **ESLint** — zero warnings (`npm run lint`)
- **Prettier** — consistent formatting (`npm run format`)
- **No manual edits** to `src/generated/` — always regenerate from OpenAPI

## PR Checklist

- [ ] Tests written for new functionality
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm test` passes (all suites)
- [ ] OpenAPI spec updated if API surface changed
- [ ] `npm run generate:api` run if OpenAPI changed
- [ ] `README.md` or docs updated if behavior changed
