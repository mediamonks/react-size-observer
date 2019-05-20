import { useEffect, useMemo, useRef, useState, DependencyList } from 'react';
import { throttle } from 'throttle-debounce';

/**
 * Behaves like a regular useMemo, but once there have been more than
 * `limit` number of changes in `interval` ms, new values will be ignored until
 * the interval has passed.
 *
 * @param factory The factory function that generates the value. Same as `useMemo`
 * @param limit The maximum number of changes per interval
 * @param interval The interval in ms
 * @param limitReachedCallback An optional callback that will be called once each time
 * the limit has been reached. It may be useful to log a warning that the updates are being
 * ignored
 * @param deps The dependency array. Same as `useMemo`
 */
const useMemoRateLimited = <T>(
  factory: () => T,
  limit: number,
  interval: number,
  limitReachedCallback?: () => any,
  deps?: DependencyList,
): T => {
  const count = useRef(0);
  const limitReached = useRef(false);
  const scheduledUpdate = useRef<T | null>(null);
  const internalValue = useMemo<T>(factory, deps);
  const [returnedValue, setReturnedValue] = useState<T>(internalValue);

  const clearCountDebounced = useRef(
    throttle(interval, () => {
      count.current = 0;
      limitReached.current = false;
      if (scheduledUpdate.current !== null) {
        setReturnedValue(scheduledUpdate.current);
      }
    }),
  );

  useEffect(() => {
    count.current++;
    clearCountDebounced.current();

    if (count.current > limit) {
      scheduledUpdate.current = internalValue;
      if (!limitReached.current) {
        limitReached.current = true;

        if (limitReachedCallback) {
          limitReachedCallback();
        }
      }
    } else {
      setReturnedValue(internalValue);
    }
  }, [internalValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return returnedValue;
};

export default useMemoRateLimited;
