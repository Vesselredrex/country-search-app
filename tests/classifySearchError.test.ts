import { describe, expect, it } from 'vitest';
import { HttpError } from '../src/api/HttpError';
import { classifySearchError } from '../src/utils/classifySearchError';

describe('classifySearchError', () => {
  it('recognizes user cancellation', () => {
    const error = new DOMException('Request aborted', 'AbortError');

    expect(classifySearchError(error)).toEqual({
      type: 'aborted',
    });
  });

  it('recognizes a timeout', () => {
    const error = new DOMException('Request timed out', 'TimeoutError');

    expect(classifySearchError(error)).toEqual({
      type: 'timeout',
    });
  });

  it('recognizes an HTTP error', () => {
    const error = new HttpError(500);

    expect(classifySearchError(error)).toEqual({
      type: 'http',
      status: 500,
    });
  });

  it('recognizes a network error', () => {
    const error = new TypeError('Failed to fetch');

    expect(classifySearchError(error)).toEqual({
      type: 'network',
    });
  });
});
