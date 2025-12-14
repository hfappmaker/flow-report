/**
 * Result type for repository operations
 * Replaces throwing exceptions with explicit error handling
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper function to create a success result
 */
export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper function to create a failure result
 */
export function err<T>(error: string): Result<T> {
  return { success: false, error };
}
