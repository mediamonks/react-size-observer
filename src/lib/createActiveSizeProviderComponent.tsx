import { ReactNode } from 'react';
import defaultPackageConfig from './defaultPackageConfig';
import { PackageConfig, SizesConfig } from './types';

interface ActiveSizeProviderProps<TSizeName extends string> {
  children: (activeSizeIndex: number, sizes: SizesConfig<TSizeName>) => ReactNode;
  sizeObserver?: string;
}

export default ({ useSizeObserverContext }: PackageConfig = defaultPackageConfig) =>
  function SizeProvider<TSizeName extends string = string>({
    children,
    sizeObserver,
  }: ActiveSizeProviderProps<TSizeName>) {
    // tslint:disable-next-line prefer-const
    let { activeSizeIndex = -1, sizes = null, named = {} } = useSizeObserverContext() || {};

    if (sizeObserver) {
      ({ activeSizeIndex = -1, sizes = null } = named[sizeObserver] || {});
    }

    if (sizes === null) {
      if (sizeObserver) {
        throw new ReferenceError(
          `ActiveSizeProvider expected to have ancestor SizeObserver with the provided name "${sizeObserver}", but couldn't find sizeObserver in react context`,
        );
      }
      throw new ReferenceError(
        `ActiveSizeProvider expected to have ancestor SizeObserver, but couldn't find sizeObserver in react context`,
      );
    }

    return children(activeSizeIndex, sizes as SizesConfig<TSizeName>);
  };
