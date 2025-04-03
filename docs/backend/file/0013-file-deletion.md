# < 0013 - File Deletion >

## Test Case Information

**Description:** Verifies the file deletion functionality through FileController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/file/infrastructure/controllers/tests/fileController.delete.test.ts`

## Prerequisites

- System configured with file services
- Properly configured dependency mocks
- Fastify server for testing
- Authentication mocking configured

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** deleteFileService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful file deletion | 1. Send DELETE request with valid file ID<br>2. Verify API response | - Status 200<br>- Success message "Arquivo deletado com sucesso"<br>- Service called with correct file ID | Passed |
| 0002 | Error handling during file deletion | 1. Force error in deleteFileService<br>2. Send DELETE request<br>3. Verify API response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

```json
{
  "id": "1"
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/fileDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

// Custom mock for deleteFileService
const mockDeleteFileService = {
  execute: jest.fn()
};

// Test server configuration
const server = Fastify();

// Custom route with authentication mocking
server.delete('/file/:id', async (req, reply) => {
  // Mock authenticated user
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  
  try {
    await mockDeleteFileService.execute((req.params as any).id);
    return reply.code(200).send({ message: 'Arquivo deletado com sucesso' });
  } catch {
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
});
```

## Notes

- Tests use a 10000ms timeout
- Mock services are cleared before each test
- Authentication is mocked by adding user data to the request object
- The test explicitly verifies that the service is called with the correct parameter
- Simple implementation focuses on core functionality without additional complexity