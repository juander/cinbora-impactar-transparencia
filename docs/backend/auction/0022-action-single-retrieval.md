# < 0022 - Action Single Retrieval >

## Test Case Information

**Description:** Verifies the functionality to retrieve a single action by ID through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.getOne.test.ts`

## Prerequisites

- System configured with action services
- Properly configured dependency mocks
- Fastify server for testing
- Mock action data available for retrieval

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** getActionService (executeById method)
- **Test Approach:** HTTP request simulation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of a single action | 1. Mock service to return action data<br>2. Send GET request to /ongs/actions/1<br>3. Verify API response | - Status 200<br>- Action data in response body<br>- Service called with correct action ID | Passed |
| 0002 | Error handling during action retrieval | 1. Force CustomError in getActionService.executeById<br>2. Send GET request<br>3. Verify error response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**Action Data:**
```json
{
  "id": "1",
  "name": "Action One",
  "ngoId": "1",
  "type": "Type One",
  "spent": 100,
  "goal": 1000,
  "colected": 500
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeById: jest.fn(),
  },
  createActionService: {},
  updateActionService: {},
  deleteActionService: {},
  updateActionExpensesGraficService: {},
  createFileAwsService: {},
}));

jest.mock('@modules/file', () => ({
  FileRepository: jest.fn().mockImplementation(() => ({})),
  UploadOngFileService: jest.fn().mockImplementation(() => ({})),
  UploadActionFileService: jest.fn().mockImplementation(() => ({})),
  DeleteFileService: jest.fn().mockImplementation(() => ({})),
  GetActionFilesByCategoryService: jest.fn().mockImplementation(() => ({})),
  GetOngFilesByCategoryService: jest.fn().mockImplementation(() => ({})),
  FileController: jest.fn().mockImplementation(() => ({})),
}));

// Server and controller setup
const server = Fastify();
const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
);

// Endpoint registration
server.get('/ongs/actions/:actionId', actionController.getOne.bind(actionController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The endpoint returns a single action based on the actionId parameter
- The test verifies both successful retrieval and proper error handling
- Service call parameters are verified to ensure correct action ID is used
- Custom error handling is tested with appropriate status code (500)
- The response body is verified to match the expected structure