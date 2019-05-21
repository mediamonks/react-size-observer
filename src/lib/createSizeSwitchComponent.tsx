import React, { PropsWithChildren, ReactNode } from 'react';
import defaultPackageConfig from './defaultPackageConfig';
import { LayoutSwitchProps, PackageConfig } from './types';

export default ({ useSizeObserverContext }: PackageConfig = defaultPackageConfig) =>
  function SizeSwitch<TSizeName extends string = string>({
    children,
    sizeObserver,
  }: PropsWithChildren<LayoutSwitchProps<TSizeName>>) {
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

    const sizeProps = React.Children.map(children, (child: any) => {
      if (!child.type) {
        throw new Error('Unable to read component type from children in SizeSwitch');
      } else if (!child.type.__isSizeComponent) {
        throw new Error(
          `Expected all children of SizeSwitch to be Size components. Got "${
            typeof child.type === 'string' ? child.type : child.type.displayName
          }"`,
        );
      }
      return child.props;
    });

    let targetSizeChildren: ReactNode = null;
    for (let i = 0; i < sizeProps.length; i++) {
      const layoutBreakpoint = sizes.findIndex(size => sizeProps[i][size.name]);

      if (layoutBreakpoint < 0 || activeSizeIndex >= layoutBreakpoint) {
        targetSizeChildren = sizeProps[i].children;
        break;
      }
    }

    if (!targetSizeChildren) {
      console.warn('SizeSwitch did not match any of the Layout children provided.');

      return null;
    }

    return typeof targetSizeChildren === 'function' ? (
      targetSizeChildren(activeSizeIndex, sizes)
    ) : (
      <>{targetSizeChildren}</>
    );
  };
