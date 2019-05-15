import React, { useContext, useEffect, useRef } from 'react';
import DefaultContext from './DefaultContext';
import { PackageConfig, SizeObserverContextValue } from './types';

const defaultPackageConfig: PackageConfig = {
  ContextProvider: ({ sizes, name, breakpoint, children }) => {
    const currentContextValue = useContext(DefaultContext);
    const contextValueRef = useRef<SizeObserverContextValue>();

    useEffect(() => {
      const newContextValue = {
        sizes,
        breakpoint,
        named: { ...currentContextValue.named },
      };

      if (name) {
        if (newContextValue.named[name]) {
          throw new ReferenceError(
            `Multiple SizeObservers exist in the tree with the same name "${name}"`,
          );
        }

        newContextValue.named[name] = {
          sizes,
          breakpoint,
        };
      }

      contextValueRef.current = newContextValue;
    }, [sizes, name, breakpoint]);

    return (
      <DefaultContext.Provider value={contextValueRef.current!}>
        { children }
      </DefaultContext.Provider>
    )
  },
  useSizeObserverContext: () => useContext(DefaultContext),
};

export default defaultPackageConfig;
