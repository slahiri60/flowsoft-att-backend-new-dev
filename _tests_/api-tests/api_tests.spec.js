import { test, expect } from '@playwright/test';
const assert = require('assert');

// Create a reusable validation function
// Dummy comment to trigger Playwright API Tests on PR
function validateField(actualValue, expectedValue, fieldName) {
  if (fieldName != 'Due Date') {
    assert.strictEqual(
      expectedValue,
      actualValue,
      `Values of ${fieldName} do not match. Expected: "${expectedValue}", Actual: "${actualValue}"`
    );
    console.log(
      `Value of ${fieldName} validated successfully - expected value: ${expectedValue}; actual value: ${actualValue}`
    );
  } else {
    assert.ok(
      actualValue.includes(expectedValue),
      `DueDate in API response does not contain the DueDate in JSON body"`
    );
    console.log(
      `Value of ${fieldName} in JSON response: ${actualValue} validated to contain value of ${fieldName} in JSON body: ${expectedValue}`
    );
  }
}

// Create a test suite that will run in sequence
test.describe.serial('API Action Items Tests', () => {
  let itemId;
  let actionitemCount;
  // Store expected values to reuse across tests
  const testData = {
    summary: 'Concert tickets',
    description: 'Book tickets for the upcoming concert',
    criticality: 'high',
    importance: 'important',
    dueDate: '2025-04-14',
    updatedSummary: 'Tax filing',
    updatedDescription: 'File taxes for current year',
    updatedCriticality: 'medium',
    updatedImportance: 'unimportant',
    updatedDueDate: '2025-04-15',
  };

  // Test 1: GET all action items
  test('API GET All Request', async ({ request }) => {
    const response = await request.get(
      'https://flowsoft-att-backend-dev-c9fb49414d00.herokuapp.com/api/v1/actionitems'
    );
    expect(response.status()).toBe(200);

    // Retrieve count of Action Items
    const responseBody = await response.json();
    actionitemCount = responseBody.count;
    console.log('Count of Action Items:', actionitemCount);
    assert.ok(
      actionitemCount >= 0,
      'Number of Action Items should be greater than or equal to 0'
    );
    console.log('Count of Action Items validated to be >= 0');
  });

  // Test 2: POST new action item and extract the ID
  test('API POST Request', async ({ request }) => {
    const response = await request.post(
      'https://flowsoft-att-backend-dev-c9fb49414d00.herokuapp.com/api/v1/actionitems',
      {
        data: {
          summary: testData.summary,
          description: testData.description,
          criticality: testData.criticality,
          importance: testData.importance,
          dueDate: testData.dueDate,
        },
      }
    );
    expect(response.status()).toBe(201);
    const responseBody = await response.json();

    // Store the ID
    itemId = responseBody.data._id;
    console.log('Created item ID:', itemId);

    // Additional assertions
    validateField(responseBody.data.summary, testData.summary, 'Summary');
    validateField(
      responseBody.data.description,
      testData.description,
      'Description'
    );
    validateField(
      responseBody.data.criticality[0],
      testData.criticality,
      'Criticality'
    );
    validateField(
      responseBody.data.importance[0],
      testData.importance,
      'Importance'
    );
    validateField(responseBody.data.dueDate, testData.dueDate, 'Due Date');
  });

  // Test 3: GET the specific action item using the extracted ID
  test('API GET One Request', async ({ request }) => {
    // Skip this test if no ID was created
    test.skip(!itemId, 'No item ID was created');

    const response = await request.get(
      `https://flowsoft-att-backend-dev-c9fb49414d00.herokuapp.com/api/v1/actionitems/${itemId}`
    );
    expect(response.status()).toBe(200);
    const responseBody = await response.json();

    // Additional assertions
    validateField(responseBody.data.summary, testData.summary, 'Summary');
    validateField(
      responseBody.data.description,
      testData.description,
      'Description'
    );
    validateField(
      responseBody.data.criticality[0],
      testData.criticality,
      'Criticality'
    );
    validateField(
      responseBody.data.importance[0],
      testData.importance,
      'Importance'
    );
    validateField(responseBody.data.dueDate, testData.dueDate, 'Due Date');
  });

  // Test 4: PUT to update the created action item
  test('API PUT Request', async ({ request }) => {
    // Skip this test if no ID was created
    test.skip(!itemId, 'No item ID was created');

    const response = await request.put(
      `https://flowsoft-att-backend-dev-c9fb49414d00.herokuapp.com/api/v1/actionitems/${itemId}`,
      {
        data: {
          summary: testData.updatedSummary,
          description: testData.updatedDescription,
          criticality: testData.updatedCriticality,
          importance: testData.updatedImportance,
          dueDate: testData.updatedDueDate,
        },
      }
    );
    expect(response.status()).toBe(200);
    const responseBody = await response.json();

    // Additional assertions
    validateField(
      responseBody.data.summary,
      testData.updatedSummary,
      'Summary'
    );
    validateField(
      responseBody.data.description,
      testData.updatedDescription,
      'Description'
    );
    validateField(
      responseBody.data.criticality[0],
      testData.updatedCriticality,
      'Criticality'
    );
    validateField(
      responseBody.data.importance[0],
      testData.updatedImportance,
      'Importance'
    );
    validateField(
      responseBody.data.dueDate,
      testData.updatedDueDate,
      'Due Date'
    );
  });

  // Test 5: DELETE the created action item
  test('API DELETE Request', async ({ request }) => {
    // Skip this test if no ID was created
    test.skip(!itemId, 'No item ID was created');

    const response = await request.delete(
      `https://flowsoft-att-backend-dev-c9fb49414d00.herokuapp.com/api/v1/actionitems/${itemId}`
    );
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    console.log("Success status of 'true' validated");
  });

  // Test 6: Re-DELETE the created action item
  test('API Second DELETE Request', async ({ request }) => {
    // Skip this test if no ID was created
    test.skip(!itemId, 'No item ID was created');

    const response = await request.delete(
      `https://flowsoft-att-backend-dev-c9fb49414d00.herokuapp.com/api/v1/actionitems/${itemId}`
    );
    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(false);
    console.log("Success status of 'false' validated");
  });
});
