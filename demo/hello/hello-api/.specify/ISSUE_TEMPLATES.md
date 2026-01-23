# Issue & Task Templates (Constitution-Aligned)

Modèles pour créer issues/tasks qui respectent automatiquement la constitution HelloAPI.

---

## 📝 Template: Feature Request

Utilisez ce template quand un utilisateur/PO demande une nouvelle feature.

```markdown
## Title: [FEATURE] Add {specific capability}

### Description
Brief description of what feature does and why it's needed.

### User Story
As a [user], I want [capability] so that [benefit].

### Acceptance Criteria
- [ ] API endpoint(s) defined in OpenAPI YAML
- [ ] Endpoint returns correct HTTP status code(s)
- [ ] Input validation working (e.g., field length, required fields)
- [ ] Response format matches DTO schema
- [ ] Unit tests: ≥80% coverage
- [ ] Integration tests: happy path + error cases
- [ ] API documentation accessible via Swagger UI

### Implementation Checklist
- [ ] Update `../hello.yaml` (OpenAPI contract)
- [ ] Run `mvn openapi-generator:generate`
- [ ] Implement Delegate in `api/impl/`
- [ ] Create Service interface in `hello/api/`
- [ ] Implement Service in `hello/domain/`
- [ ] Write unit tests (no @SpringBootTest)
- [ ] Write integration tests (@SpringBootTest + MockMvc)
- [ ] Update README.md if applicable
- [ ] Run `mvn clean package` locally (must pass)
- [ ] Create PR with checklist items

### Technical Notes
- Follow Layered Architecture (Principle III)
- Contract-first: YAML defines API (Principle II)
- Constructor injection only (no @Autowired on fields)
- All tests must have @DisplayName

### Dependencies
- [ ] No new external libraries (justify if needed)
- [ ] No modifications to generated code

### Review Notes
Reviewer will check:
- Architecture compliance (see CODE_REVIEW_CHECKLIST.md)
- Test coverage (≥80%)
- No breaking changes to API
- Constitution principles respected

---
Labels: type/feature, constitution/compliant
Points: (estimate)
```

---

## 🐛 Template: Bug Report

```markdown
## Title: [BUG] {Component}: {Issue description}

### Description
What went wrong? Include error message or unexpected behavior.

### Reproduction Steps
1. ...
2. ...
3. ...

### Expected Behavior
What should happen instead?

### Actual Behavior
What currently happens?

### Environment
- Java version: 25
- Spring Boot version: 4.0.0-M1
- Environment: (dev/staging/prod)

### Root Cause (if known)
Suspected component or code path.

### Fix Implementation
- [ ] Unit test written to verify fix
- [ ] Integration test confirms fix works
- [ ] No breaking changes to API
- [ ] All existing tests still pass

### Testing
- [ ] Tested locally with `mvn clean package`
- [ ] Tested on staging if applicable

### Labels
- type/bug
- severity/(critical|high|medium|low)
- component/(api|service|config|security|etc)

---
```

---

## 🏗️ Template: Architecture Decision Record (ADR)

Use this when making architectural decisions that affect the constitution or code structure.

```markdown
## Title: ADR-{number}: {Decision Title}

### Status
- Proposed / Accepted / Deprecated

### Context
What is the issue we're addressing? Why is this decision needed?

### Decision
What decision have we made? Explain concisely.

### Rationale
Why is this the best choice? What alternatives considered?

### Consequences
What will change as a result?

**Positive:**
- Improved [X]
- Reduced [Y]

**Negative:**
- May complicate [Z]
- Requires [training/migration]

### Implementation Plan
If this affects code:
- [ ] Update constitution if principle-level change
- [ ] Update DEVELOPER_GUIDE.md if new pattern
- [ ] Update CODE_REVIEW_CHECKLIST.md if new review criteria
- [ ] Provide migration path for existing code

### Constitution Alignment
- [ ] Aligns with Principle I (Microservice-First)?
- [ ] Aligns with Principle II (Contract-First)?
- [ ] Aligns with Principle III (Layered)?
- [ ] Aligns with Principle IV (Testing)?
- [ ] Aligns with Principle V (Java 25)?
- [ ] Aligns with Principle VI (Container-Ready)?

### References
- Related issues/PRs: #...
- External references: [links]

---
```

---

## 📋 Template: Code Review Task

Use this to create a subtask or checklist item for code reviewers.

```markdown
## Title: [REVIEW] {Feature/PR Name}

### PR Details
- Repository: HelloAPI
- Branch: feature/{name}
- Author: @{username}

### Code Review Checklist
Use the detailed checklist from `.specify/CODE_REVIEW_CHECKLIST.md`:

- [ ] Architecture & Layers (Principle III)
  - [ ] Separation of concerns respected
  - [ ] No business logic in config/
  - [ ] Constructor injection used

- [ ] OpenAPI Contract (Principle II)
  - [ ] YAML updated
  - [ ] Code generated
  - [ ] DTOs used correctly

- [ ] Test Coverage (Principle IV)
  - [ ] Unit tests written
  - [ ] Integration tests written
  - [ ] Coverage ≥80%

- [ ] Java 25 & Security (Principle V)
  - [ ] No deprecated Java features
  - [ ] No secrets in code
  - [ ] Input validation

- [ ] Container & K8s (Principle VI)
  - [ ] Dockerfile OK (if applicable)
  - [ ] K8s manifests OK (if applicable)

- [ ] Code Quality
  - [ ] Readable & documented
  - [ ] Build passes locally
  - [ ] No red flags

### Decision
- [ ] Approved (ready to merge)
- [ ] Request Changes (specify below)
- [ ] Comments Only (FYI)

### Comments
(Detailed feedback for author)

---
```

---

## 🔄 Template: Refactoring Task

```markdown
## Title: [REFACTOR] {Area}: {Objective}

### Description
What code is being refactored and why?
- Current state: [description]
- Desired state: [description]
- Benefit: [impact]

### Scope
- Affected packages: [list]
- Estimated effort: [Xd or XPts]
- Risk level: (low/medium/high)

### Constitution Compliance
- [ ] Refactoring respects Principle I-VI
- [ ] No breaking changes to API
- [ ] All tests still pass
- [ ] Coverage maintained (≥80%)

### Acceptance Criteria
- [ ] Code compiles without warnings
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Documentation updated (if applicable)
- [ ] Code review approved

### Testing Strategy
- [ ] Behavior unchanged (validate_behavior_changes)
- [ ] No regression tests needed? (justify if yes)
- [ ] Manual testing required? (describe)

---
```

---

## 📚 Template: Documentation Task

```markdown
## Title: [DOCS] {Area}: {What to document}

### Description
What needs documenting and why?

### Deliverables
- [ ] Update section in README.md
- [ ] Add JavaDoc to [class/method]
- [ ] Update architecture decision in ADR
- [ ] Update DEVELOPER_GUIDE.md pattern (if new pattern)
- [ ] Update CODE_REVIEW_CHECKLIST.md (if new criteria)

### Acceptance Criteria
- [ ] Documentation is clear and complete
- [ ] Links are correct
- [ ] Examples are tested & working
- [ ] Spelling/grammar checked

---
```

---

## ✅ Template: Testing Task

```markdown
## Title: [TEST] {Component}: Achieve {coverage goal}

### Current State
- Current coverage: X%
- Gap: [description of untested code]

### Goal
- Target coverage: 80%+
- Tests needed: [list]

### Implementation
- [ ] Unit test for [method] written
- [ ] Integration test for [endpoint] written
- [ ] Edge cases covered ([list])
- [ ] All tests pass locally

### Acceptance Criteria
- [ ] Coverage ≥80% (verified via Maven/SonarQube)
- [ ] All tests pass
- [ ] Tests @DisplayName-ed and clear

---
```

---

## 🔐 Template: Security Task

```markdown
## Title: [SECURITY] {Component}: {Issue/Improvement}

### Issue Description
What is the security concern?
- Vulnerability: [CVE or description]
- Severity: (critical/high/medium/low)
- Affected component(s): [list]

### Remediation
How to fix?
- [ ] Update dependency to version X
- [ ] Add input validation
- [ ] Remove hardcoded secrets
- [ ] Add authentication/authorization
- [ ] Update security header

### Verification
- [ ] Security scan passes (OWASP, Snyk, etc.)
- [ ] Tests cover security scenario
- [ ] Approved by security reviewer

### Constitution Alignment
- Aligns with Principle V (Security)?

---
```

---

## 🎯 Template: Performance Task

```markdown
## Title: [PERF] {Component}: {Optimization}

### Current State
- Metric: [response time, CPU, memory, etc]
- Current value: X
- Goal: Y

### Optimization Plan
- [ ] Profile to identify bottleneck
- [ ] Implement optimization
- [ ] Benchmark improvement
- [ ] JVM tuning if needed

### Acceptance Criteria
- [ ] Performance target met
- [ ] No functional regression
- [ ] Tests pass

### Constitution Alignment
- Aligns with Principle VI (Container-Ready)?

---
```

---

## 📊 Label Recommendations

Use these labels consistently:

**Type:**
- `type/feature` – New functionality
- `type/bug` – Bug fix
- `type/refactor` – Code refactoring
- `type/docs` – Documentation
- `type/test` – Testing improvements
- `type/security` – Security issues
- `type/perf` – Performance optimization

**Constitution:**
- `constitution/compliant` – Follows all principles
- `constitution/exception` – Documented exception (rare)
- `constitution/review-needed` – Needs constitutional review

**Severity:**
- `severity/critical` – Blocks production
- `severity/high` – Significant impact
- `severity/medium` – Noticeable impact
- `severity/low` – Nice to have

**Component:**
- `component/api` – REST API layer
- `component/service` – Business logic
- `component/security` – Security config
- `component/deployment` – Docker/K8s
- `component/testing` – Test framework
- `component/build` – Maven/build process

**Priority:**
- `priority/p0` – Sprint critical
- `priority/p1` – Sprint important
- `priority/p2` – Backlog (can defer)

---

**LastUpdated:** 2026-01-23 | **Version:** 1.0.0
