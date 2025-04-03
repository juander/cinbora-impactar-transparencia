# < 0016 - NGO File Upload Integration >

## Test Case Information

**Description:** Verifies the NGO file upload functionality through FileController with real HTTP requests  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/file/infrastructure/controllers/tests/fileController.ongUpload.test.ts`

## Prerequisites

- System configured with file services
- Properly configured dependency mocks
- Fastify server with multipart support
- Authentication mocking configured
- File system access for test file creation

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify with @fastify/multipart
- **Mocked Services:** uploadOngFileService, logService
- **Test Types:** Both integration and unit tests

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful file upload (integration) | 1. Create test file on disk<br>2. Send POST request with file and category<br>3. Verify API response<br>4. Clean up test file | - Status 200<br>- File entity data in response<br>- Service called with correct parameters | Passed |
| 0002 | Error handling (unit test) | 1. Mock request with failed file processing<br>2. Mock service to throw CustomError<br>3. Call controller method directly<br>4. Verify error response | - Status 500<br>- Error message in response<br>- Exception thrown as expected | Passed |

## Test Data

**Test File:**
```
This is a test file
```

**File Entity Response:**
```json
{
  "id": "1",
  "filename": "testFile.txt",
  "category": "test-category",
  "mimetype": "text/plain",
  "size": 18,
  "ngoId": 1
}
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/fileDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

// Test server configuration
const server = Fastify();
const fileController = new FileController(
  uploadOngFileService, 
  uploadActionFileService, 
  deleteFileService, 
  getActionFilesByCategoryService, 
  getOngFilesByCategoryService,
  getActionService
);

// Register multipart plugin for file uploads
server.register(fastifyMultipart);

// Custom route with authentication mocking
server.post('/upload', async (req, res) => {
  // Mock authenticated user
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  
  try {
    const result = await fileController.uploadOngFile(req, res);
    return res.send(result);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).send({ error: error.message });
    }
    return res.status(500).send({ error: 'Erro interno ao fazer upload' });
  }
});
```

## Notes

- Tests include both integration testing (using actual HTTP requests) and unit testing (direct controller method calls)
- The integration test creates a real file on disk and attaches it to the request
- Error logs are intercepted during testing to keep test output clean
- The unit test for error handling uses a more direct approach with mocked request/reply objects
- Multiple error handling verification strategies are employed for robustness
- Tests verify both successful file uploads and proper error handling