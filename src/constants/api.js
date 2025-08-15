// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// API Endpoints
export const API_ENDPOINTS = {
  CUSTOMERS: '/customers',
  PAYMENTS: '/payments',
  MEMBERSHIPS: '/memberships',
  MEMBERSHIP_TYPES: '/membership-types',
  CUSTOMER_MEASUREMENTS: '/customer-measurements',
  STATS: '/stats',
  EXERCISES: '/exercises',
  EXERCISE_CATEGORIES: '/exercise-categories',
  MEMBER_PROGRAMS: '/member-programs',
  PROGRAM_EXERCISES: '/program-exercises'
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// Response Status Codes
export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}; 