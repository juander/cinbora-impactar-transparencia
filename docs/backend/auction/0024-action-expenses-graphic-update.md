# < 0024 - Action Expenses Graphic Update >

## Test Case Information

**Description:** Verifies the functionality to update action expenses graphic data through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.updateActionExpensesGrafic.test.ts`

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
  - updateActionExpensesGraficService
  - getActionService
  - logService
- **Test Approach:** HTTP request simulation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful update of action expenses graphic | 1. Mock services to return updated action<br>2. Send PUT request with expenses data<br>3. Verify API response<br>4. Verify service calls | - Status 200<br>- Updated action with expenses data<br>- Service called with correct parameters<br>- Activity logged | Passed |
| 0002 | Error handling during expenses graphic update | 1. Mock service to throw CustomError<br>2. Send PUT request with expenses data<br>3. Verify error response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**Expenses Data:**
```json
{
  "categorysExpenses": {
    "Category One": 100,
    "Category Two": 200
  }
}
```

**Updated Action Response:**
```json
{
  "id": "1",
  "name": "Test Action",
  "ngoId": 1,
  "type": "Type One",
  "spent": 300,
  "goal": 1000,
  "colected": 500,
  "aws_url": "https://aws.s3/testfile.txt",
  "categorysExpenses": {
    "Category One": 100,
    "Category Two": 200
  }
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
  deleteActionService: {},
  updateActionExpensesGraficService: {
    execute: jest.fn()
  },
  createFileAwsService: {},
}));

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    logAction: jest.fn()
  }
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

// Authentication mocking
server.addHook('preHandler', async (request) => {
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

// Endpoint registration
server.put('/ongs/actions/:id/expenses-grafic', actionController.updateActionExpensesGrafic.bind(actionController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- Authentication is mocked by adding user data to the request object
- This endpoint is specifically for updating the expenses graphic data, separate from regular action updates
- The categorysExpenses object can contain multiple expense categories with associated amounts
- The total spent value in the action is updated to reflect the sum of all category expenses
- Activity logging is verified to ensure proper audit trail