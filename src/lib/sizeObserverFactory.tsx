import React, { useCallback, useMemo, useRef, useState } from 'react';
import BreakpointIndicator, { BreakpointIndicatorProps } from './BreakpointIndicator';
import breakpointProperties from './breakpointProperties';
import defaultPackageConfig from './defaultPackageConfig';
import { defaultWrapperStyles } from './styles';
import { PackageConfig, SizeObserverProps } from './types';
import useDefaultProperties from './useDefaultProperties';
import useIntersectionObserver from './useIntersectionObserver';
import useParameterizedCallback from './useParameterizedCallback';

interface SizeProperty extends BreakpointIndicatorProps {
  size: number;
}

export default ({ ContextProvider }: PackageConfig = defaultPackageConfig) =>
  function SizeObserver<TSizeName extends string>({
    children,
    sizes,
    name,
    style = {},
    className,
  }: SizeObserverProps<TSizeName>) {
    // we need the wrapper element to pass to IntersectionObserver
    // use useState instead of useRef, because we want
    // a new IntersectionObserver when wrapperElement changes
    const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(null);
    const indicatorRefs = useRef<Array<HTMLDivElement | null>>(sizes.map(() => null));
    const [intersecting, setIntersecting] = useState<Array<boolean | null>>(sizes.map(() => null));

    // create an array size properties -- each property on each size needs its own indicator element
    const sizeProperties = useMemo(
      () =>
        sizes.reduce(
          (properties, size, index) => {
            breakpointProperties.forEach(prop => {
              if (typeof size[prop] !== 'undefined') {
                properties.push({
                  configKey: prop,
                  value: size[prop]!,
                  size: index,
                });
              }
            });
            return properties;
          },
          [] as Array<SizeProperty>,
        ),
      [sizes],
    );

    // calculate the active breakpoint
    const activeBreakpoint = useMemo<number | null>(() => {
      if (intersecting.slice(0, sizes.length).some(val => val === null)) {
        return null;
      }

      for (let i = 0; i < sizes.length; i++) {
        if (!intersecting[i]) {
          return i;
        }
      }

      throw new Error('Unexpected no return from indexes loop');
    }, [intersecting, sizes.length]);

    // create the callback that will be passed to IntersectionObserver
    const observerCallback = useCallback<IntersectionObserverCallback>(
      entries => {
        setIntersecting(oldIntersecting => {
          const newIntersecting = [...oldIntersecting];
          let mutated = false;

          entries.forEach(entry => {
            const breakpointIndex = indicatorRefs.current
              .slice(0, sizes.length)
              .findIndex(element => element === entry.target);

            if (breakpointIndex < 0) {
              // tslint:disable-next-line no-console
              console.error('Could not find IntersectionObserverEntry.target in breakpointRefMap');
              return;
            }

            const isFullyIntersecting = entry.intersectionRatio >= 1;
            if (newIntersecting[breakpointIndex] !== isFullyIntersecting) {
              newIntersecting[breakpointIndex] = isFullyIntersecting;
              mutated = true;
            }
          });

          return mutated ? newIntersecting : oldIntersecting;
        });
      },
      [sizes.length],
    );

    const [observe, unobserve] = useIntersectionObserver(observerCallback, wrapperElement, {
      threshold: 1,
    });

    // register and unregister the breakpoint divs with IntersectionObserver
    const setBreakpointRef = useParameterizedCallback(
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

    const wrapperStyle = useDefaultProperties(style, defaultWrapperStyles);

    return (
      <div style={wrapperStyle} className={className} ref={setWrapperElement}>
        {sizeProperties.map(({ size, ...indicatorProps }, index) => (
          <BreakpointIndicator key={index} ref={setBreakpointRef(index)} {...indicatorProps} />
        ))}

        {activeBreakpoint !== null && (
          <ContextProvider name={name} sizes={sizes} breakpoint={activeBreakpoint!}>
            {typeof children === 'function' ? children(activeBreakpoint, sizes) : children}
          </ContextProvider>
        )}
      </div>
    );
  };
