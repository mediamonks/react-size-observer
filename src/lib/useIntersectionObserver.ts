import { useCallback, useEffect, useRef, useState } from 'react';
import useStableCallback from './useStableCallback';

export type Omit<T, K extends keyof T> = Pick<
  T,
  ({ [P in keyof T]: P } & { [P in K]: never })[keyof T]
>;

const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  root: Element | null,
  options: Omit<IntersectionObserverInit, 'root'>,
  allowNull = false,
) => {
  const observerRef = useRef<IntersectionObserver|null>(null);
  const observedElementsRef = useRef<Set<Element>>(new Set());
  const proxiedCallback = useStableCallback(callback);

  // causes a new IntersectionObserver to be created when
  useEffect(() => {
    const { current: observedElements } = observedElementsRef;

    if (root || allowNull) {
      const newObserver = new IntersectionObserver((...args) => proxiedCallback(...args), {
        root,
        ...options,
      });

      observedElementsRef.current.forEach(el => newObserver.observe(el));


      observerRef.current = newObserver;
    }

    return () => {
      if (observerRef.current) {
        observedElements.forEach(element => observerRef.current!.unobserve(element));

        observerRef.current = null;
      }
    };
  }, [root, allowNull, options.rootMargin, JSON.stringify(options.threshold)]); // eslint-disable-line react-hooks/exhaustive-deps

  const observe = useCallback(
    (el: Element) => {
      const { current: observedElements } = observedElementsRef;
      const { current: observer } = observerRef;

      if (!observedElements.has(el)) {
        if (observer) {
          observer.observe(el);
        }
        observedElements.add(el);
      }
    },
    [observerRef.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const unobserve = useCallback(
    (el: Element) => {
      const { current: observedElements } = observedElementsRef;
      const { current: observer } = observerRef;

      if (observedElements.has(el)) {
        if (observer) {
          observer.unobserve(el);
        }
        observedElements.delete(el);
      }
    },
    [observerRef.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return [observe, unobserve];
};

export default useIntersectionObserver;
