// load-test.js — k6 load test for the Books CRUD API
// Simulates 500 concurrent virtual users hitting /books endpoints for 60 seconds.
// Captures latency percentiles, error rate, and throughput.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const errors = new Counter('errors');
const errorRate = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '15s', target: 500 },
    { duration: '60s', target: 500 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const r = Math.random();

  if (r < 0.8) {
    const res = http.get(`${BASE_URL}/books`);
    const ok = check(res, {
      'GET /books status is 200': (r) => r.status === 200,
      'GET /books returns array': (r) => Array.isArray(r.json()),
    });
    if (!ok) {
      errors.add(1);
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }
  } else {
    const payload = JSON.stringify({
      title: `Book ${Math.floor(Math.random() * 100000)}`,
      author: 'Load Tester',
      published_year: 2026,
    });
    const headers = { 'Content-Type': 'application/json' };
    const res = http.post(`${BASE_URL}/books`, payload, { headers });
    const ok = check(res, {
      'POST /books status is 201': (r) => r.status === 201,
    });
    if (!ok) {
      errors.add(1);
      errorRate.add(1);
    } else {
      errorRate.add(0);
    }
  }

  sleep(0.5);
}