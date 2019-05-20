import debounce from 'debounce';
import { useEffect, useRef } from 'react';

const useRateLimitEffect = (
  limit: number,
  interval: number,
  limitCallback: () => any,
  deps?: Array<any>,
) => {
  const count = useRef(0);

  const clearCountDebounced = useRef(
    debounce(() => {
      count.current = 0;
    }, interval),
  );

  useEffect(() => {
    count.current++;
    clearCountDebounced.current();

    if (count.current > limit) {
      limitCallback();
      count.current = 0;
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useRateLimitEffect;
