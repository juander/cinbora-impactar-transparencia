# < 0007 - NGO Retrieval with Graphic Data >

## Test Case Information

**Description:** Verifies the functionality to retrieve a single NGO with graphic data through OngController  
**Responsible:** Levi Serrano **<@Levirbs>**  
**Created Date:** 2025-04-03  
**Last Modified:** 2025-04-03  
**Priority:** Medium  
**Test File Path:** `backend/src/modules/ong/infrastructure/controllers/tests/OngController.getOneWithGrafic.test.ts`

## Prerequisites

- System configured with NGO services
- Properly configured dependency mocks
- Fastify server for testing
- Mock NGO and graphic data available for retrieval

## Test Environment

- **Testing Framework:** Jest
- **HTTP Testing Library:** Supertest
- **Server:** Fastify
- **Mocked Services:** getOngService (executeById and getGraficByNgoId methods)

## Test Cases

| ID | Description | Steps | Expected Result | Status |
|----|-------------|-------|-----------------|--------|
| 0001 | Successful retrieval of NGO with graphic data | 1. Send GET request to /ongs/:id/grafic endpoint<br>2. Verify API response | - Status 200<br>- NGO data and graphic data in response body | Passed |
| 0002 | Error handling during NGO with graphic data retrieval | 1. Force CustomError in getOngService.executeById<br>2. Send GET request<br>3. Verify API response | - Status 500<br>- Error message "Internal Server Error" | Passed |

## Test Data

**NGO Data:**
```json
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
}
```

**Graphic Data:**
```json
{
  "totalExpenses": 1000,
  "expensesByCategory": { "Education": 500, "Health": 500 }
}
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
server.get('/ongs/:id/grafic', ongController.getOneWithGrafic.bind(ongController));
```

## Notes

- Tests use a 10000ms timeout
- Error logs are intercepted during testing
- The endpoint combines two service calls: one to get NGO data and another for graphic data
- The response combines both data sources into a single object
- Custom error handling returns appropriate status code and error message