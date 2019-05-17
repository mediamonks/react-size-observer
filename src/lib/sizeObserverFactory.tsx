import React, { useCallback, useMemo, useRef, useState } from 'react';
import SizeIndicator, { SizeIndicatorProps } from './SizeIndicator';
import defaultPackageConfig from './defaultPackageConfig';
import sizePropertyIsMatch from './sizePropertyIsMatch';
import sizePropertyNames from './sizePropertyNames';
import { defaultWrapperStyles } from './styles';
import { PackageConfig, SizeObserverProps } from './types';
import useDefaultProperties from './useDefaultProperties';
import useIntersectionObserver from './useIntersectionObserver';
import useParameterizedCallback from './useParameterizedCallback';

interface SizePropertyState extends SizeIndicatorProps {
  sizeIndex: number;
}

export default ({ ContextProvider }: PackageConfig = defaultPackageConfig) =>
  function SizeObserver<TSizeName extends string>({
    children,
    sizes,
    name,
    style = {},
    className,
    renderWithoutActiveSize,
  }: SizeObserverProps<TSizeName>) {
    // we need the wrapper element to pass to IntersectionObserver
    // use useState instead of useRef, because we want
    // a new IntersectionObserver when wrapperElement changes
    const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(null);

    // create an array size properties -- each property on each size needs its own indicator element
    const sizePropertyState = useMemo(
      () =>
        sizes.reduce(
          (properties, size, index) => {
            sizePropertyNames.forEach(prop => {
              if (typeof size[prop] !== 'undefined') {
                properties.push({
                  configKey: prop,
                  value: size[prop]!,
                  sizeIndex: index,
                });
              }
            });
            return properties;
          },
          [] as Array<SizePropertyState>,
        ),
      [sizes],
    );

    const indicatorRefs = useRef<Array<HTMLDivElement | null>>(sizePropertyState.map(() => null));

    // Array with a boolean for each SizeIndicator, that states if it is fully intersecting
    const [fullyIntersecting, setFullyIntersecting] = useState<Array<boolean | null>>(
      sizePropertyState.map(() => null),
    );

    // create the callback that will be passed to IntersectionObserver
    const observerCallback = useCallback<IntersectionObserverCallback>(entries => {
      setFullyIntersecting(oldIntersecting => {
        const newIntersecting = [...oldIntersecting];
        let mutated = false;

        entries.forEach(entry => {
          const indicatorIndex = indicatorRefs.current.slice(0, sizePropertyState.length).findIndex(
            element => element === entry.target,
          );

          if (indicatorIndex < 0) {
            // tslint:disable-next-line no-console
            console.error('Could not find IntersectionObserverEntry.target in indicatorRefs array');
            return;
          }

          const isFullyIntersecting = entry.intersectionRatio >= 1;
          if (newIntersecting[indicatorIndex] !== isFullyIntersecting) {
            newIntersecting[indicatorIndex] = isFullyIntersecting;
            mutated = true;
          }
        });

        return mutated ? newIntersecting : oldIntersecting;
      });
    }, [sizePropertyState.length]);

    const [observe, unobserve] = useIntersectionObserver(observerCallback, wrapperElement, {
      threshold: 1,
    });

    // register and unregister the indicator divs with IntersectionObserver
    const setIndicatorRef = useParameterizedCallback(
      (index: number) => (e: HTMLDivElement) => {
        if (indicatorRefs.current[index]) {
          unobserve(e);
        }

        indicatorRefs.current[index] = e;
        if (e) {
          observe(e);
        }
      },
      [observe, unobserve],
    );

    // calculate the active indicator
    const activeSizeIndex = useMemo<number>(() => {
      if (fullyIntersecting.slice(0, sizePropertyState.length).some(val => val === null)) {
        return -1;
      }

      // initialize an array that says all sizes match
      const sizesAreMatching = sizes.map(() => true);

      // if we find a property that doesn't match, set sizesAreMatching[size] to false
      sizePropertyState.forEach(((sizeProperty, index) => {
        if (!sizePropertyIsMatch(sizeProperty, fullyIntersecting[index]!)) {
          sizesAreMatching[sizeProperty.sizeIndex] = false;
        }
      }));

      for (let i = 0; i < sizePropertyState.length; i++) {
        if (!fullyIntersecting[i]) {
          return i;
        }
      }

      throw new Error('Unexpected no return from indexes loop');
    }, [fullyIntersecting, sizePropertyState, sizes]);

    const wrapperStyle = useDefaultProperties(style, defaultWrapperStyles);

    const shouldRender = renderWithoutActiveSize || activeSizeIndex !== -1;

    return (
      <div style={wrapperStyle} className={className} ref={setWrapperElement}>
        {sizePropertyState.map(({ sizeIndex, ...indicatorProps }, index) => (
          <SizeIndicator key={index} ref={setIndicatorRef(index)} {...indicatorProps} />
        ))}

        {shouldRender && (
          <ContextProvider name={name} sizes={sizes} activeSizeIndex={activeSizeIndex}>
            {typeof children === 'function' ? children(activeSizeIndex, sizes) : children}
          </ContextProvider>
        )}
      </div>
    );
  };
