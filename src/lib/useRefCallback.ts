import { useCallback, useEffect, useRef } from 'react';

const useRefCallback = <TParams extends Array<any>, TReturn>(
  callback: (...args: TParams) => TReturn,
): ((...args: TParams) => TReturn) => {
  const innerCallback = useRef<(...args: TParams) => TReturn>(callback);

  useEffect(() => {
    innerCallback.current = callback;
  }, [callback]); // eslint-disable-line react-hooks/exhaustive-deps

  const wrapperCallback = useCallback<(...args: TParams) => TReturn>((...args) => {
    return innerCallback.current(...args);
  }, []);

  return wrapperCallback;
};

export default useRefCallback;
