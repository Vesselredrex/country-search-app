export function createSearchController(
  onResults: (countries: unknown[]) => void,
) {
  return {
    onInput(query: string): void {
      if (query === '') {
        onResults([]);
      }
    },
  };
}
