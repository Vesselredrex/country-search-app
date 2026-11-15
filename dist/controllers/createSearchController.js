import { searchCountries } from '../api/searchCountries.js';
import { debounce } from '../utils/debounce.js';
export function createSearchController(onResults, onError) {
    let currentController = null;
    async function runSearch(query, controller) {
        if (controller.signal.aborted || currentController !== controller) {
            return;
        }
        try {
            const countries = await searchCountries(query, controller.signal);
            if (controller.signal.aborted || currentController !== controller) {
                return;
            }
            onResults(countries);
        }
        catch (error) {
            if (controller.signal.aborted || currentController !== controller) {
                return;
            }
            onError?.(error);
        }
    }
    const debouncedSearch = debounce((query, controller) => {
        void runSearch(query, controller);
    }, 300);
    return {
        onInput(query) {
            currentController?.abort();
            const trimmedQuery = query.trim();
            if (trimmedQuery === '') {
                currentController = null;
                onResults([]);
                return;
            }
            const controller = new AbortController();
            currentController = controller;
            debouncedSearch(trimmedQuery, controller);
        },
    };
}
