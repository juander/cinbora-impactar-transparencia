# < 0018 - Login API Controller >

## Test Case Information

**Description:** Verifies the login API functionality through LoginAPIController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/authAPI/infrastructure/controllers/tests/loginAPIController.handle.test.ts`

## Prerequisites

- System configured with authentication services
- Properly configured dependency mocks
- Fastify server for testing
- Mock user, NGO, and action data

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Fastify inject
- **Server:** Fastify
- **Mocked Components:** AuthController.authenticate
- **Test Approach:** HTTP request simulation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful login with valid credentials | 1. Set up mock AuthController<br>2. Send POST request with valid credentials<br>3. Verify response structure | - Status 200<br>- User data in response<br>- NGO data in response<br>- JWT token<br>- Associated actions | Passed |
| 0002 | Error handling for invalid credentials | 1. Configure mock to throw CustomError<br>2. Send POST request with invalid credentials<br>3. Verify error response | - Status 401<br>- Error message "Credenciais inválidas" | Passed |
| 0003 | Error handling for system errors | 1. Configure mock to throw generic Error<br>2. Send POST request<br>3. Verify error response | - Status 500<br>- Error message "Database connection error" | Passed |

## Test Data

**Login Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Successful Response:**
```json
{
  "message": "Login bem-sucedido",
  "user": {
    "id": "1",
    "name": "Test User",
    "email": "test@example.com",
    "ngoId": 1,
    "profileUrl": "exampleurl.com"
  },
  "ngo": {
    "id": 1,
    "name": "Test NGO",
    "description": "Test description"
  },
  "token": "jwt-token",
  "actions": [
    {
      "id": "1",
      "name": "Action 1",
      "ngoId": 1
    }
  ]
}
```

## Test Configuration

```typescript
// Define the type for authenticate function
type AuthenticateFunction = (email: string, password: string) => Promise<{
  user: any;
  ngo: any;
  token: string;
  actions: any[];
}>;

// Mock the AuthController with correct typing
const mockAuthenticate = jest.fn() as jest.MockedFunction<AuthenticateFunction>;
const mockAuthController = {
  authenticate: mockAuthenticate
} as unknown as AuthController;

// Setup test server
const server = Fastify();
const loginAPIController = new LoginAPIController(mockAuthController);

// Add test route
server.post('/login', loginAPIController.handle.bind(loginAPIController));
```

## Notes

- Tests mock the AuthController.authenticate method to isolate the LoginAPIController
- Error logs are intercepted during testing to keep test output clean
- Both authentication success and error scenarios are thoroughly tested
- The test verifies the controller correctly forwards credentials to the AuthController
- Error handling includes both custom application errors and unexpected system errors
- Response body structure is verified in detail for each scenario