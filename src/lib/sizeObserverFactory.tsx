import React, { useEffect, useMemo, useRef, useState } from 'react';
import Breakpoint from './Breakpoint';
import defaultPackageConfig from './defaultPackageConfig';
import { defaultWrapperStyles } from './styles';
import { PackageConfig, SizeObserverProps } from './types';
import useDefaultProperties from './useDefaultProperties';

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

    // when sizes change, reset breakpoints and intersecting arrays
    // mainly to make sure that there are no lingering values when the new length is shorter
    useEffect(() => {
      breakpointRefs.current.length = sizes.length;
      sizes.forEach((_, index) => breakpointRefs.current[index] = null);

      setIntersecting(sizes.map(() => null));
    }, [sizes]);

    // calculate the active breakpoint
    const activeBreakpoint = useMemo<number | null>(() => {
      if (intersecting.some(val => val === null)) {
        return null;
      }

      for (let i = 0; i < sizes.length; i++) {
        if (!intersecting[i]) {
          return i;
        }
      }

      throw new Error('Unexpected no return from indexes loop');
    }, [intersecting, setIntersecting]);

    const wrapperStyle = useDefaultProperties(style, defaultWrapperStyles);

    return (
      <div style={wrapperStyle} className={className} ref={setWrapperElement}>
        {sizes.map((sizeConfig, index) => (
          <Breakpoint
            key={index}
            ref={e => {
              breakpointRefs.current[index] = e;
            }}
            config={sizeConfig}
          />
        ))}

        {activeBreakpoint !== null && (
          <ContextProvider name={name} sizes={sizes} breakpoint={activeBreakpoint!}>
            {typeof children === 'function' ? children(activeBreakpoint, sizes) : children}
          </ContextProvider>
        )}
      </div>
    );
  };
