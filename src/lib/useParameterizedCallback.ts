import { useEffect, useRef } from 'react';

const useParameterizedCallback = <TParam, TCallback extends (...args: any[]) => any>(
  callbackGenerator: (param: TParam) => TCallback,
  deps: Array<any>,
): ((param: TParam) => TCallback) => {
  const cache = useRef(new Map<TParam, TCallback>());

  useEffect(() => {
    cache.current = new Map<TParam, TCallback>();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return param => {
    if (!cache.current!.has(param)) {
      cache.current!.set(param, callbackGenerator(param));
    }

    return cache.current!.get(param)!;
  };
};

export default useParameterizedCallback;
