# < 0003 - User List Retrieval >

## Test Case Information

**Description:** Verifies the functionality to retrieve all users through UserController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/user/infrastructure/controllers/tests/userController.getAll.test.ts`

## Prerequisites

- System configured with user services
- Properly configured dependency mocks
- Fastify server for testing
- Mock user data available for listing

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** getUserService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of all users | 1. Send GET request to /users endpoint<br>2. Verify API response | - Status 200<br>- List of users in response body | Passed |
| 0002 | Error handling during user retrieval | 1. Force an error in getUserService.executeAll<br>2. Send GET request<br>3. Verify API response | - Status 500<br>- Error message "Erro ao obter usuários" | Passed |

## Test Data

```json
[
  { "id": "1", "name": "User One", "email": "userone@example.com", "ngoId": 1, "profileUrl": "exampleurl.com" },
  { "id": "2", "name": "User Two", "email": "usertwo@example.com", "ngoId": 2, "profileUrl": "exampleurl.com" }
]
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/userDependencyInjection');

// Test server configuration
const server = Fastify();
const userController = new UserController(
  createUserService, 
  deleteUserService, 
  getUserService,
  updateUserProfileService
);

// Bind controller method to endpoint
server.get('/users', userController.getAll.bind(userController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The endpoint does not require authentication
- Test verifies both successful retrieval and error scenarios