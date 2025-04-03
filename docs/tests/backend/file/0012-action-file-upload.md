# < 0012 - Action File Upload >

## Test Case Information

**Description:** Verifies the file upload functionality for Actions through FileController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/file/infrastructure/controllers/tests/fileController.actionUpload.test.ts`

## Prerequisites

- System configured with file services
- Properly configured dependency mocks
- Fastify server with multipart support
- Authentication mocking configured
- Temporary filesystem access for test file creation

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify with @fastify/multipart
- **Mocked Services:** uploadActionFileService, logService
- **File System:** Node fs module for test file operations

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful file upload for action | 1. Create test file<br>2. Send POST request with file and category<br>3. Verify API response<br>4. Clean up test file | - Status 200<br>- Action file entity data in response<br>- Service called with correct parameters | Passed |
| 0002 | Error handling during action file upload | 1. Create test file<br>2. Force error in uploadActionFileService<br>3. Send POST request with file<br>4. Verify API response<br>5. Clean up test file | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**Test File:**
```
This is a test file
```

**Action File Entity Response:**
```json
{
  "id": "1",
  "filename": "testFile.txt",
  "category": "test-category",
  "mimetype": "text/plain",
  "size": 18,
  "actionId": 1
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
    const fileEntity = await fileController.uploadActionFile(req, res);
    return res.send(fileEntity);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).send({ error: error.message });
    }
    return res.status(500).send({ error: "Erro ao fazer upload do arquivo" });
  }
});
```

## Notes

- Tests use a 10000ms timeout for adequate processing time
- Error logs are intercepted during testing
- File is created at runtime and deleted after test completion
- Authentication is mocked by adding user data to the request object
- Both success and error scenarios are thoroughly tested
- The test verifies specific attributes of action file uploads, including actionId
- Special handling may be needed for different action file categories