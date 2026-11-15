import { searchCountries } from '../api/searchCountries.js';
import { debounce } from '../utils/debounce.js';

export function createSearchController(
  onResults: (countries: unknown[]) => void,
  onError?: (error: unknown) => void,
) {
  let currentController: AbortController | null = null;

  async function runSearch(
    query: string,
    controller: AbortController,
  ): Promise<void> {
    if (controller.signal.aborted || currentController !== controller) {
      return;
    }

    try {
      const countries = await searchCountries(query, controller.signal);

      if (controller.signal.aborted || currentController !== controller) {
        return;
      }

      onResults(countries);
    } catch (error: unknown) {
      if (controller.signal.aborted || currentController !== controller) {
        return;
      }

      onError?.(error);
    }
  }

  const debouncedSearch = debounce(
    (query: string, controller: AbortController) => {
      void runSearch(query, controller);
    },
    300,
  );

  return {
    onInput(query: string): void {
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
