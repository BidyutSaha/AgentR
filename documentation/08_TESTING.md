# Testing Documentation

Complete testing strategy and guide for the Literature Review System.

**Last Updated**: 2025-12-31

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Coverage Goals](#test-coverage-goals)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Authentication Tests](#authentication-tests)
6. [User Projects Tests](#user-projects-tests)
7. [LLM Pipeline Tests](#llm-pipeline-tests)
8. [Test Data Management](#test-data-management)
9. [Known Gaps](#known-gaps)
10. [Recent Changes](#recent-changes)

---

## Testing Strategy

### Philosophy

- **Test behavior, not implementation** — Tests should verify what the code does, not how it does it
- **Fast feedback** — Unit tests run in milliseconds, integration tests in seconds
- **Reliable** — No flaky tests; tests should pass consistently
- **Maintainable** — Tests should be easy to understand and update

### Test Pyramid

```
        ┌─────────────┐
        │   E2E (10%) │  ← Full API tests
        ├─────────────┤
        │ Integration │  ← Service + DB tests
        │    (30%)    │
        ├─────────────┤
        │    Unit     │  ← Pure function tests
        │    (60%)    │
        └─────────────┘
```

### Scope

**In Scope**:
- ✅ Unit tests for services
- ✅ Integration tests for database operations
- ✅ E2E tests for API endpoints
- ✅ Authentication flow testing
- ✅ Input validation testing
- ✅ Error handling testing

**Out of Scope**:
- ❌ Frontend testing (separate test suite)
- ❌ Load testing (future)
- ❌ Security penetration testing (manual)
- ❌ Browser compatibility testing (frontend)

---

## Test Coverage Goals

### Current Coverage

| Component | Current | Target | Status |
|-----------|---------|--------|--------|
| Services | ~40% | 80% | 🔴 Below target |
| Repositories | ~30% | 70% | 🔴 Below target |
| Controllers | ~50% | 60% | 🟡 Close to target |
| Utils | ~90% | 90% | 🟢 At target |
| **Overall** | **~40%** | **70%** | 🔴 **Below target** |

### Priority Areas

**High Priority** (must reach 80%):
1. Authentication services
2. Password hashing/verification
3. Token generation/validation
4. User project CRUD operations

**Medium Priority** (must reach 70%):
5. Email sending
6. Database repositories
7. Input validation

**Low Priority** (must reach 60%):
8. Controllers (thin layer)
9. Middleware
10. Error handlers

---

## Running Tests

### All Tests

```bash
cd literature-review-backend
npm test
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

Opens HTML coverage report in browser.

### Specific Test File

```bash
npm test -- auth.service.test.ts
```

### Specific Test Suite

```bash
npm test -- --testNamePattern="User registration"
```

---

## Test Structure

### Directory Structure

```
literature-review-backend/
└── src/
    ├── services/
    │   ├── auth/
    │   │   ├── auth.service.ts
    │   │   └── auth.service.test.ts      ← Unit tests
    │   └── userProject/
    │       ├── userProject.service.ts
    │       └── userProject.service.test.ts
    │
    ├── repositories/
    │   ├── user.repository.ts
    │   └── user.repository.test.ts        ← Integration tests
    │
    └── __tests__/
        ├── integration/                    ← Integration tests
        │   ├── auth.integration.test.ts
        │   └── projects.integration.test.ts
        │
        └── e2e/                            ← E2E API tests
            ├── auth.e2e.test.ts
            └── projects.e2e.test.ts
```

### Test File Naming

- Unit tests: `*.test.ts` (next to source file)
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

---

## Authentication Tests

### Test Coverage

**File**: `src/services/auth/auth.service.test.ts`

**Test Suites**:

#### 1. User Registration
- ✅ Should create user with valid data
- ✅ Should hash password before storing
- ✅ Should generate verification token
- ✅ Should send verification email
- ✅ Should reject duplicate email
- ✅ Should reject invalid email format
- ✅ Should reject weak password
- ✅ Should set isVerified to false

#### 2. User Login
- ✅ Should return tokens for valid credentials
- ✅ Should reject invalid password
- ✅ Should reject non-existent email
- ✅ Should reject unverified email
- ✅ Should reject inactive account
- ✅ Should update last login timestamp
- ✅ Should create refresh token in database

#### 3. Email Verification
- ✅ Should verify email with valid token
- ✅ Should reject expired token
- ✅ Should reject invalid token
- ✅ Should reject already-used token
- ✅ Should set isVerified to true
- ✅ Should mark token as used

#### 4. Password Reset
- ✅ Should generate reset token for valid email
- ✅ Should send reset email
- ✅ Should not reveal if email doesn't exist
- ✅ Should reset password with valid token
- ✅ Should reject expired reset token
- ✅ Should revoke all refresh tokens on reset

#### 5. Token Refresh
- ✅ Should generate new tokens with valid refresh token
- ✅ Should reject expired refresh token
- ✅ Should reject revoked refresh token
- ✅ Should revoke old token and create new one

### Running Auth Tests

```bash
npm test -- auth.service.test.ts
```

### Sample Test

```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const result = await authService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.user.isVerified).toBe(false);
      expect(result.user.passwordHash).not.toBe(userData.password);
    });
  });
});
```

---

## User Projects Tests

### Test Coverage

**File**: `src/services/userProject/userProject.service.test.ts`

**Test Suites**:

#### 1. Create Project
- ✅ Should create project for authenticated user
- ✅ Should associate project with user ID
- ✅ Should validate project name length
- ✅ Should validate user idea is not empty
- ✅ Should set timestamps automatically

#### 2. Get Project by ID
- ✅ Should return project for owner
- ✅ Should reject access by non-owner
- ✅ Should return 404 for non-existent project
- ✅ Should include all project fields

#### 3. Get All User Projects
- ✅ Should return all projects for user
- ✅ Should return empty array if no projects
- ✅ Should not return other users' projects
- ✅ Should sort by creation date (newest first)

#### 4. Update Project
- ✅ Should update project name
- ✅ Should update user idea
- ✅ Should update timestamp
- ✅ Should reject update by non-owner
- ✅ Should validate updated data

#### 5. Delete Project
- ✅ Should delete project for owner
- ✅ Should reject delete by non-owner
- ✅ Should return 404 for non-existent project
- ✅ Should cascade delete related data (future)

### Running Project Tests

```bash
npm test -- userProject.service.test.ts
```

---

## LLM Pipeline Tests

### Test Coverage

**Files**:
- `src/services/intent/intent.service.test.ts`
- `src/services/queries/queries.service.test.ts`
- `src/services/score/score.service.test.ts`

**Test Suites**:

#### 1. Intent Decomposition (Stage 1)
- ✅ Should extract problem statement
- ✅ Should extract proposed solution
- ✅ Should extract methodology
- ✅ Should extract expected contributions
- ✅ Should handle short abstracts
- ✅ Should handle long abstracts
- ✅ Should reject empty abstract
- ⚠️ Should mock OpenAI API calls

#### 2. Query Generation (Stage 2)
- ✅ Should generate search queries from intent
- ✅ Should accept Stage 1 output directly
- ✅ Should generate multiple query variations
- ✅ Should include keywords
- ⚠️ Should mock OpenAI API calls

#### 3. Paper Scoring
- ✅ Should score paper relevance
- ✅ Should categorize as C1 or C2
- ✅ Should identify research gaps
- ✅ Should handle missing abstract
- ⚠️ Should mock OpenAI API calls

### Running LLM Tests

```bash
npm test -- intent.service.test.ts
npm test -- queries.service.test.ts
npm test -- score.service.test.ts
```

### Mocking OpenAI

**Important**: Tests should mock OpenAI API calls to:
- Avoid API costs
- Ensure consistent test results
- Enable offline testing
- Speed up test execution

**Example Mock**:
```typescript
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                problemStatement: 'Mocked problem',
                proposedSolution: 'Mocked solution'
              })
            }
          }]
        })
      }
    }
  }))
}));
```

---

## Test Data Management

### Test Database

**Recommendation**: Use separate test database

```bash
# .env.test
DATABASE_URL="postgresql://user:pass@localhost:5432/literature_review_test"
```

### Test Data Fixtures

**Location**: `src/__tests__/fixtures/`

**Files**:
- `users.fixture.ts` — Sample user data
- `projects.fixture.ts` — Sample project data
- `tokens.fixture.ts` — Sample token data

**Example Fixture**:
```typescript
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'Test',
    lastName: 'User'
  },
  unverifiedUser: {
    email: 'unverified@example.com',
    password: 'SecurePass123!',
    isVerified: false
  }
};
```

### Database Cleanup

**Before Each Test Suite**:
```typescript
beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean database
  await prisma.userProject.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Known Gaps

### Missing Tests

**High Priority**:
- ❌ Email service tests (mocking SMTP)
- ❌ File upload tests (future feature)
- ❌ Rate limiting tests
- ❌ CORS tests

**Medium Priority**:
- ❌ Middleware tests (auth, error handling)
- ❌ Input validation edge cases
- ❌ Database transaction tests

**Low Priority**:
- ❌ Logging tests
- ❌ Configuration tests
- ❌ Health check tests

### Flaky Tests

**None currently** — If you encounter flaky tests, report them immediately.

### Slow Tests

**Threshold**: Tests taking > 5 seconds

**Current slow tests**:
- None identified yet

**If tests become slow**:
1. Check for missing mocks (especially OpenAI, email)
2. Optimize database queries
3. Use in-memory database for unit tests

---

## Recent Changes

### 2025-12-31
- Created comprehensive testing documentation
- Consolidated scattered testing files
- Defined coverage goals (70% overall)
- Documented test structure and naming conventions

### 2025-12-28
- Added user projects API tests
- Tested GET /v1/user-projects/user/:userId endpoint
- Verified JWT authentication in tests

### 2025-12-27
- Added paper scoring tests
- Merged Stages 5+6+7 test suites

---

## Best Practices

### Writing Good Tests

✅ **DO**:
- Use descriptive test names
- Test one thing per test
- Use AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Clean up after tests
- Use fixtures for test data

❌ **DON'T**:
- Test implementation details
- Share state between tests
- Use real API keys in tests
- Skip tests without documenting why
- Write flaky tests

### Test Naming Convention

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

**Example**:
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return tokens when credentials are valid', () => {
      // ...
    });
    
    it('should throw error when password is incorrect', () => {
      // ...
    });
  });
});
```

---

## Continuous Integration

### GitHub Actions (Future)

**Planned workflow**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

**Coverage Requirements**:
- Minimum 70% overall coverage
- No decrease in coverage on PRs

---

## Additional Resources

- **API Documentation**: [03_API.md](./03_API.md)
- **Database Schema**: [04_DATABASE.md](./04_DATABASE.md)
- **Setup Guide**: [01_SETUP.md](./01_SETUP.md)
- **Project Status**: [00_PROJECT_STATUS.md](./00_PROJECT_STATUS.md)

---

**For test implementation examples, see the test files in `literature-review-backend/src/`**
