import { useCallback, useEffect, useRef } from 'react';

/**
 * Wraps the provided callback function in a new callback that always has the
 * same reference.
 *
 * @param callback The callback to wrap
 */
const useStableCallback = <TParams extends Array<any>, TReturn>(
  callback: (...args: TParams) => TReturn,
): ((...args: TParams) => TReturn) => {
  const callbackRef = useRef<(...args: TParams) => TReturn>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]); // eslint-disable-line react-hooks/exhaustive-deps

  const stableCallback = useCallback<(...args: TParams) => TReturn>((...args) => {
    return callbackRef.current(...args);
  }, []);

  return stableCallback;
};

export default useStableCallback;
