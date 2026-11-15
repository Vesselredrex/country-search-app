import { HttpError } from '../api/HttpError.js';
export function classifySearchError(error) {
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
