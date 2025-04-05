# < 0025 - Action Image Update >

## Test Case Information

**Description:** Verifies the functionality to update an action's image through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.updateActionImage.test.ts`

## Prerequisites

- System configured with action services
- Properly configured dependency mocks
- Fastify server with multipart support
- Authentication mocking configured
- File system access for test file creation
- AWS S3 integration for file storage

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify with @fastify/multipart
- **Mocked Services:** 
  - updateActionService
  - getActionService
  - logService
  - CreateFileAwsService
- **Test Approach:** HTTP request simulation with file upload

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful action image update | 1. Create temporary test file<br>2. Mock services for existing and updated action<br>3. Send PUT request with file attachment<br>4. Verify API response<br>5. Clean up test file | - Status 200<br>- Success message "Imagem da ação atualizada com sucesso"<br>- Updated AWS URL in response<br>- Services called with correct parameters | Passed |
| 0002 | Error handling for missing file | 1. Send PUT request without file attachment<br>2. Verify error response | - Status 406<br>- Error message "Not Acceptable" | Passed |

## Test Data

**Action Data:**
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
  "categorysExpenses": { "Category One": 100 }
}
```

**Test File Content:** "updated file content"

**Updated Action Response:**
```json
{
  "message": "Imagem da ação atualizada com sucesso",
  "aws_url": "https://aws.s3/updated-testfile.txt"
}
```

## Test Configuration

```typescript
// Advanced mocking for AWS file service
jest.mock('@modules/file', () => {
  return {
    CreateFileAwsService: jest.fn().mockImplementation(() => {
      return {
        uploadFile: jest.fn().mockResolvedValue('https://aws.s3/updated-testfile.txt'),
        deleteFile: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Dependency mocks for action services
jest.mock('@config/dependencysInjection/actionDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

// Server setup with multipart support
const server = Fastify();
server.register(fastifyMultipart);

// Controller instantiation
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
server.put('/ongs/actions/:id/image', actionController.updateActionImage.bind(actionController));
```

## Notes

- Tests use a 10000ms timeout due to file operations
- Error logs are intercepted during testing
- Test files are created with real fs operations and properly cleaned up
- The test verifies the entire workflow:
  1. Fetching the existing action
  2. Uploading the new image to AWS
  3. Updating the action with the new image URL
  4. Logging the update action
- Error handling specifically checks the case of missing file upload
- The controller properly validates file presence before processing