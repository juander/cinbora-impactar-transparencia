# < 0014 - Action Files Retrieval by Category >

## Test Case Information

**Description:** Verifies the functionality to retrieve action files by category through FileController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/file/infrastructure/controllers/tests/fileController.getActionFilesByCategory.test.ts`

## Prerequisites

- FileController class implemented with getActionFilesByCategory method
- Mock services configured for testing
- TypeScript types for FastifyRequest and FastifyReply

## Test Environment

- **Testing Framework:** Jest
- **Test Type:** Unit test with mocked dependencies
- **Mocked Services:** All file-related services
- **Test Approach:** Direct controller method invocation

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of files by category | 1. Configure mock service to return files<br>2. Call getActionFilesByCategory with "image" category<br>3. Verify service call and response | - Service called with correct action ID and category<br>- Files returned in response | Passed |
| 0002 | Error handling during file retrieval | 1. Configure mock service to throw error<br>2. Call getActionFilesByCategory<br>3. Verify error response | - Status 500<br>- Appropriate error message | Passed |
| 0003 | Testing different file categories | 1. Configure mock for "video" category<br>2. Test with "video" category<br>3. Reconfigure mock for "report" category<br>4. Test with "report" category | - Correct parameters passed to service<br>- Appropriate files returned for each category | Passed |
| 0004 | Handling empty results | 1. Configure mock to return empty array<br>2. Call getActionFilesByCategory<br>3. Verify empty response | - Service called with correct parameters<br>- Empty array returned in response | Passed |

## Test Data

**Image Files:**
```json
[
  { "id": "1", "name": "action-file1.jpg", "category": "image", "url": "http://example.com/action-file1.jpg" },
  { "id": "2", "name": "action-file2.jpg", "category": "image", "url": "http://example.com/action-file2.jpg" }
]
```

**Video Files:**
```json
[
  { "id": "3", "name": "action-video.mp4", "category": "video", "url": "http://example.com/action-video.mp4" }
]
```

**Report Files:**
```json
[
  { "id": "4", "name": "action-report.pdf", "category": "report", "url": "http://example.com/action-report.pdf" }
]
```

## Test Configuration

```typescript
// Mock services setup
const mockGetActionFilesByCategoryService = {
  execute: jest.fn()
};

// Mock request and reply
const mockRequest = {
  params: {
    actionId: "1"
  }
} as FastifyRequest<{
  Params: ActionParams
}>;

const mockReply = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
} as unknown as FastifyReply;

// Controller instantiation with mocked services
const fileController = new FileController(
  mockUploadOngFileService as any,
  mockUploadActionFileService as any,
  mockDeleteFileService as any,
  mockGetActionFilesByCategoryService as any,
  mockGetOngFilesByCategoryService as any,
  mockGetActionService as any
);
```

## Notes

- This is a unit test that directly tests the controller method rather than via HTTP requests
- Tests clear all mocks before each test case for isolation
- Verifies both happy path and error cases
- Tests multiple categories to ensure flexibility
- Error handling is properly tested with appropriate error messages
- Empty results case is explicitly tested