# < 0021 - Action List Retrieval >

## Test Case Information

**Description:** Verifies the functionality to retrieve all actions for a specific NGO through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.getAll.test.ts`

## Prerequisites

- System configured with action services
- Properly configured dependency mocks
- Fastify server for testing
- Mock action data available for retrieval

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** getActionService (executeByNgoId method)
- **Test Approach:** HTTP request simulation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of all actions for an NGO | 1. Mock service to return actions<br>2. Send GET request to /ongs/1/actions<br>3. Verify API response | - Status 200<br>- List of actions in response body<br>- Service called with correct NGO ID | Passed |
| 0002 | Error handling during actions retrieval | 1. Force CustomError in getActionService.executeByNgoId<br>2. Send GET request<br>3. Verify error response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**Actions Data:**
```json
[
  { 
    "id": "1", 
    "name": "Action One", 
    "ngoId": "1", 
    "type": "Type One", 
    "spent": 100, 
    "goal": 1000, 
    "colected": 500 
  },
  { 
    "id": "2", 
    "name": "Action Two", 
    "ngoId": "1", 
    "type": "Type Two", 
    "spent": 200, 
    "goal": 2000, 
    "colected": 1500 
  }
]
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeByNgoId: jest.fn(),
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
server.get('/ongs/:id/actions', actionController.getAll.bind(actionController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The endpoint returns all actions associated with a specific NGO ID
- The test verifies both successful retrieval and proper error handling
- Service call parameters are verified to ensure correct NGO ID is used
- The controller directly passes the NGO ID from the route parameters