# < 0011 - NGO Logs Retrieval >

## Test Case Information

**Description:** Verifies the functionality to retrieve all logs for an NGO through LogController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/log/infrastructure/controllers/tests/logController.getOngLogs.test.ts`

## Prerequisites

- System configured with log services
- Properly configured dependency mocks
- Fastify server for testing
- Authentication mocking configured
- Mock log data available for retrieval

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** logService (getLogsByNgoId method)

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of NGO logs | 1. Set up authentication with NGO ID<br>2. Send GET request to /logs/ongs endpoint<br>3. Verify API response | - Status 200<br>- List of logs in response body<br>- Service called with correct ngoId | Passed |
| 0002 | Error handling during logs retrieval | 1. Force error in logService.getLogsByNgoId<br>2. Send GET request<br>3. Verify API response | - Status 500<br>- Error message "Erro ao obter logs da ONG" | Passed |

## Test Data

```json
[
  {
    "id": "1",
    "ngoId": 1,
    "action": "update",
    "description": "Update ONG details",
    "timestamp": "2025-04-03T10:00:00Z",
    "userId": "1"
  },
  {
    "id": "2",
    "ngoId": 1,
    "action": "create",
    "description": "Create new action",
    "timestamp": "2025-04-03T11:00:00Z",
    "userId": "1"
  }
]
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    getLogsByNgoId: jest.fn()
  }
}));

// Test server configuration
const server = Fastify();
const logController = new LogController(logService);

// Authentication mock middleware
server.addHook('preHandler', async (request) => {
  // Mock authenticated user with NGO ID
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

// Bind controller method to endpoint
server.get('/logs/ongs', logController.getOngLogs.bind(logController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The endpoint requires authentication to extract the NGO ID
- Service call parameters are verified to ensure correct NGO ID is used
- The test verifies both successful retrieval and error scenarios
- Response body is checked to match the mock data structure