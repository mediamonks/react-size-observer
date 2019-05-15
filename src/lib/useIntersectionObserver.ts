import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Set<Element>>(new Set());
  const callbackRef = useRef<IntersectionObserverCallback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (root || allowNull) {
      const newObserver = new IntersectionObserver((...args) => callbackRef.current(...args), {
        root,
        ...options,
      });

      for (const element of observedElementsRef.current.values()) {
        newObserver.observe(element);
      }

      setObserver(newObserver);
    }

    return () => {
      if (observer) {
        for (const element of observedElementsRef.current.values()) {
          observer.unobserve(element);
        }

        setObserver(null);
      }
    };
  }, [root]);

  const observe = useCallback(
    (el: Element) => {
      const { current: observedElements } = observedElementsRef;

      if (!observedElements.has(el)) {
        if (observer) {
          observer.observe(el);
        }
        observedElements.add(el);
      }
    },
    [observer],
  );

  const unobserve = useCallback(
    (el: Element) => {
      const { current: observedElements } = observedElementsRef;

      if (observedElements.has(el)) {
        if (observer) {
          observer.unobserve(el);
        }
        observedElements.delete(el);
      }
    },
    [observer],
  );

  return [observe, unobserve];
};

export default useIntersectionObserver;
