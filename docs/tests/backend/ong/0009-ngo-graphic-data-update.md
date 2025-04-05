# < 0009 - NGO Graphic Data Update >

## Test Case Information

**Description:** Verifies the NGO graphic data update functionality through OngController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/ong/infrastructure/controllers/tests/OngController.updateNgoGrafic.test.ts`

## Prerequisites

- System configured with NGO services
- Properly configured dependency mocks
- Fastify server for testing
- Authentication mocking configured
- Existing NGO in the system for graphic data update tests

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** updateNgoGraficService, logService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful NGO graphic data update | 1. Send PUT request to /ongs/grafic with updated data<br>2. Verify API response | - Status 200<br>- Updated NGO data in response body | Passed |
| 0002 | Error handling during NGO graphic data update | 1. Force CustomError in updateNgoGraficService<br>2. Send PUT request<br>3. Verify API response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

```json
{
  "id": 1,
  "name": "Updated ONG",
  "description": "Updated Description",
  "is_formalized": true,
  "start_year": 2000,
  "contact_phone": "123456789",
  "instagram_link": "https://instagram.com/updatedong",
  "x_link": "https://x.com/updatedong",
  "facebook_link": "https://facebook.com/updatedong",
  "pix_qr_code_link": "https://pix.com/updatedong",
  "site": "https://updatedong.com",
  "gallery_images_url": [],
  "skills": {},
  "causes": {},
  "sustainable_development_goals": {}
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
server.put('/ongs/grafic', async (req, reply) => {
  // Mock authenticated user
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com'};
  
  try {
    const result = await ongController.updateNgoGrafic(req);
    return reply.send(result);
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
- The service explicitly tests for both successful updates and proper error handling
- Testing includes verification of both status code and response body
- The mock service is configured to return the updated data or throw a CustomError