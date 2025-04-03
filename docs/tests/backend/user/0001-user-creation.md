# < 0001 - User Creation >

## Test Case Information

**Description:** Verifies the user creation functionality through UserController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/tests/controllers/userController.create.test.ts`

## Prerequisites

- System configured with user services
- Properly configured dependency mocks
- Fastify server for testing

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** createUserService, logService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful user creation | 1. Send POST request with valid user data<br>2. Verify API response | - Status 200<br>- Success message<br>- User data in response | Passed |
| 0002 | Error handling during user creation | 1. Force an error in createUserService<br>2. Send POST request<br>3. Verify API response | - Status 500<br>- Appropriate error message | Passed |

## Test Data

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "ngoId": 1,
  "profileUrl": "exampleurl.com"
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/userDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

// Test server configuration
const server = Fastify();
const userController = new UserController(
  createUserService, 
  deleteUserService, 
  getUserService,
  updateUserProfileService
);
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- Log service is mocked to prevent real logs during tests