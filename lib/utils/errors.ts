export function createAppError(scope: string, message: string, details?: string): Error {
  return new Error(details ? `[${scope}] ${message}: ${details}` : `[${scope}] ${message}`);
}
