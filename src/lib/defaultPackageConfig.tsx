import React, { useContext, useMemo } from 'react';
import DefaultContext from './DefaultContext';
import { PackageConfig } from './types';

const defaultPackageConfig: PackageConfig = {
  ContextProvider: ({ sizes, name, activeSizeIndex, children }) => {
    const currentContextValue = useContext(DefaultContext);

    const contextValue = useMemo(() => {
      const newContextValue = {
        sizes,
        activeSizeIndex,
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
          activeSizeIndex,
        };
      }

      return newContextValue;
    }, [sizes, name, activeSizeIndex, currentContextValue.named]);

    return (
      <DefaultContext.Provider value={contextValue}>
        {children}
      </DefaultContext.Provider>
    )
  },
  useSizeObserverContext: () => useContext(DefaultContext),
};

export default defaultPackageConfig;
