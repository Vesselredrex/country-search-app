import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCountries } from '../src/api/searchCountries';

describe('searchCountries', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
      signal: expect.any(AbortSignal),
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

  it('aborts the combined signal on user cancellation', async () => {
    const timeoutController = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const request = searchCountries('spain', controller.signal);
    const combinedSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    expect(combinedSignal).not.toBe(controller.signal);
    expect(combinedSignal.aborted).toBe(false);
    controller.abort();

    expect(combinedSignal.aborted).toBe(true);
    expect(combinedSignal.reason).toBe(controller.signal.reason);
    await request;
  });

  it('aborts the combined signal on timeout', async () => {
    const timeoutController = new AbortController();
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    });
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const request = searchCountries('spain', controller.signal);
    const combinedSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    const timeoutError = new DOMException('Request timed out', 'TimeoutError');

    expect(combinedSignal.aborted).toBe(false);
    timeoutController.abort(timeoutError);

    expect(combinedSignal.aborted).toBe(true);
    expect(combinedSignal.reason).toBe(timeoutError);
    expect(controller.signal.aborted).toBe(false);
    await request;
  });
});
