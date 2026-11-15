import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the function before the delay', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced('Spain');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('Spain');
  });

  it('resets the timer after a new call', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced('Spa');

    vi.advanceTimersByTime(200);

    debounced('Spain');

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('Spain');
  });
});
