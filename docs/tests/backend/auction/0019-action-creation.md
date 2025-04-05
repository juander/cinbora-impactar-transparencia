# < 0019 - Action Creation >

## Test Case Information

**Description:** Verifies the action creation functionality through ActionController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/action/infrastructure/controllers/tests/actionController.create.test.ts`

## Prerequisites

- System configured with action services
- Properly configured dependency mocks
- Fastify server with multipart support
- Authentication mocking configured
- File system access for test file creation

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify with @fastify/multipart
- **Mocked Services:** 
  - createActionService
  - createFileAwsService
  - logService
- **File System:** Node fs module for test file operations

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful action creation with file upload | 1. Create temporary test file<br>2. Send multipart POST request with action data and file<br>3. Verify API response<br>4. Clean up test file | - Response with created action data<br>- Service called with correct parameters<br>- File uploaded to AWS | Passed |
| 0002 | Error handling during action creation | 1. Create temporary test file<br>2. Force error in createActionService<br>3. Send multipart POST request<br>4. Verify error response<br>5. Clean up test file | - Status 500<br>- Error message in response | Passed |

## Test Data

**Action Data:**
```json
{
  "name": "New Action",
  "ngoId": 1,
  "type": "Type One",
  "spent": 100,
  "goal": 1000,
  "colected": 500,
  "categorysExpenses": { "Category One": 100 }
}
```

**Test File:** Text file with "file content"

## Test Configuration

```typescript
// Extensive mocking setup
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {},
  createActionService: {
    execute: jest.fn()
  },
  updateActionService: {},
  deleteActionService: {},
  updateActionExpensesGraficService: {},
  createFileAwsService: {
    uploadFile: jest.fn().mockResolvedValue('https://aws.s3/testfile.txt')
  }
}));

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    logAction: jest.fn()
  }
}));

// File module mocking
jest.mock('@modules/file', () => ({
  // ... complex mock setup for file operations
  CreateFileAwsService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('https://aws.s3/testfile.txt'),
    deleteFile: jest.fn().mockResolvedValue(undefined)
  }))
}));

// Server setup with multipart and authentication
const server = Fastify();
server.register(fastifyMultipart);

server.addHook('preHandler', async (request) => {
  // Mock authenticated user
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

// Endpoint registration
server.post('/ongs/actions', actionController.create.bind(actionController));
```

## Notes

- Tests use an extended timeout (15000ms) due to file operations
- Error logs are intercepted during testing
- Temporary files are created with unique IDs to avoid conflicts
- Files are always cleaned up after tests, even if they fail
- Testing includes proper validation of file uploads to AWS
- Complex data including nested objects (categorysExpenses) is tested
- Authentication is mocked to simulate a logged-in user with NGO association