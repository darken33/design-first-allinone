/**
 * Error response structure matching OpenAPI schema.
 * Used for all HTTP 4xx and 5xx responses.
 */
export interface ApiErrorResponse {
  timestamp: string; // ISO 8601 format
  status: number; // HTTP status code
  error: string; // HTTP error name
  message: string; // Human-readable message
  path: string; // Request path
}
