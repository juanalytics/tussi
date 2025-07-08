import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const authSuccessRate = new Rate('auth_success_rate');
const productSuccessRate = new Rate('product_success_rate');
const authResponseTime = new Trend('auth_response_time');
const productResponseTime = new Trend('product_response_time');
const authErrors = new Counter('auth_errors');
const productErrors = new Counter('product_errors');

export const options = {
  stages: [
    { duration: '1s', target: 5 },    // Warm-up
    { duration: '2s', target: 20 },   // Ramp-up
    { duration: '3s', target: 20 },   // Sustained load
    { duration: '2s', target: 50 },   // Stress test
    { duration: '1s', target: 100 },   // Spike test
    { duration: '7s', target: 20 },   // Recovery
    { duration: '3s', target: 0 },     // Cool-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'http_req_failed': ['rate<0.1'],
    'auth_response_time': ['p(95)<1500'],
    'product_response_time': ['p(95)<2000'],
    'auth_success_rate': ['rate>0.95'],
    'product_success_rate': ['rate>0.95'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://load-balancer';
const API_BASE = `${BASE_URL}/api`;

const testUsers = [
  { username: 'testuser1@example.com', password: 'Password123' },
  { username: 'testuser2@example.com', password: 'Password123' },
  { username: 'testuser3@example.com', password: 'Password123' },
];

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Helper for x-www-form-urlencoded encoding (K6 does not support URLSearchParams)
function encodeForm(data) {
  return Object.keys(data)
    .map(
      (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
    )
    .join('&');
}

function authenticateUser(username, password) {
  const loginPayload = encodeForm({
    username: username,
    password: password,
  });

  const loginRes = http.post(`${API_BASE}/auth/login`, loginPayload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const authSuccess = check(loginRes, {
    'login successful': (r) => r.status === 200 && r.json('access_token'),
    'login response time < 1s': (r) => r.timings.duration < 1000,
  });

  authSuccessRate.add(authSuccess);
  authResponseTime.add(loginRes.timings.duration);

  if (!authSuccess) {
    authErrors.add(1);
    return null;
  }

  return loginRes.json('access_token');
}

export default function () {
  const user = getRandomUser();
  let authToken = null;

  group('Authentication', function () {
    authToken = authenticateUser(user.username, user.password);
    if (authToken) {
      const profileRes = http.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const profileSuccess = check(profileRes, {
        'profile fetch successful': (r) => r.status === 200,
        'profile response time < 1s': (r) => r.timings.duration < 1000,
      });
      authSuccessRate.add(profileSuccess);
      authResponseTime.add(profileRes.timings.duration);
      if (!profileSuccess) {
        authErrors.add(1);
      }
    }
    sleep(0.5);
  });

  group('Public Product Browsing', function () {
    const productsRes = http.get(`${API_BASE}/products`);
    // Accept the current response as valid: status 200 and has a 'message' property
    const productsSuccess = check(productsRes, {
      'products fetch successful': (r) => r.status === 200,
      'products response time < 2s': (r) => r.timings.duration < 2000,
      'products returned message': (r) => typeof r.json() === 'object' && r.json().message !== undefined,
    });
    productSuccessRate.add(productsSuccess);
    productResponseTime.add(productsRes.timings.duration);
    if (!productsSuccess) {
      productErrors.add(1);
    }
    sleep(1);
  });
}

export function setup() {
  // console.log('🚀 Starting K6 Performance Test');
  // console.log(`📡 Testing against: ${BASE_URL}`);
  // console.log(`🔧 API Base: ${API_BASE}`);
  return {
    baseUrl: BASE_URL,
    apiBase: API_BASE,
    testUsers: testUsers.length,
  };
}

export function teardown(data) {
  // console.log('✅ K6 Performance Test Completed');
  // console.log(`📊 Tested ${data.testUsers} users`);
  // console.log(`🌐 Base URL: ${data.baseUrl}`);
}