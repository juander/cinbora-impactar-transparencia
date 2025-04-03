# < 0005 - NGO Deletion >

## Test Case Information

**Description:** Verifies the NGO deletion functionality through OngController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/ong/infrastructure/controllers/tests/OngController.delete.test.ts`

## Prerequisites

- System configured with NGO services
- Properly configured dependency mocks
- Fastify server for testing
- Authentication mocking configured
- Existing NGO in the system for deletion tests

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** deleteOngService, logService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful NGO deletion | 1. Send DELETE request with valid NGO ID<br>2. Verify API response | - Status 200<br>- Success message "ONG deletada com sucesso" | Passed |
| 0002 | Error handling during NGO deletion | 1. Force CustomError in deleteOngService<br>2. Send DELETE request<br>3. Verify API response | - Status 500<br>- Error message "Internal Server Error" | Passed |

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
jest.mock('@config/dependencysInjection/ongDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

// Test server configuration
const server = Fastify();
const ongController = new OngController(
  createOngService,
  deleteOngService,
  getOngService,
  updateOngService,
  updateNgoGraficService
);

// Custom route with authentication mocking
server.delete('/ongs/:id', async (req, reply) => {
  // Mock authenticated user
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com'};
  
  try {
    await ongController.delete(req);
    return reply.status(200).send({ message: 'ONG deletada com sucesso' });
  } catch (error) {
    if (error instanceof CustomError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- Authentication is mocked by adding user data to the request object
- The endpoint returns 200 status for successful deletion
- Custom error handling with appropriate status codes based on error type
- The delete operation is verified using mock assertions