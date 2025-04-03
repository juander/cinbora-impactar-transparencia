# < 0006 - NGO List Retrieval >

## Test Case Information

**Description:** Verifies the functionality to retrieve all NGOs through OngController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/ong/infrastructure/controllers/tests/OngController.getAll.test.ts`

## Prerequisites

- System configured with NGO services
- Properly configured dependency mocks
- Fastify server for testing
- Mock NGO data available for listing

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** getOngService

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of all NGOs | 1. Send GET request to /ongs endpoint<br>2. Verify API response | - Status 200<br>- List of NGOs in response body | Passed |
| 0002 | Error handling during NGO retrieval | 1. Force CustomError in getOngService.execute<br>2. Send GET request<br>3. Verify API response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

```json
[
  {
    "id": 1,
    "name": "ONG One",
    "description": "Description One",
    "is_formalized": true,
    "start_year": 2000,
    "contact_phone": "123456789",
    "instagram_link": "https://instagram.com/ongone",
    "x_link": "https://x.com/ongone",
    "facebook_link": "https://facebook.com/ongone",
    "pix_qr_code_link": "https://pix.com/ongone",
    "site": "https://ongone.com",
    "gallery_images_url": [],
    "skills": {},
    "causes": {},
    "sustainable_development_goals": {}
  },
  {
    "id": 2,
    "name": "ONG Two",
    "description": "Description Two",
    "is_formalized": false,
    "start_year": 2010,
    "contact_phone": "987654321",
    "instagram_link": "https://instagram.com/ongtwo",
    "x_link": "https://x.com/ongtwo",
    "facebook_link": "https://facebook.com/ongtwo",
    "pix_qr_code_link": "https://pix.com/ongtwo",
    "site": "https://ongtwo.com",
    "gallery_images_url": [],
    "skills": {},
    "causes": {},
    "sustainable_development_goals": {}
  }
]
```

## Test Configuration

```typescript
// Dependency mocks
jest.mock('@config/dependencysInjection/ongDependencyInjection');

// Test server configuration
const server = Fastify();
const ongController = new OngController(
  createOngService,
  deleteOngService,
  getOngService,
  updateOngService,
  updateNgoGraficService
);

// Bind controller method to endpoint
server.get('/ongs', ongController.getAll.bind(ongController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The endpoint does not require authentication
- The test verifies both the response status code and body content
- Custom error handling returns appropriate status code and error message