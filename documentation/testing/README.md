# Testing Documentation

This folder contains all testing resources for the Literature Review System API.

---

## 📁 Files

### Authentication API Testing

#### 1. `TESTING_APIS.md`
Complete authentication API testing guide with:
- All 10 authentication endpoints
- Request/response examples
- cURL commands
- Error scenarios
- Testing checklist
- Troubleshooting guide

#### 2. `Auth_API.postman_collection.json`
Postman collection for authentication testing:
- Import into Postman
- All endpoints pre-configured
- Auto-saves tokens
- Environment variables setup

### Literature Review Pipeline Testing

#### 3. `TESTING_STAGE1.md`
Stage 1 (Abstract Extraction) testing guide

#### 4. `TESTING_STAGE2.md`
Stage 2 (Research Questions) testing guide

#### 5. `TESTING_STAGE5.md`
Stage 5 (Paper Scoring) testing guide

#### 6. `TESTING_PAPER_SCORING.md`
Complete paper scoring pipeline testing guide

#### 7. `paper-scoring-tests.http`
HTTP file for testing paper scoring endpoints

#### 8. `stage5-api-tests.http`
HTTP file for testing stage 5 endpoints

### User Projects API Testing

#### 9. `TESTING_PROJECTS_API.md`
Complete User Projects API testing guide with:
- All 5 CRUD endpoints
- Request/response examples
- cURL commands
- Validation rules
- Error scenarios
- Testing checklist
- Complete test flow

#### 10. `Projects_API.postman_collection.json`
Postman collection for projects testing:
- Import into Postman
- All endpoints pre-configured
- Auto-saves tokens and project IDs
- Environment variables setup

---

## 🚀 Quick Start

### Option 1: Using Postman (Recommended)

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `Auth_API.postman_collection.json`

2. **Set Base URL**
   - Collection variables already set
   - Default: `http://localhost:5000/v1/auth`

3. **Start Testing**
   - Run "1. Register User"
   - Tokens auto-saved
   - Use for protected routes

### Option 2: Using cURL

See `TESTING_APIS.md` for all cURL commands.

**Example:**
```bash
# Register
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Login
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

### Option 3: Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Import `Auth_API.postman_collection.json`
3. Start testing

---

## 📋 Testing Checklist

Use this checklist to ensure all functionality works:

### ✅ Registration & Verification
- [ ] Register new user
- [ ] Receive verification email
- [ ] Verify email with token
- [ ] Receive welcome email
- [ ] Resend verification works

### ✅ Login & Authentication
- [ ] Login with correct credentials
- [ ] Wrong password rejected
- [ ] Non-existent user rejected
- [ ] Rate limiting works (3 attempts)

### ✅ Password Management
- [ ] Forgot password sends email
- [ ] Reset password with token
- [ ] Change password (logged in)
- [ ] Old sessions invalidated

### ✅ Token Management
- [ ] Access token works
- [ ] Access token expires (15 min)
- [ ] Refresh token works
- [ ] Token rotation on refresh
- [ ] Logout revokes token

### ✅ Protected Routes
- [ ] Profile requires auth
- [ ] Invalid token rejected
- [ ] Expired token rejected

### ✅ Security
- [ ] Passwords hashed
- [ ] Rate limiting active
- [ ] Email privacy maintained
- [ ] Tokens properly formatted

---

## 🧪 Test Scenarios

### Happy Path
1. Register → Verify Email → Login → Get Profile → Logout

### Error Scenarios
1. Register with weak password
2. Login with wrong password
3. Use expired token
4. Exceed rate limits
5. Access protected route without token

### Edge Cases
1. Register with existing email
2. Verify with used token
3. Reset password twice
4. Refresh with revoked token

---

## 📊 Expected Results

### All Tests Should:
- ✅ Return proper status codes
- ✅ Have consistent response format
- ✅ Include success/error flags
- ✅ Provide clear error messages
- ✅ Respect rate limits

### Response Format:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Optional message"
}
```

---

## 🔍 Debugging

### Server Logs
```bash
# Watch server logs while testing
npm run dev
```

### Database
```bash
# View database records
npx prisma studio
```

### Email
```bash
# Test email configuration
node setup-tests/test-email.js
```

---

## 📝 Test Results Template

Document your test results:

```markdown
## Test Run: [Date]

### Environment
- Server: Running ✅
- Database: Connected ✅
- Email: Configured ✅

### Results
- Registration: ✅ Pass
- Login: ✅ Pass
- Email Verification: ✅ Pass
- Password Reset: ✅ Pass
- Token Refresh: ✅ Pass
- Protected Routes: ✅ Pass
- Rate Limiting: ✅ Pass

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
- [Any observations]
```

---

## 🛠️ Tools

### Recommended
- **Postman** - API testing
- **Thunder Client** - VS Code extension
- **Prisma Studio** - Database viewer
- **cURL** - Command line testing

### Optional
- **Newman** - Postman CLI runner
- **Insomnia** - Alternative to Postman
- **HTTPie** - Better cURL

---

## 📚 Additional Resources

- `../AUTH_API_COMPLETE.md` - Complete API documentation
- `../documentation/AUTHENTICATION.md` - Auth system details
- `../documentation/DATABASE.md` - Database schema
- `../setup-tests/` - Environment test scripts

---

## 🎯 Next Steps

1. **Run all tests** from the checklist
2. **Document results** using the template
3. **Report issues** if any found
4. **Automate tests** (optional - Jest/Supertest)

---

**Happy Testing!** 🧪

For detailed testing instructions, see `TESTING_APIS.md`.
