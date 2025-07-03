import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 virtual users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 virtual users for 1 minute
    { duration: '10s', target: 0 },  // Ramp-down to 0 virtual users
  ],
  thresholds: {
    'http_req_duration': ['p(99)<1500'], // 99% of requests must complete in less than 1.5s
  },
};

export default function () {
  // Access the frontend service through the load balancer
  const res = http.get('http://load-balancer');
  
  // Verify that the request was successful
  check(res, { 'status was 200': (r) => r.status == 200 });
  
  // Wait for 1 second before sending another request
  sleep(1);
} 