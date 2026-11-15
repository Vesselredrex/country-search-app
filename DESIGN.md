# Country Search — Design Decisions

## 1. Overview

Country Search is a TypeScript application that allows users
to search for countries using the countries.dev API.

The interface is created using native DOM methods without
innerHTML or external UI frameworks.

## 2. Architecture

The application separates responsibilities into modules:

- `src/index.ts` — DOM creation, rendering, and UI events.
- `src/api/searchCountries.ts` — API requests and HTTP handling.
- `src/api/HttpError.ts` — custom HTTP error class.
- `src/controllers/createSearchController.ts` — search lifecycle.
- `src/utils/debounce.ts` — delays search execution.
- `src/utils/classifySearchError.ts` — error classification.
- `src/mappers/mapCountryResponse.ts` — API data transformation.

This separation makes the code easier to test and maintain.

## 3. Debouncing

The application uses a custom debounce function with a
300 ms delay.

This reduces unnecessary API requests while the user types.

Every new input resets the debounce timer.

## 4. Request Cancellation

Each new search uses its own AbortController.

When the input changes, the previous controller is aborted
immediately, before the debounce delay expires.

AbortSignal.any() combines:

- The user-controlled cancellation signal.
- A timeout signal created with AbortSignal.timeout(5000).

The timeout limit is 5 seconds.

## 5. Race Condition Protection

A slower request must never overwrite the result of a newer one.

The controller verifies that the request:

- Has not been aborted.
- Still belongs to the current AbortController.

These checks run before executing the search and after
receiving a response.

## 6. Error Handling

The application handles:

- HTTP 404 — returns an empty results array.
- Other HTTP errors — throws HttpError with a status code.
- AbortError — ignored when caused by cancellation.
- TimeoutError — displays a timeout message.
- Network errors — displays an error message.
- Unknown errors — displays a generic error message.

The interface provides a retry button for failed requests.

## 7. Data Mapping

mapCountryResponse() transforms API data into a consistent
format for rendering.

Optional fields use null or empty arrays when unavailable.

Languages and currencies are converted from arrays of
objects into arrays of names.

The mapper does not mutate the original input.

## 8. Performance and Complexity

Let:

- N = number of returned countries.
- L = number of languages.
- C = number of currencies.
- B = number of borders.

Debounce scheduling:

- Time: O(1) per input event.
- Space: O(1) for its timer and latest arguments.

Mapping one country:

- Time: O(L + C + B).
- Additional space: O(L + C + B).

Rendering all results:

- Time: O(N + total nested country data).
- DOM memory: O(N + total displayed details).

Network latency and JSON parsing also affect total
response time.

## 9. Testing

Vitest is used for automated tests.

The tests cover:

- Debouncing.
- Successful API responses.
- HTTP 404 and HTTP errors.
- Network failures.
- Country data mapping.
- Error classification.
- Request cancellation and timeout.
- Race condition protection.

The project follows test-driven development (TDD):
tests are committed before their implementations.

## 10. Accessibility

The interface uses:

- An associated label for the search input.
- A status region for search feedback.
- Native details and summary elements.
- Keyboard-accessible buttons.
- Visible keyboard focus states.
- Reduced-motion CSS preferences.

## 11. Future Improvements

Possible enhancements include:

- Caching search results.
- Saving recent searches in localStorage.
- Additional UI tests.
- More detailed validation of API responses.
