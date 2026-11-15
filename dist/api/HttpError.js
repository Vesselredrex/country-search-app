export class HttpError extends Error {
    status;
    constructor(status) {
        super(`HTTP error: ${status}`);
        this.status = status;
        this.name = 'HttpError';
    }
}
