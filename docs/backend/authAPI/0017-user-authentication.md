# < 0017 - User Authentication >

## Test Case Information

**Description:** Verifies the user authentication functionality through AuthController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/authAPI/infrastructure/controllers/tests/authController.authenticate.test.ts`

## Prerequisites

- System configured with authentication services
- Properly configured dependency mocks
- JWT service for token generation
- Bcrypt library for password verification

## Test Environment

- **Testing Framework:** Jest
- **Test Type:** Unit test with advanced mocking
- **Mocked Services:** 
  - GetExternalDataService
  - CreateUserService
  - GetUserService
  - CreateOngService
  - GetOngService
  - GetActionService
  - JwtService
  - FastifyInstance
- **Test Approach:** Direct controller method invocation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful authentication with valid credentials | 1. Set up mock services<br>2. Call authenticate method with valid credentials<br>3. Verify returned data structure | - Authentication response with user data<br>- NGO details<br>- JWT token<br>- Associated actions | Passed |
| 0002 | Error handling for invalid credentials | 1. Configure bcrypt to return false<br>2. Call authenticate with invalid credentials<br>3. Verify error response | - Authentication failure<br>- Error message "Invalid credentials" | Pending |
| 0003 | Error handling for missing user | 1. Configure GetUserService to return null<br>2. Call authenticate method<br>3. Verify error response | - Authentication failure<br>- Error message "User not found" | Pending |

## Test Data

**User Data:**
```json
{
  "id": "1",
  "email": "test@example.com",
  "password": "hashed_password",
  "ngoId": 1,
  "name": "Test User",
  "profileUrl": "exampleurl.com"
}
```

**NGO Data:**
```json
{
  "id": 1,
  "name": "Test NGO",
  "description": "Test description"
}
```

**Actions Data:**
```json
[
  {
    "id": "1",
    "name": "Action 1",
    "ngoId": 1
  }
]
```

## Test Configuration

```typescript
// Advanced mock setup using Proxy pattern for service interception
const createServiceProxy = (name: string, mockData: any): ServiceProxy => {
  return new Proxy<ServiceProxy>({} as ServiceProxy, {
    get: (target: ServiceProxy, prop: string | symbol) => {
      console.log(`[${name}] Acesso à propriedade: ${String(prop)}`);
      
      // Return a mock function for any method call
      if (typeof prop === 'string') {
        const mockFn = jest.fn().mockResolvedValue(mockData);
        target[prop] = mockFn;
        return mockFn;
      }
      
      return {} as ServiceProxy;
    }
  });
};

// Special mock for JWT service
const mockJwtService = {
  generate: jest.fn().mockReturnValue('jwt-token'),
  verify: jest.fn()
};

// Mock bcrypt password comparison
(bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));

// Create controller with mocked dependencies
authController = new AuthController(
  mockGetExternalDataService as any,
  mockCreateUserService as any,
  mockGetUserService as any,
  mockCreateOngService as any,
  mockGetOngService as any,
  mockGetActionService as any,
  mockJwtService as any,
  mockFastifyInstance as any
);
```

## Notes

- Uses an advanced Proxy-based mocking strategy to intercept any service method calls
- Error logs are suppressed during testing
- Direct method mocking is used as a fallback approach when standard mocking doesn't work
- Authentication returns a complete package of user data, NGO data, token, and actions
- The test verifies the complete authentication flow including token generation