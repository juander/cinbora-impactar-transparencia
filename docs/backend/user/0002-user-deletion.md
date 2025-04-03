# < 0002 - User Deletion >

## Test Case Information

**Description:** Verifies the user deletion functionality through UserController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Low  
**Test File Path:** `backend/src/modules/user/infrastructure/controllers/tests/userController.delete.test.ts`

## Prerequisites

- System configured with user services
- Properly configured dependency mocks
- Fastify server for testing
- Existing user in the system for deletion tests

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** getUserService, deleteUserService, logService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful user deletion | 1. Send DELETE request with valid user ID<br>2. Verify API response | - Status 200<br>- Success message "Usuário deletado com sucesso" | Passed |
| 0002 | Error handling during user deletion | 1. Force an error in deleteUserService<br>2. Send DELETE request<br>3. Verify API response | - Status 500<br>- Error message "Erro ao deletar usuário" | Passed |

## Test Data

```json
{
  "id": "1",
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

// Mock authenticated user in request
server.delete('/users/:id', async (req, res) => {
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  await userController.delete(req, res);
});
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- Authentication is mocked by adding user data to the request object
- Both tests verify the correct status code and response message
- This functionality (delete user) is not actually implemented in production