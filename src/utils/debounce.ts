export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs): void => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
