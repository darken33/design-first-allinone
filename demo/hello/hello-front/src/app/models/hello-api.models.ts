// Domain interfaces — mapped from OpenAPI schemas
export interface HelloDto {
  message: string;
}

export interface HealthDto {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime?: number;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// UI state types
export type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export type HealthIndicatorColor = 'green' | 'orange' | 'red' | 'grey';
