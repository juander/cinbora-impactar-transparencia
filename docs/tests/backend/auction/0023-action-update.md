# < 0023 - Action Update >

## Test Case Information

**Description:** Verifies the action update functionality through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.update.test.ts`

## Prerequisites

- System configured with action services
- Properly configured dependency mocks
- Fastify server for testing
- Authentication mocking configured

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** 
  - updateActionService
  - getActionService
  - logService
- **Test Approach:** HTTP request simulation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful action update | 1. Mock services to return existing and updated action<br>2. Send PUT request with updated data<br>3. Verify API response<br>4. Verify service calls | - Status 200<br>- Updated action data in response<br>- Service called with correct action ID and data<br>- Log service called | Passed |
| 0002 | Error handling during action update | 1. Mock services to throw CustomError<br>2. Send PUT request with updated data<br>3. Verify error response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**Original Action:**
```json
{
  "id": "1",
  "ngoId": 1,
  "name": "Original Action",
  "type": "Original Type",
  "spent": 100,
  "goal": 1000,
  "colected": 500
}
```

**Update Data:**
```json
{
  "name": "Updated Action",
  "type": "Updated Type",
  "spent": 200,
  "goal": 2000,
  "colected": 1000
}
```

**Updated Action Response:**
```json
{
  "id": "1",
  "ngoId": 1,
  "name": "Updated Action",
  "type": "Updated Type",
  "spent": 200,
  "goal": 2000,
  "colected": 1000,
  "aws_url": "https://aws.s3/testfile.txt",
  "categorysExpenses": { "Category One": 100 }
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeById: jest.fn(),
    execute: jest.fn()
  },
  createActionService: {},
  updateActionService: {
    execute: jest.fn(),
  },
  deleteActionService: {},
  updateActionExpensesGraficService: {},
  createFileAwsService: {},
}));

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    logAction: jest.fn(),
  },
}));

// File module mocking
jest.mock('@modules/file', () => ({
  // ... file service mocks
}));

// Controller and server setup
const server = Fastify();
const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
);

// Authentication mocking
server.addHook('preHandler', async (request) => {
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

// Endpoint registration
server.put('/ongs/actions/:id', actionController.update.bind(actionController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- Authentication is mocked by adding user data to the request object
- Both successful update and error scenarios are thoroughly tested
- The update verifies partial updates (only some fields changed)
- Service call parameters are verified to ensure correct action ID and data
- Activity logging is verified to ensure proper audit trail