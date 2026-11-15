import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../src/controllers/createSearchController.js';

type PendingRequest = {
  signal: AbortSignal;
  resolve: (response: Response) => void;
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('search request race', () => {
  it('aborts the old request and keeps only the latest results', async () => {
    vi.useFakeTimers();

    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(
      new AbortController().signal,
    );

    const pending: PendingRequest[] = [];

    const fetchMock = vi.fn(
      (_url: string, options: RequestInit): Promise<Response> =>
        new Promise((resolve, reject) => {
          const signal = options.signal as AbortSignal;

          pending.push({ signal, resolve });

          signal.addEventListener('abort', () => reject(signal.reason), {
            once: true,
          });
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const onResults = vi.fn();
    const search = createSearchController(onResults);

    search.onInput('Spain');
    await vi.advanceTimersByTimeAsync(300);

    expect(pending).toHaveLength(1);

    search.onInput('France');

    // The previous request must be cancelled immediately.
    expect(pending[0].signal.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(300);

    expect(pending).toHaveLength(2);

    // The newer request finishes first.
    pending[1].resolve(
      new Response(JSON.stringify([{ name: 'France' }]), {
        status: 200,
      }),
    );

    await vi.advanceTimersByTimeAsync(0);

    expect(onResults).toHaveBeenCalledWith([{ name: 'France' }]);

    // The older request attempts to finish afterwards.
    pending[0].resolve(
      new Response(JSON.stringify([{ name: 'Spain' }]), {
        status: 200,
      }),
    );

    await vi.advanceTimersByTimeAsync(0);

    // The old result must not replace France.
    expect(onResults).toHaveBeenCalledTimes(1);
  });
});
