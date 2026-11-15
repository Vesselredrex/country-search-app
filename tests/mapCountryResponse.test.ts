import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../src/mappers/mapCountryResponse';

describe('mapCountryResponse', () => {
  it('maps API data to a country object', () => {
    const raw = {
      name: 'Spain',
      flag: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      subregion: 'Southern Europe',
      population: 47000000,
      area: 505990,
      borders: ['FRA', 'PRT'],
      languages: [{ name: 'Spanish' }],
      currencies: [{ code: 'EUR', name: 'Euro' }],
    };

    const result = mapCountryResponse(raw);

    expect(result).toEqual({
      name: 'Spain',
      flag: '🇪🇸',
      capital: 'Madrid',
      region: 'Europe',
      subregion: 'Southern Europe',
      population: 47000000,
      area: 505990,
      borders: ['FRA', 'PRT'],
      languages: ['Spanish'],
      currencies: ['Euro'],
    });
  });

  it('handles missing optional fields', () => {
    const result = mapCountryResponse({
      name: 'Example Country',
    });

    expect(result).toEqual({
      name: 'Example Country',
      flag: null,
      capital: null,
      region: null,
      subregion: null,
      population: null,
      area: null,
      borders: [],
      languages: [],
      currencies: [],
    });
  });

  it('does not modify the original data', () => {
    const raw = {
      name: 'Spain',
      languages: [{ name: 'Spanish' }],
    };

    const original = structuredClone(raw);

    mapCountryResponse(raw);

    expect(raw).toEqual(original);
  });
});
