import { HttpError } from './HttpError.js';
export async function searchCountries(query, signal) {
    const url = `https://countries.dev/name/${encodeURIComponent(query.trim())}`;
    const timeoutSignal = AbortSignal.timeout(5000);
    const combinedSignal = AbortSignal.any([signal, timeoutSignal]);
    const response = await fetch(url, { signal: combinedSignal });
    if (response.status === 404) {
        return [];
    }
    if (!response.ok) {
        throw new HttpError(response.status);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new TypeError('Expected an array of countries');
    }
    return data;
}
