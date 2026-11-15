import { HttpError } from '../api/HttpError.js';

export type SearchError =
  | { type: 'aborted' }
  | { type: 'timeout' }
  | { type: 'http'; status: number }
  | { type: 'network' }
  | { type: 'unknown' };

export function classifySearchError(error: unknown): SearchError {
  if (error instanceof DOMException) {
    if (error.name === 'AbortError') {
      return { type: 'aborted' };
    }

    if (error.name === 'TimeoutError') {
      return { type: 'timeout' };
    }
  }

  if (error instanceof HttpError) {
    return {
      type: 'http',
      status: error.status,
    };
  }

  if (error instanceof TypeError) {
    return { type: 'network' };
  }

  return { type: 'unknown' };
}
