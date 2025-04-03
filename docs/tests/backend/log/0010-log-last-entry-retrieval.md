# < 0010 - Log Last Entry Retrieval >

## Test Case Information

**Description:** Verifies the functionality to retrieve the most recent log entry for an NGO through LogController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/log/infrastructure/controllers/tests/logController.getLastLogByNgoId.test.ts`

## Prerequisites

- System configured with log services
- Properly configured dependency mocks
- Fastify server for testing
- Mock log data available for retrieval

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** logService (getLastLogByNgoId method)

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of last log | 1. Send GET request to /logs/ongs/1/last endpoint<br>2. Verify API response | - Status 200<br>- Last log data in response body<br>- Service called with correct ngoId | Passed |
| 0002 | Error handling during log retrieval | 1. Force error in logService.getLastLogByNgoId<br>2. Send GET request<br>3. Verify API response | - Status 500<br>- Error message "Erro ao buscar o último log" | Passed |

## Test Data

```json
{
  "id": "1",
  "ngoId": 1,
  "action": "update",
  "description": "Update ONG details",
  "timestamp": "2025-04-03T10:00:00Z",
  "userId": "1"
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    getLastLogByNgoId: jest.fn()
  }
}));

// Test server configuration
const server = Fastify();
const logController = new LogController(logService);

// Bind controller method to endpoint
server.get('/logs/ongs/:ngoId/last', logController.getLastLogByNgoId.bind(logController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The test verifies both successful retrieval and error scenarios
- Service call parameters are verified using expect(logService.getLastLogByNgoId).toHaveBeenCalledWith(1)
- Error response returns appropriate status code and error message