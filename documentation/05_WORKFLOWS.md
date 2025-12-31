# Key Workflows

Important workflows and processes in the Literature Review System.

---

## Table of Contents

1. [User Registration & Verification](#user-registration--verification)
2. [User Login](#user-login)
3. [Password Reset](#password-reset)
4. [Create Research Project](#create-research-project)
5. [Literature Review Pipeline](#literature-review-pipeline)
6. [Token Refresh](#token-refresh)

---

## User Registration & Verification

### Overview

New users register with email/password, receive verification email, and verify their account before logging in.

### Steps

1. **User submits registration form**
   - Email, password, first name, last name
   - Password must meet strength requirements

2. **Backend validates input**
   - Email format validation
   - Password strength validation
   - Check email doesn't already exist

3. **Backend creates user account**
   - Hash password with bcrypt (cost: 12)
   - Set `isVerified = false`
   - Set `isActive = true`
   - Generate UUID for user

4. **Backend generates verification token**
   - Create UUID token
   - Set expiration (24 hours from now)
   - Store in `email_verification_tokens` table

5. **Backend sends verification email**
   - Email contains verification link
   - Link format: `{FRONTEND_URL}/verify-email?token={token}`

6. **User clicks verification link**
   - Opens link in browser
   - Frontend extracts token from URL
   - Frontend calls `GET /v1/auth/verify-email?token={token}`

7. **Backend verifies token**
   - Check token exists and not expired
   - Check token not already used
   - Set user's `isVerified = true`
   - Mark token as used

8. **User can now log in**

### Error Handling

- **Email exists**: Return 409 Conflict
- **Invalid email format**: Return 400 Bad Request
- **Weak password**: Return 400 Bad Request
- **Token expired**: Return 400 Bad Request
- **Token invalid**: Return 400 Bad Request

### Security Considerations

- Password never stored in plain text
- Verification token is single-use
- Token expires after 24 hours
- Email sending is asynchronous (doesn't block registration)

---

## User Login

### Overview

Verified users log in with email/password and receive JWT tokens.

### Steps

1. **User submits login form**
   - Email and password

2. **Backend validates input**
   - Email format validation
   - Password not empty

3. **Backend finds user by email**
   - If not found, return generic error (don't reveal if email exists)

4. **Backend checks account status**
   - Check `isVerified = true`
   - Check `isActive = true`

5. **Backend verifies password**
   - Compare submitted password with stored hash using bcrypt

6. **Backend generates JWT tokens**
   - **Access token**: Expires in 15 minutes
   - **Refresh token**: Expires in 7 days
   - Both contain user ID and email

7. **Backend stores refresh token**
   - Save in `refresh_tokens` table
   - Store expiration time

8. **Backend updates last login**
   - Set `lastLogin` to current timestamp

9. **Backend returns tokens and user data**
   - User object (without password hash)
   - Access token
   - Refresh token

10. **Frontend stores tokens**
    - Access token in memory or localStorage
    - Refresh token in httpOnly cookie (recommended) or localStorage

### Error Handling

- **Email not found**: Return 401 Unauthorized
- **Wrong password**: Return 401 Unauthorized
- **Email not verified**: Return 403 Forbidden
- **Account inactive**: Return 403 Forbidden

### Security Considerations

- Don't reveal whether email exists
- Use same error message for wrong email and wrong password
- Passwords compared using bcrypt (timing-safe)
- Refresh tokens stored in database for revocation

---

## Password Reset

### Overview

Users who forgot their password can request a reset link via email.

### Steps

1. **User clicks "Forgot Password"**
   - Enters email address

2. **Backend validates email format**

3. **Backend finds user by email**
   - If not found, still return success (don't reveal if email exists)

4. **Backend generates reset token**
   - Create UUID token
   - Set expiration (1 hour from now)
   - Store in `password_reset_tokens` table

5. **Backend sends reset email**
   - Email contains reset link
   - Link format: `{FRONTEND_URL}/reset-password?token={token}`

6. **User clicks reset link**
   - Opens link in browser
   - Frontend shows "Set New Password" form

7. **User submits new password**
   - Frontend calls `POST /v1/auth/reset-password`
   - Sends token and new password

8. **Backend verifies token**
   - Check token exists and not expired
   - Check token not already used

9. **Backend updates password**
   - Hash new password with bcrypt
   - Update user's `passwordHash`
   - Mark token as used

10. **Backend revokes all refresh tokens**
    - Set `revokedAt` for all user's refresh tokens
    - Forces re-login on all devices

11. **User must log in with new password**

### Error Handling

- **Invalid email format**: Return 400 Bad Request
- **Token expired**: Return 400 Bad Request
- **Token invalid**: Return 400 Bad Request
- **Token already used**: Return 400 Bad Request

### Security Considerations

- Don't reveal if email exists
- Reset token expires after 1 hour
- Reset token is single-use
- All sessions invalidated on password reset
- New password must meet strength requirements

---

## Create Research Project

### Overview

Authenticated users can create research projects to organize their literature review work.

### Steps

1. **User navigates to "New Project" page**

2. **User fills out project form**
   - Project name
   - Research idea/abstract

3. **Frontend validates input**
   - Project name not empty
   - Project name ≤ 255 characters

4. **Frontend sends request**
   - `POST /v1/user-projects`
   - Includes Authorization header with access token

5. **Backend validates JWT token**
   - Extract user ID from token
   - Check token not expired

6. **Backend validates input**
   - Project name length
   - User idea not empty

7. **Backend creates project**
   - Associate with user ID from token
   - Set timestamps

8. **Backend returns created project**
   - Project ID, name, idea, timestamps

9. **Frontend shows success message**
   - Redirect to project details page

### Error Handling

- **Missing token**: Return 401 Unauthorized
- **Expired token**: Return 401 Unauthorized
- **Invalid input**: Return 400 Bad Request

### Security Considerations

- User ID comes from JWT token (not request body)
- User can only create projects for themselves
- Projects are cascade-deleted when user is deleted

---

## Literature Review Pipeline

### Overview

Multi-stage LLM-driven pipeline for analyzing research abstracts and finding relevant papers.

### Stages

#### Stage 1: Intent Decomposition

**Input**: Research abstract  
**Output**: Structured intent components

**Steps**:
1. User submits abstract
2. Backend validates input (max 5000 characters)
3. Backend sends to OpenAI GPT-4o-mini
4. LLM extracts:
   - Problem statement
   - Proposed solution
   - Methodology
   - Expected contributions
5. Backend returns structured output

#### Stage 2: Query Generation

**Input**: Stage 1 output  
**Output**: Search queries

**Steps**:
1. User submits Stage 1 output
2. Backend validates input
3. Backend sends to OpenAI GPT-4o-mini
4. LLM generates:
   - Multiple search query variations
   - Keywords
   - Boolean query strings
5. Backend returns queries

#### Stage 3: Paper Retrieval (TODO)

**Input**: Search queries  
**Output**: List of papers

**Steps**:
1. Backend queries arXiv API
2. Backend queries Semantic Scholar API
3. Backend deduplicates results
4. Backend returns paper list

#### Stage 4: Filtering (TODO)

**Input**: Paper list  
**Output**: Filtered paper list

**Steps**:
1. Backend filters by:
   - Publication year
   - Venue quality
   - Citation count
2. Backend returns filtered list

#### Stage 5: Paper Scoring

**Input**: User abstract + candidate paper abstract  
**Output**: Relevance score and category

**Steps**:
1. User submits both abstracts
2. Backend validates input
3. Backend sends to OpenAI GPT-4o-mini
4. LLM analyzes:
   - Semantic similarity
   - Category (C1: competitor, C2: supporting)
   - Research gaps
5. Backend returns score and analysis

### Error Handling

- **Invalid input**: Return 400 Bad Request
- **OpenAI API error**: Return 500 Internal Server Error
- **Rate limit exceeded**: Return 429 Too Many Requests

### Security Considerations

- All stages require authentication
- OpenAI API key never exposed to frontend
- Costs tracked per user (future)

---

## Token Refresh

### Overview

When access token expires, use refresh token to get new tokens without re-login.

### Steps

1. **Frontend detects expired access token**
   - API returns 401 with "TOKEN_EXPIRED" code

2. **Frontend calls refresh endpoint**
   - `POST /v1/auth/refresh`
   - Sends refresh token

3. **Backend validates refresh token**
   - Check token exists in database
   - Check not expired
   - Check not revoked

4. **Backend generates new tokens**
   - New access token (15 min expiry)
   - New refresh token (7 day expiry)

5. **Backend revokes old refresh token**
   - Set `revokedAt` timestamp
   - Set `replacedByToken` to new token

6. **Backend stores new refresh token**
   - Save in `refresh_tokens` table

7. **Backend returns new tokens**

8. **Frontend updates stored tokens**
   - Replace old tokens with new ones

9. **Frontend retries original request**
   - Use new access token

### Error Handling

- **Missing refresh token**: Return 401 Unauthorized
- **Invalid refresh token**: Return 401 Unauthorized
- **Expired refresh token**: Return 401 Unauthorized (must re-login)
- **Revoked refresh token**: Return 401 Unauthorized (must re-login)

### Security Considerations

- Refresh token rotation (old token revoked when refreshed)
- Refresh tokens stored in database for tracking
- Refresh tokens can be revoked (e.g., on password change)
- Token reuse detection (future enhancement)

---

## Additional Resources

- **API Documentation**: [03_API.md](./03_API.md)
- **Database Schema**: [04_DATABASE.md](./04_DATABASE.md)
- **Architecture**: [02_ARCHITECTURE.md](./02_ARCHITECTURE.md)
- **Testing**: [08_TESTING.md](./08_TESTING.md)

---

**For implementation details, see the source code in `literature-review-backend/src/`**
