import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from '../src/api/searchCountries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns countries after a successful response', async () => {
    const countries = [{ name: 'Spain', capital: 'Madrid' }];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => countries,
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const result = await searchCountries('spain', controller.signal);

    expect(result).toEqual(countries);
    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/spain', {
      signal: controller.signal,
    });
  });

  it('returns an empty array for HTTP 404', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await searchCountries(
      'unknowncountry',
      new AbortController().signal,
    );

    expect(result).toEqual([]);
  });

  it('throws HttpError for HTTP 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(
      searchCountries('spain', new AbortController().signal),
    ).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('propagates network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(
      searchCountries('spain', new AbortController().signal),
    ).rejects.toThrow('Failed to fetch');
  });
});
