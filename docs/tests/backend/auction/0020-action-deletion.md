# < 0020 - Action Deletion >

## Test Case Information

**Description:** Verifies the action deletion functionality through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.delete.test.ts`

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
  - deleteActionService
  - getActionService
  - logService
- **Test Approach:** HTTP request simulation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful action deletion | 1. Mock services to return success<br>2. Send DELETE request with valid action ID<br>3. Verify API response<br>4. Verify service calls | - Status 200<br>- Success message "Ação deletada com sucesso"<br>- Service called with correct action ID | Passed |
| 0002 | Error handling during action deletion | 1. Mock deleteActionService to throw CustomError<br>2. Send DELETE request<br>3. Verify error response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**Action Data:**
```json
{
  "id": "1",
  "name": "Action to Delete",
  "ngoId": 1,
  "type": "Type One",
  "spent": 100,
  "goal": 1000,
  "colected": 500,
  "aws_url": "https://aws.s3/testfile.txt",
  "categorysExpenses": { "Category One": 100 }
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeById: jest.fn()
  },
  createActionService: {},
  updateActionService: {},
  deleteActionService: {
    execute: jest.fn()
  },
  updateActionExpensesGraficService: {},
  createFileAwsService: {},
}));

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    logAction: jest.fn()
  }
}));

// File module mocking
jest.mock('@modules/file', () => ({
  FileRepository: jest.fn().mockImplementation(() => ({})),
  // ... other file service mocks
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
server.delete('/ongs/actions/:id', actionController.delete.bind(actionController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- Authentication is mocked by adding user data to the request object
- The test verifies both successful deletion and proper error handling
- Action log recording is verified with expect(logService.logAction).toHaveBeenCalled()
- The service call is checked to ensure it receives the correct action ID