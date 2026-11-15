import { createSearchController } from './controllers/createSearchController.js';
import {
  mapCountryResponse,
  type RawCountry,
} from './mappers/mapCountryResponse.js';
import { classifySearchError } from './utils/classifySearchError.js';

const app = document.createElement('main');
app.className = 'app';

const heading = document.createElement('h1');
heading.textContent = 'Country Search';

const description = document.createElement('p');
description.textContent = 'Discover countries around the world.';

const label = document.createElement('label');
label.htmlFor = 'country-search';
label.textContent = 'Search for a country';

const input = document.createElement('input');
input.id = 'country-search';
input.type = 'search';
input.placeholder = 'e.g. Spain, France, Germany';
input.autocomplete = 'off';

const status = document.createElement('p');
status.id = 'search-status';
status.setAttribute('role', 'status');
status.textContent = 'Start typing to search for countries.';

const results = document.createElement('section');
results.id = 'country-results';
results.setAttribute('aria-label', 'Country results');

app.append(heading, description, label, input, status, results);

document.body.append(app);

function isRawCountry(value: unknown): value is RawCountry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

function renderCountries(rawCountries: unknown[]): void {
  results.replaceChildren();

  const countries = rawCountries.filter(isRawCountry).map(mapCountryResponse);

  if (countries.length === 0) {
    status.textContent = input.value.trim()
      ? 'No countries found.'
      : 'Start typing to search for countries.';
    return;
  }

  status.textContent = `Found ${countries.length} countries.`;

  for (const country of countries) {
    const card = document.createElement('details');
    card.className = 'country-card';

    const summary = document.createElement('summary');

    const title = document.createElement('strong');
    title.textContent = `${country.flag ?? ''} ${country.name}`;

    const overview = document.createElement('span');
    overview.textContent = ` — ${country.capital ?? 'Unknown capital'}, ${country.region ?? 'Unknown region'}`;

    summary.append(title, overview);
    card.append(summary);

    function addDetail(label: string, value: string): void {
      const paragraph = document.createElement('p');

      const heading = document.createElement('strong');
      heading.textContent = `${label}: `;

      paragraph.append(heading, document.createTextNode(value));

      card.append(paragraph);
    }

    const formatNumber = (value: number | null): string =>
      value === null ? 'Unknown' : new Intl.NumberFormat('en-US').format(value);

    addDetail('Capital', country.capital ?? 'Unknown');
    addDetail('Region', country.region ?? 'Unknown');
    addDetail('Subregion', country.subregion ?? 'Unknown');
    addDetail('Population', formatNumber(country.population));
    addDetail(
      'Area',
      country.area === null ? 'Unknown' : `${formatNumber(country.area)} km²`,
    );
    addDetail('Languages', country.languages.join(', ') || 'Unknown');
    addDetail('Currencies', country.currencies.join(', ') || 'Unknown');
    addDetail('Borders', country.borders.join(', ') || 'None');

    results.append(card);
  }
}

function renderError(error: unknown): void {
  const classifiedError = classifySearchError(error);

  if (classifiedError.type === 'aborted') {
    return;
  }

  results.replaceChildren();

  switch (classifiedError.type) {
    case 'timeout':
      status.textContent = 'Request timed out. Please try again.';
      break;
    case 'http':
      status.textContent = `Server error: HTTP ${classifiedError.status}`;
      break;
    case 'network':
      status.textContent = 'Network error. Check your connection.';
      break;
    default:
      status.textContent = 'Something went wrong.';
  }

  const retryButton = document.createElement('button');
  retryButton.type = 'button';
  retryButton.textContent = 'Try again';

  retryButton.addEventListener('click', () => {
    status.textContent = 'Searching...';
    results.replaceChildren();
    search.onInput(input.value);
  });

  results.append(retryButton);
}

const search = createSearchController(renderCountries, renderError);

input.addEventListener('input', () => {
  results.replaceChildren();

  status.textContent = input.value.trim()
    ? 'Searching...'
    : 'Start typing to search for countries.';

  search.onInput(input.value);
});
