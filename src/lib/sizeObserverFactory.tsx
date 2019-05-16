import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Breakpoint from './Breakpoint';
import defaultPackageConfig from './defaultPackageConfig';
import { defaultWrapperStyles } from './styles';
import { PackageConfig, SizeObserverProps } from './types';
import useDefaultProperties from './useDefaultProperties';
import useIntersectionObserver from './useIntersectionObserver';
import useParameterizedCallback from './useParameterizedCallback';

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
    const breakpointRefs = useRef<Array<HTMLDivElement | null>>(sizes.map(() => null));
    const [intersecting, setIntersecting] = useState<Array<boolean | null>>(sizes.map(() => null));

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

    const observerCallback = useCallback<IntersectionObserverCallback>(entries => {
      setIntersecting(oldIntersecting => {
        const newIntersecting = [...oldIntersecting];
        let mutated = false;

        entries.forEach(entry => {
          const breakpointIndex = breakpointRefs.current
            .slice(0, sizes.length)
            .findIndex(element => element === entry.target);

          if (breakpointIndex < 0) {
            // tslint-disable-next-line no-console
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
    }, [sizes.length]);

    const [observe, unobserve] = useIntersectionObserver(observerCallback, wrapperElement, {
      threshold: 1,
    });

    const setBreakpointRef = useParameterizedCallback(
      (index: number) => (e: HTMLDivElement) => {
        if (breakpointRefs.current[index]) {
          unobserve(e);
        }

        breakpointRefs.current[index] = e;
        if (e) {
          observe(e);
        }
      },
      [observe, unobserve],
    );

    const wrapperStyle = useDefaultProperties(style, defaultWrapperStyles);

    return (
      <div style={wrapperStyle} className={className} ref={setWrapperElement}>
        {sizes.map((sizeConfig, index) => (
          <Breakpoint key={index} ref={setBreakpointRef(index)} config={sizeConfig} />
        ))}

        {activeBreakpoint !== null && (
          <ContextProvider name={name} sizes={sizes} breakpoint={activeBreakpoint!}>
            {typeof children === 'function' ? children(activeBreakpoint, sizes) : children}
          </ContextProvider>
        )}
      </div>
    );
  };
