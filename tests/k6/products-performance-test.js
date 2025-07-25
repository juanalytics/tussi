
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ----------------------------------------------------------------------------
// Test Configuration
// ----------------------------------------------------------------------------

// Custom Trends for detailed response time analysis
const createProductTrend = new Trend('create_product_duration');
const readProductsTrend = new Trend('read_products_duration');

// Custom Rates for error tracking per scenario
const createProductErrorRate = new Rate('create_product_errors');
const readProductsErrorRate = new Rate('read_products_errors');

// Base URL for the products service (internal Docker network)
const BASE_URL = 'http://products-api:8000';

export const options = {
  thresholds: {
    // Global thresholds
    'http_req_failed': ['rate<0.01'], // Global error rate should be less than 1%
    'http_req_duration': ['p(95)<800'], // 95% of requests should be below 800ms

    // Scenario-specific thresholds
    'read_products_duration': ['p(95)<500'], // 95% of read requests < 500ms
    'create_product_duration': ['p(95)<1500'], // 95% of create requests < 1500ms
    'create_product_errors': ['rate<0.02'], // Error rate for creates < 2%
    'read_products_errors': ['rate<0.01'], // Error rate for reads < 1%
  },
  scenarios: {
    read_products: {
      executor: 'ramping-vus',
      exec: 'readProducts',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 20 },
        { duration: '2m', target: 20 },
        { duration: '1m', target: 40 },
        { duration: '2m', target: 40 },
        { duration: '30s', target: 80 },
        { duration: '1m', target: 80 },
        { duration: '1m', target: 15 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'read_operations' },
    },
    create_products: {
      executor: 'ramping-vus',
      exec: 'createProduct',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 2 },
        { duration: '1m', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '1m', target: 25 },
        { duration: '2m', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'write_operations' },
    },
  },
};

// ----------------------------------------------------------------------------
// Setup: Populate database before the test runs
// ----------------------------------------------------------------------------
export function setup() {
  console.log('Populating the database with sample data...');
  const res = http.post(`${BASE_URL}/products/populate`);
  check(res, {
    'database populated successfully': (r) => r.status === 200 && r.json('message') === 'Database populated successfully',
  });
  if (res.status !== 200) {
      console.error('Failed to populate database, aborting test.');
      // We should see if we can abort the test here. k6 doesn't have a direct way to abort from setup.
  }
  console.log('Database population check complete. Starting test...');
}


// ----------------------------------------------------------------------------
// Test Scenarios (VUs execute these functions)
// ----------------------------------------------------------------------------

// Scenario 1: Read all products from the catalog
export function readProducts() {
  group('Read Products Scenario', function () {
    const res = http.get(`${BASE_URL}/products/?limit=500`); // Read up to 500 products

    const checkRes = check(res, {
      'status is 200': (r) => r.status === 200,
      'response body is not empty': (r) => r && r.body && r.body.length > 0,
    });

    readProductsTrend.add(res.timings.duration);
    readProductsErrorRate.add(!checkRes);

    sleep(1); // Simulate user think time
  });
}

// Scenario 2: Create a new product
export function createProduct() {
  group('Create Product Scenario', function () {
    const productPayload = JSON.stringify({
      name: `K6 Test Product - ${__VU}-${__ITER}`,
      description: 'A product created by a k6 performance test',
      price: Math.random() * 100,
      stock: 100,
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = http.post(`${BASE_URL}/products/`, productPayload, params);

    const checkRes = check(res, {
      'status is 200': (r) => r.status === 200,
      'product name matches': (r) => r && r.body && r.json('name') === `K6 Test Product - ${__VU}-${__ITER}`,
    });

    createProductTrend.add(res.timings.duration);
    createProductErrorRate.add(!checkRes);

    sleep(2); // Wait a bit longer after creating a product
  });
}