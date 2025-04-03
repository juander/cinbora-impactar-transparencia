# < 0004 - NGO Creation >

## Test Case Information

**Description:** Verifies the NGO creation functionality through OngController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** High  
**Test File Path:** `backend/src/modules/ong/infrastructure/controllers/tests/OngController.create.test.ts`

## Prerequisites

- System configured with NGO services
- Properly configured dependency mocks
- Fastify server for testing
- Authentication mocking configured

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** createOngService, logService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful NGO creation | 1. Send POST request with valid NGO data<br>2. Verify API response | - Status 201<br>- Created NGO data in response body | Passed |
| 0002 | Error handling during NGO creation | 1. Force CustomError in createOngService<br>2. Send POST request<br>3. Verify API response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

```json
{
  "id": 1,
  "name": "New ONG",
  "description": "New Description",
  "is_formalized": true,
  "start_year": 2021,
  "contact_phone": "123456789",
  "instagram_link": "https://instagram.com/newong",
  "x_link": "https://x.com/newong",
  "facebook_link": "https://facebook.com/newong",
  "pix_qr_code_link": "https://pix.com/newong",
  "site": "https://newong.com",
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
server.post('/ongs', async (req, reply) => {
  // Mock authenticated user
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  
  try {
    const result = await ongController.create(req);
    return reply.status(201).send(result);
  } catch (error) {
    // Error handling with proper status codes
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
- The endpoint returns 201 (Created) status for successful creation
- Custom error handling implemented to return appropriate status codes